<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useExamStore } from "../stores/examStore";
import { getAllLocal } from "../offline/secureStorage";
import api from "../services/api";

const store = useExamStore();

const started = ref(false);
const timeLeft = ref(1800);
let timer: number | undefined;

const selected = ref<number | null>(null);

const violations = ref(0);
const maxViolations = 3;
const locked = ref(false);

const showModal = ref(false);
const modalText = ref("");
const modalType = ref<"success" | "error" | "info">("info");

const isPaused = ref(false);
const pauseReason = ref("");


const antiCheatActive = ref(false);

let visibilityChangeHandler: ((this: Document, ev: Event) => void) | null = null;

function openModal(text: string, type: "success" | "error" | "info" = "info") {
  modalText.value = text;
  modalType.value = type;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

/* ================= LOAD ================= */
onMounted(async () => {
  await store.loadQuestions();
  setupConnectionMonitoring();

});

onUnmounted(() => {
  removeAntiCheat();
  removeConnectionMonitoring();
  clearInterval(timer);
});

/* ================= SAFE QUESTION ================= */
const q = computed(() => {
  if (!store.questions.length) return null;
  if (store.currentIndex >= store.questions.length) return null;
  return store.questions[store.currentIndex];
});

const progress = computed(() => {
  return store.questions.length
    ? ((store.currentIndex + 1) / store.questions.length) * 100
    : 0;
});

const isLastQuestion = computed(() => {
  return store.currentIndex === store.questions.length - 1;
});

const canShowSubmit = computed(() => {
  return isLastQuestion.value && selected.value !== null;
});

/* ================= START ================= */
async function startExam() {
  if (!store.questions.length) {
    openModal("Questions not loaded. Refresh online first.", "error");
    return;
  }

  openModal("Checking connection...", "info");

  const hasInternet = await checkInternetConnection();

  if (hasInternet) {
    openModal("Turn OFF your internet connection before starting the exam.", "error");
    return;
  }

  closeModal();
  started.value = true;
  startTimer();

  setTimeout(() => {
    antiCheatActive.value = true;
    setupAntiCheat();
  }, 500);
}

// Real connectivity test — navigator.onLine is unreliable, especially on localhost
async function checkInternetConnection(): Promise<boolean> {
  try {
    // Bust cache with timestamp, expect failure if truly offline
    await fetch(
      `https://www.gstatic.com/generate_204?_=${Date.now()}`,
      { method: "HEAD", mode: "no-cors", cache: "no-store", signal: AbortSignal.timeout(3000) }
    );
    return true; // if fetch didn't throw, internet is available
  } catch {
    return false; // fetch threw = no internet
  }
}

/* ================= TIMER ================= */
function startTimer() {
  timer = setInterval(() => {
    if (!isPaused.value) {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        clearInterval(timer);
        pauseExam("Time is up! Connect to internet to submit.");
      }
    }
  }, 1000);
}

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return m + ":" + (s < 10 ? "0" + s : s);
}

/* ================= PAUSE/RESUME ================= */
function pauseExam(reason: string) {
  isPaused.value = true;
  pauseReason.value = reason;
  openModal(reason, "error");
}

function resumeExam() {
  isPaused.value = false;
  pauseReason.value = "";
  closeModal();
}

/* ================= OPTIONS ================= */
function pick(i: number) {
  if (isPaused.value || locked.value) return;
  selected.value = i;
}

/* ================= NAVIGATION ================= */
function next() {
  if (isPaused.value || locked.value) return;

  if (selected.value !== null) {
    store.submitAnswer(selected.value);
  }

  if (store.currentIndex < store.questions.length - 1) {
    store.currentIndex++;
    selected.value = null;
  }
}

function previous() {
  if (isPaused.value || locked.value) return;

  if (store.currentIndex > 0) {
    store.currentIndex--;
    selected.value = null;
  }
}

/* ================= SUBMIT ================= */
async function submitExam() {
  const hasInternet = await checkInternetConnection();

  if (locked.value && !hasInternet) {
    openModal("Turn ON internet to submit after violations.", "error");
    return;
  }

  if (!hasInternet) {
    openModal("Turn ON internet before submitting.", "error");
    return;
  }

  if (selected.value !== null) {
    store.submitAnswer(selected.value);
    selected.value = null;
  }

  try {
    const answers = getAllLocal();

    if (!answers.length) {
      openModal("No answers recorded.", "error");
      return;
    }

    clearInterval(timer);

    const res = await api.post("/answers/bulk", answers);

    if (res.status === 200 || res.status === 201) {
      openModal("Submitted successfully! Good luck.", "success");
      setTimeout(() => location.reload(), 2500);
    }
  } catch {
    openModal("Submission failed. Please try again.", "error");
  }
}

/* ================= CONNECTION MONITORING ================= */
async function handleOnline() {
  if (!started.value) return;

  // Double-check with real request — navigator.onLine fires false positives
  const reallyOnline = await checkInternetConnection();
  if (!reallyOnline) return;

  if (!locked.value) {
    pauseExam("Internet detected! Turn OFF internet to continue the exam.");
  }
}

