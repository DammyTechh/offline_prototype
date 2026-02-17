const mongoose = require("../database/db");

const QuestionSchema = new mongoose.Schema({
  text: String,
  options: [String],
  correct_answer: Number
});

module.exports = mongoose.model("Question", QuestionSchema);
