const moment = require("moment");

module.exports = {
    config: {
        name: "unsend",
        aliases: ["deletebotmsg", "delmsg"],
        version: "1.0",
        author: "Samy Charles",
        countDown: 5,
        role: 0,
        shortDescription: "🌸✨ Delete bot messages",
        longDescription: "🌸✨ Delete one or multiple messages sent by the bot",
        category: "Utility"
    },

    onStart: async function ({ api, event, message }) {
        const { threadID, messageID } = event;
        const now = Date.now();

        try {
            // Si on répond à un message du bot
            if (event.messageReply && event.messageReply.senderID === api.getCurrentUserID()) {
                await api.unsendMessage(event.messageReply.messageID);
                return message.reply("🪐✨ Message successfully deleted 🌸");
            }

            // Supprimer tous les messages du bot envoyés dans les 30 dernières minutes
            const messages = await api.getThreadHistory(threadID, 100);
            const botID = api.getCurrentUserID();
            const THIRTY_MINUTES = 30 * 60 * 1000;

            const toDelete = messages
                .filter(m => m.senderID === botID && now - m.timestamp < THIRTY_MINUTES)
                .map(m => m.messageID);

            if (toDelete.length === 0) return message.reply("⚠️ No messages to delete in the last 30 minutes 🌸");

            for (const msgID of toDelete) {
                await api.unsendMessage(msgID);
            }

            return message.reply(`🪐✨ Deleted ${toDelete.length} message(s) sent by the bot 🌸`);
        } catch (err) {
            console.error(err);
            return message.reply("❌ Something went wrong while deleting messages 🌸");
        }
    }
};
