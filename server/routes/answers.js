const express = require("express");
const router = express.Router();

const Answer = require("../models/Answer");
const { encrypt } = require("../utils/crypto");

router.post("/bulk", async (req, res) => {
  try {
    const answers = req.body;

    for (const a of answers) {
      await Answer.updateOne(
        {
          student_id: a.student_id,
          question_id: a.question_id
        },
        {
          student_id: a.student_id,
          question_id: a.question_id,
          answer: encrypt(String(a.answer)),
          timestamp: a.timestamp || Date.now()
        },
        { upsert: true }
      );
    }

    res.json({ status: "synced" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
