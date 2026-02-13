const mongoose = require("../database/db");

const AnswerSchema = new mongoose.Schema({
  student_id: String,
  question_id: Number,
  answer: String, 
  timestamp: Number
});

module.exports = mongoose.model("Answer", AnswerSchema);
