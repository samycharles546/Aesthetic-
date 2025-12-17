const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "aes",
        aliases: ["ae", "nano"],
        version: "1.0",
        author: "Samy Charles",
        countDown: 30,
        role: 0,
        shortDescription: "🌸✨ Génère des images magiques avec Nano Banana Pro 🍀🥙🪐",
        longDescription: "🌸✨ Génère des images kawaii et haute qualité avec l'IA Nano Banana 🍀🥙🌈",
        category: "IA"
    },

    onStart: async function({ event, api, message, args }) {
        try {
            if (!args.length && !event.messageReply) {
                return message.reply("⚠️ 🌸✨ Veuillez spécifier un prompt ou répondre à une image 🍀🥙🪐");
            }

            let promptParts = [];
            let ratioNumber = 5;
            for (let i = 0; i < args.length; i++) {
                if (args[i].toLowerCase() === "--r" && i + 1 < args.length) {
                    ratioNumber = parseInt(args[i + 1]);
                    i++;
                } else if (!args[i].startsWith("--")) {
                    promptParts.push(args[i]);
                }
            }
            const prompt = promptParts.join(" ").trim();

            let base64Image = null;
            if (event.messageReply && event.messageReply.attachments) {
                const imageAttachment = event.messageReply.attachments.find(att => att.type === "photo" && att.url);
                if (imageAttachment) {
                    const imageRes = await axios.get(imageAttachment.url, { responseType: 'arraybuffer' });
                    base64Image = `data:image/jpeg;base64,${Buffer.from(imageRes.data).toString('base64')}`;
                }
            }

            const headers = { 'accept': '*/*', 'content-type': 'application/json' };
            const payload = { prompt: prompt, ratio: ratioNumber, sourceImage: base64Image || undefined };
            const apiUrl = "https://pnqgfsxwnupruksqhetf.supabase.co/functions/v1/generate-image";

            api.setMessageReaction("🌮", event.messageID, (err) => {}, true);

            const res = await axios.post(apiUrl, payload, { headers });

            if (!res.data || !res.data.imageUrl) {
                return message.reply("❌ 🌸✨ Oops… L'IA n'a pas pu générer d'image 🍀🥙💦");
            }

            const imageData = res.data.imageUrl.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(imageData, 'base64');

            const cacheFolder = path.join(__dirname, "tmp");
            if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder, { recursive: true });

            const fileName = `nanana_${Date.now()}.jpg`;
            const filePath = path.join(cacheFolder, fileName);
            fs.writeFileSync(filePath, buffer);

            await message.reply({
                body: `🎨 🌸✨ Image kawaii générée avec succès ! 🍀🥙🪐\n📐 Ratio: ${ratioNumber}\n${base64Image ? "🖼️ Mode img2img activé ✨" : ""}\n💫 Amuse-toi avec ta création ! 🌈💖`,
                attachment: fs.createReadStream(filePath)
            });

            setTimeout(() => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }, 5000);

            api.setMessageReaction("🪐", event.messageID, (err) => {}, true);

        } catch (error) {
            console.error("ERROR:", error);
            api.setMessageReaction("❌", event.messageID, (err) => {}, true);
            message.reply("❌ 🌸✨ Une erreur magique est survenue lors de la génération de l'image 🍀🥙💦");
        }
    }
};
