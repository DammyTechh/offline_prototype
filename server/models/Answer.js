const mongoose = require("../database/db");

const AnswerSchema = new mongoose.Schema({
  student_id: String,

  // store Mongo question ObjectId
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  },

  answer: String,
  timestamp: Number
});

module.exports = mongoose.model("Answer", AnswerSchema);
