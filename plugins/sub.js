const { cmd } = require('../command');
const { getDetails, getDownload } = require('sinhalasub.lk');

cmd({
    pattern: 'sinhalasub',
    desc: 'Search for a movie and get details & download options from sinhalasub.lk',
    category: 'movie',
    react: '🎬',
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const query = q?.trim();
        if (!query) return reply('❗ Please provide a movie or TV show name to search.');

        // Get movie details
        let searchResults;
        try {
            searchResults = await getDetails(query);
        } catch (err) {
            console.error('getDetails Error:', err);
            return reply('❗ Failed to fetch movie details.');
        }

        if (!searchResults || !searchResults.status || !searchResults.result) {
            return reply('❗ No results found.');
        }

        const details = searchResults.result;

        // Build movie details message
        let detailText = `*${details.title || 'Unknown'}*\n`;
        detailText += `📅 Release Date: ${details.year || 'N/A'}\n`;
        detailText += `🌎 Country: ${details.country || 'N/A'}\n`;
        detailText += `🎰 Duration: ${details.duration || 'N/A'}\n`;
        const genres = Array.isArray(details.category) ? details.category.join(', ') : details.category || 'N/A';
        detailText += `🧚‍♂️ Genres: ${genres}\n`;
        detailText += `⭐ IMDb Rating: ${details.rating || 'N/A'}\n\n`;
        detailText += '🔢 REPLY THE NUMBER YOU WANT\n\n';
        detailText += '*1. ➠ SD 480p*\n';
        detailText += '*2. ➠ HD 720p*\n';
        detailText += '*3. ➠ HHD 1080p*\n\n';
        detailText += '> *© Powered By 🧚‍♂️SUHAS-MD V8*';

        // Send movie details
        const sentMsg = await conn.sendMessage(from, {
            image: { url: details.image || 'https://i.ibb.co/02FQtBf/20241118-143715.jpg' },
            caption: detailText,
            contextInfo: { forwardingScore: 999, isForwarded: true }
        }, { quoted: mek });

        // Listen for quality selection
        const handleDownloadReply = async (update) => {
            const replyMsg = update.messages[0];
            if (!replyMsg.message?.extendedTextMessage) return;
            if (replyMsg.message.contextInfo?.stanzaId !== sentMsg.key.id) return;

            const selectedOption = replyMsg.message.extendedTextMessage.text.trim();
            let quality;
            switch (selectedOption) {
                case '1': quality = 'SD 480p'; break;
                case '2': quality = 'HD 720p'; break;
                case '3': quality = 'HHD 1080p'; break;
                default:
                    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                    return reply('❗ Invalid option. Please select 1, 2, or 3.');
            }

            try {
                const fileUrl = await getDownload(details.link, quality);
                if (fileUrl) {
                    await conn.sendMessage(from, {
                        document: { url: fileUrl, mimetype: 'video/mp4', fileName: (details.title || 'Movie') + '.mp4' },
                        caption: `${details.title || 'Movie'}\n\n> *© Powered By 🧚‍♂️SUHAS-MD V8*`
                    }, { quoted: mek });
                    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
                } else {
                    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                    reply('❗ Download link not found for the selected quality.');
                }
            } catch (err) {
                console.error('Download Error:', err);
                await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                reply('❗ An error occurred while processing your download request.');
            }
        };

        conn.ev.on('messages.upsert', handleDownloadReply);
        setTimeout(() => conn.ev.off('messages.upsert', handleDownloadReply), 60000);

    } catch (err) {
        console.error('Plugin Error:', err);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply('❗ Error: ' + (err.message || err));
    }
});
