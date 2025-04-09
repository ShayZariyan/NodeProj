require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent("Say hello from Shay's AI store.");
    const text = await result.response.text();

    console.log("✅ Gemini SDK Response:", text);
  } catch (error) {
    console.error("❌ Gemini SDK Error:", error.message || error);
  }
}

test();
