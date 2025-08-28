const { cmd } = require('../command');
const { get_list, movie } = require('sinhalasub.lk');
const { Pixeldrain } = require('pixeldrainjs');
const axios = require('axios');

const pixeldrainClient = new Pixeldrain(''); // Pixeldrain API key (if required)

cmd({
    pattern: 'sinhalasub',
    desc: 'Search for a movie and get details and download options.',
    category: 'movie',
    react: '💕',
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const query = args.join(' ').trim();
        if (!query) return reply('Please provide a movie or TV show name to search.');

        const searchResults = await get_list.by_search(query);

        if (!searchResults.status || searchResults.results.length === 0)
            return reply('No results found.');

        let messageText = '*🧚‍♂️SUHAS-MD Search Results:*\n\n';
        searchResults.results.forEach((item, index) => {
            messageText += `${index + 1}. ${item.title}\nType: ${item.type}\nLink: ${item.link}\n\n`;
        });

        await conn.sendMessage(from, { text: messageText }, { quoted: mek });

        // Wait for user reply (number)
        conn.ev.once('messages.upsert', async (update) => {
            const msg = update.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const num = parseInt(msg.message.extendedTextMessage.text.trim()) - 1;
            if (num < 0 || num >= searchResults.results.length)
                return reply('❗ Invalid selection.');

            const selectedMovie = searchResults.results[num];
            const detailsRes = await movie(selectedMovie.link);
            const details = detailsRes.details;

            let detailText = `*${details.title}*\n📅 Release Date: ${details.release_date}\n🌎 Country: ${details.country}\n🎰 Duration: ${details.duration}\n🧚‍♂️ Genres: ${details.genres.join(', ')}\n⭐ IMDb Rating: ${details.IMDb_Rating}\n🧚‍♂️ Director: ${details.director.join(', ')}\n\n`;
            detailText += '*Reply the number for quality:*\n1. SD 480p\n2. HD 720p\n3. FHD 1080p';

            await conn.sendMessage(from, { text: detailText }, { quoted: mek });

            // Wait for quality selection
            conn.ev.once('messages.upsert', async (upd) => {
                const selMsg = upd.messages[0];
                if (!selMsg.message || !selMsg.message.extendedTextMessage) return;

                const opt = selMsg.message.extendedTextMessage.text.trim();
                let quality;
                switch (opt) {
                    case '1': quality = '480p'; break;
                    case '2': quality = '720p'; break;
                    case '3': quality = '1080p'; break;
                    default: return reply('❗ Invalid option.');
                }

                try {
                    const fileLink = details.downloads[quality]; // Assuming details.downloads has quality links
                    if (!fileLink) return reply('❗ Download link not found.');

                    await conn.sendMessage(from, {
                        document: { url: fileLink, mimetype: 'video/mp4', fileName: `${details.title}.mp4` }
                    }, { quoted: mek });

                    reply('✅ Download ready!');
                } catch (err) {
                    console.error(err);
                    reply('❗ Error downloading file.');
                }
            });
        });

    } catch (err) {
        console.error(err);
        reply('❗ Error: ' + err.message);
    }
});
