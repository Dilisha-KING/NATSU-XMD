const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'zoommovie',
    desc: 'Search Zoom.lk movies and get top 3 download links + subtitles',
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

        // Take top 3 results
        const movies = searchRes.data.slice(0, 3);

        let message = `🎬 *Search results for:* ${movieName}\n\n`;

        for (let i = 0; i < movies.length; i++) {
            const movie = movies[i];
            message += `*${i + 1}. ${movie.title}* (${movie.year})\n`;

            // ===== Download API =====
            const downloadApiUrl = `https://supun-md-api-xmjh.vercel.app/api/zoom-dl?url=${encodeURIComponent(movie.url)}`;
            try {
                const downloadRes = await axios.get(downloadApiUrl);

                if (downloadRes.data && downloadRes.data.downloadLinks && downloadRes.data.downloadLinks.length > 0) {
                    downloadRes.data.downloadLinks.forEach((link, index) => {
                        message += `${index + 1}. ${link.quality} - ${link.size}\n${link.url}\n`;
                    });
                } else {
                    message += '❌ Download links not available.\n';
                }

                if (downloadRes.data && downloadRes.data.subtitles && downloadRes.data.subtitles.length > 0) {
                    message += `💬 Subtitles:\n`;
                    downloadRes.data.subtitles.forEach((sub, j) => {
                        message += `${j + 1}. ${sub.language} - ${sub.url}\n`;
                    });
                }

            } catch (err) {
                console.error(err);
                message += '❌ Error fetching download links.\n';
            }

            message += '\n';
        }

        reply(message);

    } catch (err) {
        console.error(err);
        reply('කණගාටුයි, movie search / download fetch කරන්න බැරි වුණා 😔');
    }
});
