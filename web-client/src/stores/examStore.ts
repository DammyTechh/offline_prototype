import { defineStore } from "pinia";
import api from "../services/api";

import {
  saveAnswerLocal,
  getAllLocal,
  clearLocal,
  saveQuestionsLocal,
  getQuestionsLocal
} from "../offline/secureStorage";

import type { LocalAnswer } from "../offline/secureStorage";
import type { Question } from "../types";

export const useExamStore = defineStore("exam", {
  state: () => ({
    questions: [] as Question[],
    currentIndex: 0,
    loading: false
  }),

  actions: {
    /* ================= LOAD QUESTIONS ================= */
    async loadQuestions() {
      this.loading = true;

      try {
        // Try loading from server
        const res = await api.get<Question[]>("/exam/questions");

        this.questions = res.data;

        // Save offline copy
        saveQuestionsLocal(res.data);

      } catch (error) {
        console.log("Server unavailable. Loading offline copy...");

        const cached = getQuestionsLocal();

        if (cached.length) {
          this.questions = cached;
        } else {
          console.error("No offline questions available");
        }
      }

      this.loading = false;
    },

    submitAnswer(selectedIndex: number) {
      const q = this.questions[this.currentIndex];
      if (!q) return;

      const payload: LocalAnswer = {
        student_id: "student1",
        question_id: q.id,
        answer: selectedIndex,
        source: navigator.onLine ? "online" : "offline"
      };

      saveAnswerLocal(payload);
      this.currentIndex++;
    },

    
    async syncAnswers() {
      const answers = getAllLocal();

      if (!answers.length) return;

      try {
        await api.post("/answers/bulk", answers);

        clearLocal();

        console.log("Synced successfully");

      } catch (error) {
        console.log("Sync failed", error);
      }
    }
  }
});
