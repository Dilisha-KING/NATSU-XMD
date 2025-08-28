const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'zoommovie',
    desc: 'Search Zoom.lk movie by name and get download links + subtitles',
    category: 'movie',
    react: '🎬',
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args || args.length === 0) {
            return reply('ඔයා movie එකේ නමක් දාන්න ඕනේ! \nUsage: zoommovie <movie name>');
        }

        const movieName = args.join(' ');

        // ===== Auto-generate Zoom.lk URL =====
        // Replace spaces with '-' and lowercase for typical Zoom.lk format
        const zoomSlug = movieName.toLowerCase().replace(/\s+/g, '-');
        const zoomURL = `https://zoom.lk/${zoomSlug}`;
        // ====================================

        // Supun MD API
        const apiUrl = `https://supun-md-api-xmjh.vercel.app/api/zoom-dl?url=${encodeURIComponent(zoomURL)}`;

        const res = await axios.get(apiUrl);

        if (!res.data || !res.data.downloadLinks || res.data.downloadLinks.length === 0) {
            return reply(`කණගාටුයි, *${movieName}* download links ලබාගත නොහැක.`);
        }

        let message = `🎬 *Zoom.lk Movie:* ${movieName}\n\n`;

        // Download links
        res.data.downloadLinks.forEach((link, index) => {
            message += `${index + 1}. ${link.quality} - ${link.size}\n${link.url}\n`;
        });

        // Subtitles
        if (res.data.subtitles && res.data.subtitles.length > 0) {
            message += `\n💬 *Subtitles:*\n`;
            res.data.subtitles.forEach((sub, i) => {
                message += `${i + 1}. ${sub.language} - ${sub.url}\n`;
            });
        }

        reply(message);

    } catch (err) {
        console.error(err);
        reply('කණගාටුයි, movie details fetch කරන්න බැරි වුණා 😔');
    }
});
