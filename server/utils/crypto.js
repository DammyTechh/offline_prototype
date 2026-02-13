const crypto = require("crypto");

const KEY = crypto
  .createHash("sha256")
  .update("super-secret-key")
  .digest();

exports.encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);

  let enc = cipher.update(text, "utf8", "hex");
  enc += cipher.final("hex");

  return iv.toString("hex") + ":" + enc;
};

exports.decrypt = (data) => {
  const [ivHex, enc] = data.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);

  let dec = decipher.update(enc, "hex", "utf8");
  dec += decipher.final("utf8");

  return dec;
};
