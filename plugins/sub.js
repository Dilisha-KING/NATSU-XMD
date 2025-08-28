const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'zoom',
    desc: 'Search Zoom.lk movies and get download links + subtitles (debug version)',
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
        console.log(`🔎 Searching movie: ${movieName}`);
        const searchRes = await axios.get(searchApiUrl);

        console.log('📝 Search API Response:', searchRes.data);

        if (!searchRes.data || searchRes.data.length === 0) {
            return reply(`කණගාටුයි, *${movieName}* සෙවුමෙන් result එකක් නොලැබුණා.`);
        }

        // Take top 1 result
        const movie = searchRes.data[0];
        const movieURL = movie.url; // exact Zoom.lk URL from search API

        console.log(`🔗 Selected movie URL: ${movieURL}`);

        // ===== Download API =====
        const downloadApiUrl = `https://supun-md-api-xmjh.vercel.app/api/zoom-dl?url=${encodeURIComponent(movieURL)}`;
        console.log(`⬇️ Download API URL: ${downloadApiUrl}`);

        const downloadRes = await axios.get(downloadApiUrl);
        console.log('📝 Download API Response:', downloadRes.data);

        if (!downloadRes.data || !downloadRes.data.downloadLinks || downloadRes.data.downloadLinks.length === 0) {
            return reply(`කණගාටුයි, *${movie.title}* download links ලබාගත නොහැක.`);
        }

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
        console.error('❌ Plugin Error:', err);
        reply('කණගාටුයි, movie search / download fetch කරන්න බැරි වුණා 😔');
    }
});
