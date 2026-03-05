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
  { id: 20, text: "What is 50 - 25?", options: ["20", "25", "30", "35"] },

  { id: 21, text: "Which operator is used for equality check in JS?", options: ["=", "==", "===", "!="] },
  { id: 22, text: "What is 6 x 7?", options: ["36", "42", "48", "52"] },
  { id: 23, text: "Which one is a backend framework?", options: ["React", "Angular", "Express", "Vue"] },
  { id: 24, text: "What is 90 / 3?", options: ["20", "25", "30", "35"] },
  { id: 25, text: "Which HTTP method is used to create data?", options: ["GET", "POST", "PUT", "DELETE"] },
  { id: 26, text: "What is 8 + 12?", options: ["18", "19", "20", "21"] },
  { id: 27, text: "Which is a version control system?", options: ["Git", "Docker", "NPM", "Node"] },
  { id: 28, text: "What is 14 x 2?", options: ["24", "26", "28", "30"] },
  { id: 29, text: "Which command installs packages in Node.js?", options: ["node install", "npm install", "npm start", "node run"] },
  { id: 30, text: "What is 64 / 8?", options: ["6", "7", "8", "9"] },

  { id: 31, text: "Which keyword is used for function in JS?", options: ["function", "func", "def", "method"] },
  { id: 32, text: "What is 3 x 15?", options: ["30", "35", "40", "45"] },
  { id: 33, text: "Which port does HTTP use by default?", options: ["21", "80", "443", "3000"] },
  { id: 34, text: "What is 200 / 10?", options: ["10", "15", "20", "25"] },
  { id: 35, text: "Which one is a frontend library?", options: ["Django", "Laravel", "React", "Spring"] },
  { id: 36, text: "What is 11 + 22?", options: ["31", "32", "33", "34"] },
  { id: 37, text: "Which file stores Node.js project dependencies?", options: ["index.js", "package.json", "server.js", "config.js"] },
  { id: 38, text: "What is 13 x 3?", options: ["36", "37", "38", "39"] },
  { id: 39, text: "Which protocol is secure HTTP?", options: ["FTP", "SMTP", "HTTPS", "TCP"] },
  { id: 40, text: "What is 144 / 12?", options: ["10", "11", "12", "13"] },

  { id: 41, text: "Which method starts an Express server?", options: ["app.listen()", "app.start()", "server.run()", "node.listen()"] },
  { id: 42, text: "What is 9 + 10?", options: ["18", "19", "20", "21"] },
  { id: 43, text: "Which tool is used for API testing?", options: ["Postman", "GitHub", "VSCode", "Chrome"] },
  { id: 44, text: "What is 5 x 9?", options: ["40", "45", "50", "55"] },
  { id: 45, text: "Which one is a CSS framework?", options: ["Bootstrap", "Express", "MongoDB", "Node"] },
  { id: 46, text: "What is 100 - 45?", options: ["45", "50", "55", "60"] },
  { id: 47, text: "Which function converts object to JSON?", options: ["JSON.parse()", "JSON.stringify()", "JSON.object()", "JSON.make()"] },
  { id: 48, text: "What is 16 / 4?", options: ["2", "3", "4", "5"] },
  { id: 49, text: "Which company developed JavaScript?", options: ["Microsoft", "Netscape", "Google", "IBM"] },
  { id: 50, text: "What is 20 x 5?", options: ["80", "90", "100", "120"] }
  ]);

  console.log("Questions seeded successfully");
  mongoose.connection.close();
}

seed();
