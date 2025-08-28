const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'zoommovie',
    desc: 'Search Zoom.lk movies and get download links + subtitles',
    category: 'movie',
    react: '🎬',
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args || args.length === 0) {
            return reply('ඔයා movie name එකක් දාන්න ඕනේ! \nUsage: zoommovie <movie name>');
        }

        const movieName = args.join(' ');

        // ===== Search API =====
        const searchApiUrl = `https://supun-md-api-xmjh.vercel.app/api/zoom-search?q=${encodeURIComponent(movieName)}`;
        const searchRes = await axios.get(searchApiUrl);

        if (!searchRes.data || searchRes.data.length === 0) {
            return reply(`කණගාටුයි, *${movieName}* සෙවුමෙන් result එකක් නොලැබුණා.`);
        }

        // Take the first search result
        const movie = searchRes.data[0];
        const movieURL = movie.url; // Zoom.lk movie URL from search API

        // ===== Download API =====
        const downloadApiUrl = `https://supun-md-api-xmjh.vercel.app/api/zoom-dl?url=${encodeURIComponent(movieURL)}`;
        const downloadRes = await axios.get(downloadApiUrl);

        if (!downloadRes.data || !downloadRes.data.downloadLinks || downloadRes.data.downloadLinks.length === 0) {
            return reply(`කණගාටුයි, *${movie.title}* download links ලබාගත නොහැක.`);
        }

        // Prepare message
        let message = `🎬 *${movie.title}* (${movie.year})\n\n`;

        // Download links
        downloadRes.data.downloadLinks.forEach((link, index) => {
            message += `${index + 1}. ${link.quality} - ${link.size}\n${link.url}\n`;
        });

        // Subtitles
        if (downloadRes.data.subtitles && downloadRes.data.subtitles.length > 0) {
            message += `\n💬 *Subtitles:*\n`;
            downloadRes.data.subtitles.forEach((sub, i) => {
                message += `${i + 1}. ${sub.language} - ${sub.url}\n`;
            });
        }

        reply(message);

    } catch (err) {
        console.error(err);
        reply('කණගාටුයි, movie details fetch / download links ලබාගන්න බැරි වුණා 😔');
    }
});
