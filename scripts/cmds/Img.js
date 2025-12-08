const axios = require("axios");

module.exports = {
    config: {
        name: "img",
        aliases: ["uploadimg", "upload"],
        version: "1.1",
        author: "Saimx69x",
        category: "utility",
        countDown: 5,
        role: 0,
        shortDescription: "Upload image/gif/png and get URL",
        longDescription: "Reply to an image/gif/png to upload it to Imgbb and return a URL."
    },

    onStart: async function ({ api, event }) {
        try {
            // Vérifie si l'utilisateur a bien répondu à un media
            if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
                return api.sendMessage("❌ Please reply to an image, gif, or png to upload.", event.threadID, event.messageID);
            }

            const attachment = event.messageReply.attachments[0];
            const mediaUrl = attachment.url;

            // Appel API
            const res = await axios.get(`https://xsaim8x-xxx-api.onrender.com/api/imgbb?url=${encodeURIComponent(mediaUrl)}`);
            const data = res.data;

            if (!data.status) {
                return api.sendMessage("❌ Failed to upload image. Please try again later.", event.threadID, event.messageID);
            }

            // Réponse stylée
            const replyMessage = `🌸✨ Image Uploaded Successfully! ✨🌸\n🔗 URL: ${data.image.display_url}`;

            return api.sendMessage(replyMessage, event.threadID, event.messageID);

        } catch (err) {
            console.error(err);
            return api.sendMessage("❌ Something went wrong. Please try again later.", event.threadID, event.messageID);
        }
    }
};
