const axios = require('axios');
const { cmd } = require('../command');

let movieSelections = {}; // selections cache

cmd({
    pattern: "movie",
    desc: "Fetch multiple movies from IMDb and download links",
    category: "utility",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        const movieName = args.length > 0 ? args.join(' ') : m.text.replace(/^[\.\#\$\!]?movie\s?/i, '').trim();
        
        if (!movieName) {
            return reply("📽️ Please provide the name of the movie.\nExample: .movie Iron Man");
        }

        const apiUrl = `https://supun-md-api-xmjh.vercel.app/api/zoom-search?q=${encodeURIComponent(movieName)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.results || response.data.results.length === 0) {
            return reply("🚫 Movie not found. Please check the name and try again.");
        }

        const movies = response.data.results.slice(0, 8);
        let listText = `🎬 *Movies Found for:* ${movieName}\n\n`;
        movies.forEach((mv, i) => {
            listText += `${i + 1}. ${mv.title} (${mv.year})\n`;
        });
        listText += `\n👉 Reply with numbers (ex: 1,3,5) to get details & download links`;

        movieSelections[from] = movies; // save user’s movie list
        await reply(listText);

    } catch (e) {
        console.error('Movie command error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Listen for replies
cmd({
    on: "text"  // global listener
}, async (conn, mek, m, { from, reply, body }) => {
    try {
        if (!movieSelections[from]) return; // no movie list waiting

        const selections = body.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (selections.length === 0) return;

        const movies = movieSelections[from];
        delete movieSelections[from]; // clear after use

        for (let n of selections) {
            const movie = movies[n - 1];
            if (!movie) continue;

            const infoUrl = `https://supun-md-api-xmjh.vercel.app/api/zoom-dl?url=${encodeURIComponent(movie.title)}`;
            const infoRes = await axios.get(infoUrl);
            const mv = infoRes.data.movie;

            const caption = `
🎬 *${mv.title}* (${mv.year})

⭐ *IMDB:* ${mv.imdbRating || 'N/A'}
📅 *Released:* ${mv.released}
⏳ *Runtime:* ${mv.runtime}
🎭 *Genre:* ${mv.genres}
📝 *Plot:* ${mv.plot}

🎥 *Director:* ${mv.director}
🌟 *Actors:* ${mv.actors}

🔗 *Download:* https://archive.org/download/${encodeURIComponent(mv.title.replace(/\s+/g, "_"))}.mp4
[IMDB Link](${mv.imdbUrl})
`;

            await conn.sendMessage(from, {
                image: { url: mv.poster && mv.poster !== 'N/A' ? mv.poster : 'https://files.catbox.moe/m5drmn.png' },
                caption,
            }, { quoted: mek });
        }
    } catch (err) {
        console.error("Reply handler error:", err);
    }
});
