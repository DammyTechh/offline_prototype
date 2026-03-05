const mongoose = require("mongoose");
require("./database/db");


const Question = require("./models/Question");

async function seed() {
  await Question.deleteMany({});

  await Question.insertMany([
  { id: 1, text: "What is 2 + 2?", options: ["3", "4", "5", "6"] },
  { id: 2, text: "Capital of France?", options: ["London", "Berlin", "Paris", "Madrid"] },
  { id: 3, text: "Which is a programming language?", options: ["HTML", "CSS", "JavaScript", "Photoshop"] },
  { id: 4, text: "What is 10 / 2?", options: ["2", "5", "10", "20"] },
  { id: 5, text: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Saturn"] },
  { id: 6, text: "What is 5 x 6?", options: ["11", "30", "25", "35"] },
  { id: 7, text: "Which data type is used for text in JavaScript?", options: ["Number", "Boolean", "String", "Object"] },
  { id: 8, text: "What is the square root of 81?", options: ["7", "8", "9", "10"] },
  { id: 9, text: "Which company developed Node.js?", options: ["Google", "Microsoft", "Facebook", "Ryan Dahl"] },
  { id: 10, text: "What is 15 - 7?", options: ["6", "7", "8", "9"] },

  { id: 11, text: "Which symbol is used for comments in JavaScript?", options: ["//", "##", "<!--", "**"] },
  { id: 12, text: "What is 9 x 9?", options: ["72", "81", "99", "90"] },
  { id: 13, text: "Which HTML tag is used for links?", options: ["<p>", "<a>", "<div>", "<span>"] },
  { id: 14, text: "What is 100 / 4?", options: ["20", "25", "30", "40"] },
  { id: 15, text: "Which keyword declares a variable in JavaScript?", options: ["var", "int", "define", "dim"] },
  { id: 16, text: "What is 7 + 8?", options: ["14", "15", "16", "17"] },
  { id: 17, text: "Which method converts JSON to object?", options: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.toObject()"] },
  { id: 18, text: "What is 12 x 12?", options: ["124", "144", "132", "154"] },
  { id: 19, text: "Which database is NoSQL?", options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"] },
  { id: 20, text: "What is 50 - 25?", options: ["20", "25", "30", "35"] }
  ]);

  console.log("Questions seeded successfully");
  mongoose.connection.close();
}

seed();
