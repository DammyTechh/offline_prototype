const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.get("/questions", (req, res) => {
  db.all("SELECT * FROM questions", [], (err, rows) => {
    if (err) return res.status(500).json(err);

    const formatted = rows.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options.split(",")
    }));

    res.json(formatted);
  });
});

module.exports = router;
