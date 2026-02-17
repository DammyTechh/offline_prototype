const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

router.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find({}, {
      text: 1,
      options: 1
    }).lean();

    res.json(
      questions.map(q => ({
        id: q._id.toString(),
        text: q.text,
        options: q.options
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

module.exports = router;
