const mongoose = require("mongoose");
require("./database/db");


const Question = require("./models/Question");

async function seed() {
  await Question.deleteMany({});

  await Question.insertMany([
    {
      id: 1,
      text: "What is 2 + 2?",
      options: ["3", "4", "5", "6"]
    },
    {
      id: 2,
      text: "Capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"]
    },
    {
      id: 3,
      text: "Which is a programming language?",
      options: ["HTML", "CSS", "JavaScript", "Photoshop"]
    }
  ]);

  console.log("Questions seeded successfully");
  mongoose.connection.close();
}

seed();
