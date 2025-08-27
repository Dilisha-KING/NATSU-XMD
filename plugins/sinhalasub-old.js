const axios = require('axios');
const { cmd } = require('../command'); // ඔබේ bot base එකේ command handler එක

// Sinhalasub.lk API URL
const API_URL = 'https://sinhalasub.lk';

cmd({
    pattern: 'movie',
    desc: 'Get movie info and Sinhala subtitles',
    category: 'entertainment',
    filename: __filename
}, async (conn, mek, m, { text, reply }) => {
    try {
        if (!text) return reply('Please provide a movie name!');

        // API call to get movie details
        const res = await axios.get(`${API_URL}/search`, {
            params: { query: text }
        });

        if (!res.data || res.data.length === 0) return reply('Movie not found!');

        const movie = res.data[0]; // first result

        let message = `🎬 *${movie.title}*\n\n`;
        message += `📅 Release: ${movie.release}\n`;
        message += `⭐ Rating: ${movie.rating}\n`;
        message += `📄 Synopsis: ${movie.synopsis}\n`;
        message += `📝 Subtitles: ${movie.subtitle_url}\n`;

        reply(message);
    } catch (error) {
        console.log(error);
        reply('Something went wrong while fetching movie info.');
    }
});
