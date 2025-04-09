require("dotenv").config();
const { OpenAI } = require("openai");
const ProductModel = require("../models/product");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chatWithGPT = async (req, res) => {
  try {
    const question = (req.body.question || "").trim();
    if (!question) return res.status(400).json({ error: "Missing question" });

    const products = await ProductModel.find();
    if (!products.length) {
      return res.json({ answer: "לא נמצאו מוצרים בחנות." });
    }

    const productList = products.map((p) => {
      return `
Name: ${p.Pname}
Price: ${p.Price}
Description: ${p.Pdesc}
Image: ${p.picname}
ID: ${p._id}`;
    }).join("\n\n---\n\n");

    const prompt = `
You are a smart AI assistant helping a user pick a product from a tech store.

The user said: "${question}"

Here are the products:
${productList}

Pick the ONE best matching product. Reply ONLY in this JSON format:
{
  "name": "",
  "price": 0,
  "description": "",
  "image": "",
  "productId": ""
}

Always pick something. Do NOT say "no match". Even if it's not perfect, recommend the closest option.
Respond only in JSON.`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const gptReply = completion.choices[0].message.content;
    console.log("🔁 GPT RAW RESPONSE:\n", gptReply);

    let parsed;
    try {
      parsed = JSON.parse(gptReply);
    } catch (err) {
      return res.json({ answer: "שגיאה בעיבוד תשובת הבוט.", debug: gptReply });
    }

    res.json({
      product: {
        _id: parsed.productId, // 👈 important for product link & addToCart
        name: parsed.name,
        description: parsed.description,
        price: parsed.price,
        image: parsed.image
      }
    });
    
  } catch (error) {
    console.error("GPT Controller Error:", error);
    res.status(500).json({ error: "AI failed to respond." });
  }
};

module.exports = { chatWithGPT };
