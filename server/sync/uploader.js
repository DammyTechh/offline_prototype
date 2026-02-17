const Answer = require("../models/Answer");

async function syncToCloud() {
  const answers = await Answer.find();

  console.log("Syncing answers to cloud…");
  console.log(answers);
}

module.exports = syncToCloud;
