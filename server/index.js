const express = require("express");
const cors = require("cors");

require("./db");
require("./websocket");

const examRoutes = require("./routes/exam");
const answerRoutes = require("./routes/answers");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/exam", examRoutes);
app.use("/answers", answerRoutes);

app.listen(3000, () => {
  console.log("Exam server running on http://localhost:3000");
});
