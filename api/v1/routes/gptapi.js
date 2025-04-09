// routes/gptapi.js
const express = require("express");
const router = express.Router();
const { chatWithGPT } = require("../controllers/gptapi");

// 🤖 AI Chat Route - receives a product-related question and responds with a best match
router.post("/chat-ai", chatWithGPT);

module.exports = router;
