const Answer = require("../models/Answer");
const Question = require("../models/Question");
const { decrypt } = require("../utils/crypto");

async function gradeStudent(student_id) {
  const answers = await Answer.find({ student_id });

  let score = 0;

  for (const a of answers) {
    const q = await Question.findById(a.question_id);

    if (!q) continue;

    const decrypted = Number(decrypt(a.answer));

    if (decrypted === q.correct_answer) {
      score++;
    }
  }

  return score;
}

module.exports = gradeStudent;
