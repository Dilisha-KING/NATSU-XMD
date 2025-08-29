const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "tvshow",
  alias: ["tv", "series"],
  react: "📺",
  desc: "Search TV shows with Sinhala subtitles, get info & download links",
  category: "entertainment",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    if (!match) {
      return await client.sendMessage(from, {
        text: "*🍁 Please provide a TV show name!*"
      }, { quoted: message });
    }

    const query = encodeURIComponent(match);

    // Search API
    const searchRes = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub-tvshow2/search?q=${query}`);
    const shows = searchRes.data;

    if (!shows || shows.length === 0) {
      return await client.sendMessage(from, {
        text: "❌ No TV shows found for your query."
      }, { quoted: message });
    }

    // Take first result
    const show = shows[0];
    const showUrl = encodeURIComponent(show.url);

    // Show Info API
    const infoRes = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub-tvshow2/info?url=${showUrl}`);
    const info = infoRes.data;

    // Download Links API
    const dlRes = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub-tvshow2/dl?url=${showUrl}`);
    const downloadLinks = dlRes.data;

    const responseText = `
📺 *Title:* ${info.title}
📝 *Description:* ${info.description || "N/A"}
📅 *Year:* ${info.year}
🎞️ *Language:* ${info.language}
🔗 *Download Links:*
${downloadLinks.map((link, index) => `${index + 1}. ${link}`).join("\n")}
`;

    await client.sendMessage(from, { text: responseText }, { quoted: message });

  } catch (error) {
    console.error("SinhalaSub TV Show Plugin Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching TV show info:\n" + error.message
    }, { quoted: message });
  }
});
