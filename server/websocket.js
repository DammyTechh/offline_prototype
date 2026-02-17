const WebSocket = require("ws");
const { randomUUID } = require("crypto");
const Answer = require("./models/Answer");
const { encrypt } = require("./utils/crypto");

const wss = new WebSocket.Server({ port: 9001 });

console.log("Slate WS running on ws://localhost:9001");

wss.on("connection", ws => {
  ws.on("message", async message => {
    const data = JSON.parse(message);

    const detectedAnswer = Math.floor(Math.random() * 4);

    await Answer.create({
      student_id: data.student_id,
      question_id: data.question_id,
      answer: encrypt(String(detectedAnswer)),
      timestamp: Date.now()
    });

    console.log("Slate answer saved");
  });
});
