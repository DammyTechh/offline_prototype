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

const showModal = ref(false);
const modalText = ref("");
const modalType = ref<"success" | "error" | "info">("info");

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
  setupAntiCheat();
});

onUnmounted(() => {
  removeAntiCheat();
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

/* ================= START ================= */
function startExam() {
  if (!store.questions.length) {
    openModal("Questions not loaded. Refresh online first.", "error");
    return;
  }

  if (navigator.onLine) {
    openModal("Turn OFF internet before starting exam", "error");
    return;
  }

  started.value = true;
  startTimer();
}

/* ================= TIMER ================= */
function startTimer() {
  timer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearInterval(timer);
      openModal("Time is up! Connect internet to submit.", "info");
    }
  }, 1000);
}

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return m + ":" + (s < 10 ? "0" + s : s);
}

/* ================= OPTIONS ================= */
function pick(i: number) {
  selected.value = i;
}

/* ================= NAVIGATION ================= */
function next() {
  if (selected.value === null) {
    openModal("Select an option first", "error");
    return;
  }

  store.submitAnswer(selected.value);
  selected.value = null;
}

function previous() {
  if (store.currentIndex > 0) {
    store.currentIndex--;
  }
}

/* ================= SUBMIT ================= */
async function submitExam() {
  if (selected.value !== null) {
    store.submitAnswer(selected.value);
    selected.value = null;
  }

  if (!navigator.onLine) {
    openModal("Turn ON internet before submitting", "error");
    return;
  }

  try {
    const answers = getAllLocal();

    if (!answers.length) {
      openModal("No answers recorded", "error");
      return;
    }

    clearInterval(timer);

    const res = await api.post("/answers/bulk", answers);

    if (res.status === 200 || res.status === 201) {
      openModal("Submitted successfully! Good luck", "success");
      setTimeout(() => location.reload(), 2500);
    }
  } catch {
    openModal("Submission failed. Try again.", "error");
  }
}

/* ================= ANTI CHEAT ================= */
function handleViolation() {
  if (!started.value) return;

  violations.value++;

  if (violations.value >= maxViolations) {
    openModal(
      "You minimized/tab-switched 3 times. Turn ON internet and submit now.",
      "error"
    );
    clearInterval(timer);
  } else {
    openModal(
      `Warning: Do not leave exam window (${violations.value}/${maxViolations})`,
      "info"
    );
  }
}

function setupAntiCheat() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) handleViolation();
  });

  window.addEventListener("blur", handleViolation);
}

function removeAntiCheat() {
  window.removeEventListener("blur", handleViolation);
}
</script>

<template>
<div class="page">

  <!-- START SCREEN -->
  <div v-if="!started" class="start">
    <h1>Computer Based Test</h1>
    <p>Disconnect internet before starting.</p>
    <button @click="startExam">Start Exam</button>
  </div>

  <!-- EXAM -->
  <div v-else-if="q" class="exam">

    <div class="header">
      <div>
        Question {{store.currentIndex+1}} /
        {{store.questions.length}}
      </div>
      <div class="timer">{{formatTime(timeLeft)}}</div>
    </div>

    <div class="bar">
      <div class="fill" :style="{width:progress+'%'}"></div>
    </div>

    <div class="question">{{q.text}}</div>

    <div class="options">
      <button
        v-for="(o,i) in q.options"
        :key="i"
        @click="pick(i)"
        :class="{active:selected===i}"
      >
        {{o}}
      </button>
    </div>

    <div class="nav">
      <button class="prev" @click="previous" :disabled="store.currentIndex===0">
        Previous
      </button>

      <button class="next" @click="next">
        Next
      </button>

      <button class="submit" @click="submitExam">
        Submit
      </button>
    </div>

  </div>

  <!-- SAFETY FALLBACK -->
  <div v-else class="start">
    <h2>No question loaded</h2>
    <p>Reload page while online.</p>
  </div>

  <!-- MODAL -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal" :class="modalType">
      <p>{{modalText}}</p>
      <button @click="closeModal">OK</button>
    </div>
  </div>

</div>
</template>

<style scoped>
.page{
  min-height:100vh;
  background:#eef2f7;
  display:flex;
  justify-content:center;
  align-items:center;
  font-family:Arial;
}

.start{
  background:white;
  padding:40px;
  border-radius:12px;
  text-align:center;
  box-shadow:0 10px 30px rgba(0,0,0,.1);
}

.exam{
  width:820px;
  background:white;
  padding:30px;
  border-radius:12px;
  box-shadow:0 10px 30px rgba(0,0,0,.1);
}

.header{
  display:flex;
  justify-content:space-between;
  font-weight:600;
}

.timer{
  color:#dc2626;
  font-size:18px;
}

.bar{
  height:8px;
  background:#ddd;
  border-radius:4px;
  margin:10px 0;
}

.fill{
  height:100%;
  background:#2563eb;
}

.question{
  font-size:20px;
  margin:20px 0;
}

.options{
  display:flex;
  flex-direction:column;
  gap:12px;
}

.options button{
  padding:14px;
  border-radius:8px;
  border:1px solid #ccc;
  cursor:pointer;
}

.options button.active{
  background:#2563eb;
  color:white;
}

.nav{
  display:flex;
  justify-content:space-between;
  margin-top:25px;
}

.nav button{
  padding:12px 22px;
  border:none;
  border-radius:8px;
  color:white;
  cursor:pointer;
}

.prev{ background:#6b7280; }
.next{ background:#2563eb; }
.submit{ background:#16a34a; }

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.4);
  display:flex;
  justify-content:center;
  align-items:center;
}

.modal{
  background:white;
  padding:30px;
  border-radius:12px;
  width:320px;
  text-align:center;
}

.modal.success{ border-top:6px solid #16a34a; }
.modal.error{ border-top:6px solid #dc2626; }
.modal.info{ border-top:6px solid #2563eb; }
</style>
