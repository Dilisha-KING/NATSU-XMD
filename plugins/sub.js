const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'zoommovie',
    desc: 'Get multiple Zoom.lk movies download links with Sinhala subtitles',
    category: 'movie',
    react: '🎬',
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args || args.length === 0) {
            return reply('ඔයා Zoom.lk movie URL එක/URL ලැයිස්තුවක් දාන්න ඕනේ!\nUsage: zoommovie <url1> [url2] [url3] ...');
        }

        const movieURLs = args; // Array of URLs

        let message = `🎬 *Zoom.lk Movie Links*\n\n`;

        for (let i = 0; i < movieURLs.length; i++) {
            const movieURL = movieURLs[i];
            message += `🔗 Movie ${i + 1}: ${movieURL}\n`;

            // Supun MD API call
            const apiUrl = `https://supun-md-api-xmjh.vercel.app/api/zoom-dl?url=${encodeURIComponent(movieURL)}`;

            try {
                const res = await axios.get(apiUrl);

                if (!res.data || !res.data.downloadLinks || res.data.downloadLinks.length === 0) {
                    message += '❌ Download links not found.\n\n';
                    continue;
                }

                // Download links
                res.data.downloadLinks.forEach((link, index) => {
                    message += `${index + 1}. ${link.quality} - ${link.size}\n${link.url}\n`;
                });

                // Subtitles
                if (res.data.subtitles && res.data.subtitles.length > 0) {
                    message += `💬 Subtitles:\n`;
                    res.data.subtitles.forEach((sub, i) => {
                        message += `${i + 1}. ${sub.language} - ${sub.url}\n`;
                    });
                }

                message += `\n`;

            } catch (err) {
                console.error(err);
                message += '❌ Error fetching this movie.\n\n';
            }
        }

        reply(message);

    } catch (err) {
        console.error(err);
        reply('කණගාටුයි, movies fetch කරන්න බැරි වුණා 😔');
    }
});
