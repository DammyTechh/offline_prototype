import { defineStore } from "pinia";
import api from "../services/api";

import {
  saveAnswerLocal,
  getAllLocal,
  clearLocal
} from "../offline/secureStorage";

import type { LocalAnswer } from "../offline/secureStorage";
import type { Question } from "../types";

export const useExamStore = defineStore("exam", {
  state: () => ({
    questions: [] as Question[],
    currentIndex: 0
  }),

  actions: {
    /* LOAD QUESTIONS */
    async loadQuestions() {
      const res = await api.get<Question[]>("/exam/questions");
      this.questions = res.data;
    },

    /* SAVE ANSWER OFFLINE */
    submitAnswer(i: number) {
      const q = this.questions[this.currentIndex];
      if (!q) return;

      const payload: LocalAnswer = {
        student_id: "student1",
        question_id: q.id,
        answer: i,
        source: "offline"
      };

      saveAnswerLocal(payload);

      this.currentIndex++;
    },

    /* SYNC WHEN ONLINE */
    async syncAnswers() {
      const answers = getAllLocal();

      if (!answers.length) return;

      try {
        await api.post("/answers/bulk", answers);

        clearLocal();

        console.log("Synced successfully");
      } catch (err) {
        console.log("Sync failed", err);
      }
    }
  }
});
