const { cmd } = require('../command');
const axios = require("axios");

const GEMINI_KEY = "AIzaSyATam-2wKcvX68h-1KBBppEqhy4Iz3QhdQ"; // <-- ඔයාගේ Key

cmd({
    pattern: "ai",
    alias: ["gpt", "gemini"],
    desc: "Chat with AI",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ කරුණාකර ප්‍රශ්නයක් හෝ අදහසක් දාන්න...\n\nඋදා: .ai මට Joke එකක් කියන්න");

        // Gemini API request
        let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`;
        let { data } = await axios.post(url, {
            contents: [{ parts: [{ text: q }] }]
        }, {
            headers: { "Content-Type": "application/json" }
        });

        let aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ මට reply එකක් ගන්න බැරි උනා.";
        reply(`🤖 AI:\n${aiReply}`);

    } catch (e) {
        console.error(e);
        reply("⚠️ Error: " + e.message);
    }
});
