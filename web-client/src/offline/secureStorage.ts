import CryptoJS from "crypto-js";

const KEY = "exam-secret-key";

export interface LocalAnswer {
  student_id: string;
  question_id: number;
  answer: number;
  source: string;
}


function encrypt(data: unknown): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), KEY).toString();
}

function decrypt<T>(cipher: string): T {
  const bytes = CryptoJS.AES.decrypt(cipher, KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as T;
}

/* Save Answer */
export function saveAnswerLocal(answer: LocalAnswer): void {
  const existing = getAllLocal();
  existing.push(answer);

  const encrypted = encrypt(existing);
  localStorage.setItem("answers", encrypted);
}

/* Get All Answers */
export function getAllLocal(): LocalAnswer[] {
  const stored = localStorage.getItem("answers");
  if (!stored) return [];

  return decrypt<LocalAnswer[]>(stored);
}

export function clearLocal(): void {
  localStorage.removeItem("answers");
}
