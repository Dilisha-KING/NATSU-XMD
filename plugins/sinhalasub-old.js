const { cmd } = require('../command')
const axios = require('axios')

cmd({
    pattern: 'cinesubz',
    desc: 'Search Cinesubz movies and get info + download links',
    category: 'movie',
    react: '🎬',
    filename: __filename
}, async (conn, mek, m, { text }) => {
    try {
        if (!text) return await m.reply("🔎 *Please provide a movie name!*\n\nExample: .cinesubz Avatar")

        const apiKey = "f5b42f3c-5d21-44ac-a976-6b0589c3877c"
        const searchUrl = `https://api.cinesubz.net/search?query=${encodeURIComponent(text)}&apikey=${apiKey}`

        const { data } = await axios.get(searchUrl)

        if (!data || data.length === 0) {
            return await m.reply("❌ No movies found for your query!")
        }

        let movie = data[0] // first result
        let detailsUrl = `https://api.cinesubz.net/movie/${movie.id}?apikey=${apiKey}`

        const { data: details } = await axios.get(detailsUrl)

        let msg = `🎬 *${details.title}*\n\n`
        msg += `📅 Year: ${details.year || 'N/A'}\n`
        msg += `⭐ Rating: ${details.rating || 'N/A'}\n`
        msg += `🗂 Genre: ${details.genres ? details.genres.join(', ') : 'N/A'}\n\n`
        msg += `📝 Plot: ${details.plot || 'No description available'}\n\n`
        msg += `⬇️ *Download Links:*\n`

        if (details.downloads && details.downloads.length > 0) {
            details.downloads.forEach(dl => {
                msg += `- ${dl.quality} : ${dl.url}\n`
            })
        } else {
            msg += "❌ No download links available"
        }

        await conn.sendMessage(m.chat, { image: { url: details.poster }, caption: msg }, { quoted: mek })
    } catch (e) {
        console.error(e)
        await m.reply("⚠️ Error fetching movie info, try again later.")
    }
})
