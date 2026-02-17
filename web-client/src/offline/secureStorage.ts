import CryptoJS from "crypto-js";
import type { Question } from "../types";

const KEY = "exam-secret-key";

/* ================= TYPES ================= */

export interface LocalAnswer {
  student_id: string;
  question_id: number;
  answer: number;
  source: string;
}

/* ================= ENCRYPT ================= */

function encrypt<T>(data: T): string {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    KEY
  ).toString();
}

/* ================= DECRYPT ================= */

function decrypt<T>(cipher: string): T {
  const bytes = CryptoJS.AES.decrypt(cipher, KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  if (!decrypted) {
    throw new Error("Decryption failed");
  }

  return JSON.parse(decrypted) as T;
}

/* ================= ANSWERS ================= */

export function saveAnswerLocal(answer: LocalAnswer): void {
  const existing = getAllLocal();
  existing.push(answer);

  const encrypted = encrypt(existing);
  localStorage.setItem("answers", encrypted);
}

export function getAllLocal(): LocalAnswer[] {
  const stored = localStorage.getItem("answers");
  if (!stored) return [];

  try {
    return decrypt<LocalAnswer[]>(stored);
  } catch {
    return [];
  }
}

export function clearLocal(): void {
  localStorage.removeItem("answers");
}

/* ================= QUESTIONS (Offline Cache) ================= */

export function saveQuestionsLocal(questions: Question[]): void {
  const encrypted = encrypt(questions);
  localStorage.setItem("questions", encrypted);
}

export function getQuestionsLocal(): Question[] {
  const stored = localStorage.getItem("questions");
  if (!stored) return [];

  try {
    return decrypt<Question[]>(stored);
  } catch {
    return [];
  }
}
