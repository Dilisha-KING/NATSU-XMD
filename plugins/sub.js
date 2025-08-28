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
        const query = q.trim();
        if (!query) return reply('Please provide a movie or TV show name to search.');

        const searchResults = await getDetails(query);
        if (!searchResults.status || !searchResults.result) {
            return reply('No results found.');
        }

        const details = searchResults.result;
        let detailText = `*${details.title}*\n`;
        detailText += `📅 Release Date: ${details.year}\n`;
        detailText += `🌎 Country: ${details.category.join(', ')}\n`;
        detailText += `⭐ IMDb Rating: ${details.rating}\n`;
        detailText += `🧚‍♂️ Genres: ${details.category.join(', ')}\n\n`;
        detailText += '🔢 REPLY THE NUMBER YOU WANT\n\n';
        detailText += '*1. ➠ SD 480p*\n';
        detailText += '*2. ➠ HD 720p*\n';
        detailText += '*3. ➠ HHD 1080p*\n\n';
        detailText += '> *© Powered By 🧚‍♂️SUHAS-MD V8*';

        const downloadMsg = await conn.sendMessage(from, {
            image: { url: details.image },
            caption: detailText,
            contextInfo: { forwardingScore: 999, isForwarded: true }
        }, { quoted: mek });

        const handleDownloadReply = async (update) => {
            const replyMsg = update.messages[0];
            if (!replyMsg.message || !replyMsg.message.extendedTextMessage) return;
            if (replyMsg.message.contextInfo.stanzaId !== downloadMsg.key.id) return;

            const selectedOption = replyMsg.message.extendedTextMessage.text.trim();
            let quality;
            switch (selectedOption) {
                case '1': quality = 'SD 480p'; break;
                case '2': quality = 'HD 720p'; break;
                case '3': quality = 'HHD 1080p'; break;
                default:
                    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                    return reply('❗ Invalid option. Please select from 1, 2, or 3.');
            }

            try {
                const fileUrl = await getDownload(details.link);
                if (fileUrl) {
                    await conn.sendMessage(from, {
                        document: { url: fileUrl, mimetype: 'video/mp4', fileName: details.title + '.mp4' },
                        caption: details.title + '\n\n> *© Powered By 🧚‍♂️SUHAS-MD V8*'
                    }, { quoted: mek });
                    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
                } else {
                    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                    reply('❗ Download link not found. Please try another quality.');
                }
            } catch (err) {
                console.log('Error in scraper:', err);
                await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                reply('❗ An error occurred while processing your download request.');
            }
        };

        conn.ev.on('messages.upsert', handleDownloadReply);
        setTimeout(() => conn.ev.off('messages.upsert', handleDownloadReply), 60000);

    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply('❗ Error: ' + err.message);
    }
});
