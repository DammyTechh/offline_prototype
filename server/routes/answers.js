const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Answer = require("../models/Answer");
const { encrypt } = require("../utils/crypto");

/* ================= BULK SUBMIT ================= */
router.post("/bulk", async (req, res) => {
  try {
    const answers = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const ops = answers.map(a => ({
      updateOne: {
        filter: {
          student_id: a.student_id,
          question_id: new mongoose.Types.ObjectId(a.question_id)
        },
        update: {
          student_id: a.student_id,
          question_id: new mongoose.Types.ObjectId(a.question_id),
          answer: encrypt(String(a.answer)),
          timestamp: a.timestamp || Date.now()
        },
        upsert: true
      }
    }));

    await Answer.bulkWrite(ops);

    res.json({ status: "synced" });

  } catch (err) {
    console.error("Bulk submission error:", err);
    res.status(500).json({ error: "Bulk submit failed" });
  }
});

/* ================= SINGLE SUBMIT ================= */
router.post("/", async (req, res) => {
  try {
    const a = req.body;

    if (!a.student_id || !a.question_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await Answer.updateOne(
      {
        student_id: a.student_id,
        question_id: new mongoose.Types.ObjectId(a.question_id)
      },
      {
        student_id: a.student_id,
        question_id: new mongoose.Types.ObjectId(a.question_id),
        answer: encrypt(String(a.answer)),
        timestamp: a.timestamp || Date.now()
      },
      { upsert: true }
    );

    res.json({ status: "saved" });

  } catch (err) {
    console.error("Single submission error:", err);
    res.status(500).json({ error: "Submit failed" });
  }
});

module.exports = router;