function handleOffline() {
  if (!started.value) return;

  if (!locked.value && isPaused.value && pauseReason.value.includes("Internet detected")) {
    resumeExam();
  }
}

function setupConnectionMonitoring() {
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
}

function removeConnectionMonitoring() {
  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);
}

/* ================= ANTI CHEAT ================= */
function handleViolation() {

  if (!antiCheatActive.value || locked.value) return;

  violations.value++;

  if (violations.value >= maxViolations) {
    locked.value = true;
    antiCheatActive.value = false; // stop further violations once locked
    clearInterval(timer);
    openModal(
      "You left the exam window 3 times. Exam locked. Turn ON internet and submit now.",
      "error"
    );
  } else {
    openModal(
      `Warning: Do not leave the exam window. (${violations.value}/${maxViolations})`,
      "info"
    );
  }
}

function setupAntiCheat() {
  visibilityChangeHandler = () => {
    if (document.hidden) handleViolation();
  };
  document.addEventListener("visibilitychange", visibilityChangeHandler);
  window.addEventListener("blur", handleViolation);
}

function removeAntiCheat() {
  if (visibilityChangeHandler) {
    document.removeEventListener("visibilitychange", visibilityChangeHandler);
    visibilityChangeHandler = null;
  }
  window.removeEventListener("blur", handleViolation);
  antiCheatActive.value = false;
}
</script>

<template>
<div class="page">

  <!-- START SCREEN -->
  <div v-if="!started" class="start">
    <h1>Computer Based Test</h1>
    <p>Disconnect your internet before starting.</p>
    <button @click="startExam">Start Exam</button>
  </div>

  <!-- EXAM -->
  <div v-else-if="q" class="exam" :class="{paused: isPaused || locked}">

    <div class="header">
      <div>Question {{ store.currentIndex + 1 }} / {{ store.questions.length }}</div>
      <div class="timer" :class="{paused: isPaused}">
        {{ formatTime(timeLeft) }}
        <span v-if="isPaused" class="pause-indicator"> (PAUSED)</span>
      </div>
    </div>

    <div class="bar">
      <div class="fill" :style="{width: progress + '%'}"></div>
    </div>

    <div v-if="locked" class="lock-banner">
      Exam Locked — Turn ON internet and submit
    </div>

    <div v-if="isPaused && !locked" class="pause-banner">
      {{ pauseReason }}
    </div>

    <div class="question">{{ q.text }}</div>

    <div class="options">
      <button
        v-for="(o, i) in q.options"
        :key="i"
        @click="pick(i)"
        :class="{active: selected === i}"
        :disabled="isPaused || locked"
      >
        {{ o }}
      </button>
    </div>

    <div class="nav">
      <button
        class="prev"
        @click="previous"
        :disabled="store.currentIndex === 0 || isPaused || locked"
      >
        Previous
      </button>

      <button
        v-if="!isLastQuestion"
        class="next"
        @click="next"
        :disabled="isPaused || locked"
      >
        Next
      </button>

      <button
        v-if="canShowSubmit || locked"
        class="submit"
        @click="submitExam"
      >
        Submit
      </button>
    </div>

  </div>

  <!-- SAFETY FALLBACK -->
  <div v-else class="start">
    <h2>No question loaded</h2>
    <p>Reload the page while online.</p>
  </div>


  <div v-if="showModal" class="modal-overlay">
    <div class="modal" :class="modalType">
      <p>{{ modalText }}</p>

      <button @click="closeModal" v-if="!locked">OK</button>
    </div>
  </div>

</div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #eef2f7;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Arial;
}

.start {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,.1);
}

.exam {
  width: 820px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.1);
  position: relative;
}

.exam.paused {
  opacity: 0.7;
  pointer-events: none;
}

.header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}

.timer {
  color: #dc2626;
  font-size: 18px;
}

.timer.paused {
  color: #f59e0b;
}

.pause-indicator {
  font-size: 14px;
  font-weight: 700;
}

.bar {
  height: 8px;
  background: #ddd;
  border-radius: 4px;
  margin: 10px 0;
}

.fill {
  height: 100%;
  background: #2563eb;
  transition: width 0.3s;
}

.lock-banner, .pause-banner {
  background: #dc2626;
  color: white;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  margin: 15px 0;
}

.pause-banner {
  background: #f59e0b;
}

.question {
  font-size: 20px;
  margin: 20px 0;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.options button {
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
  transition: all 0.2s;
}

.options button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.options button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.nav {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  gap: 10px;
}

.nav button {
  padding: 12px 22px;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;
}

.nav button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev   { background: #6b7280; }
.next   { background: #2563eb; }
.submit { background: #16a34a; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 320px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,.3);
}

.modal.success { border-top: 6px solid #16a34a; }
.modal.error   { border-top: 6px solid #dc2626; }
.modal.info    { border-top: 6px solid #2563eb; }

.modal button {
  margin-top: 15px;
  padding: 10px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
