const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "xnxx",
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🔞 Génère une fausse miniature XNXX",
    longDescription: "Génère une image parodie XNXX avec un titre personnalisé et une image",
    category: "image",
    guide: "Réponds à une image avec : xnxx <titre>\n\nEx : xnxx Cours y’a un wibu !"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    const title = args.join(" ");

    // Validation
    if (!messageReply || messageReply.attachments.length === 0 || messageReply.attachments[0].type !== "photo") {
      return api.sendMessage("📸 Réponds à une image pour générer la miniature XNXX.", threadID, messageID);
    }

    if (!title) {
      return api.sendMessage("✏️ Tu dois fournir un titre !\nEx : xnxx J’ai croisé un wibu bizarre...", threadID, messageID);
    }

    const imageUrl = messageReply.attachments[0].url;
    const apiUrl = `https://api.siputzx.my.id/api/canvas/xnxx?title=${encodeURIComponent(title)}&image=${encodeURIComponent(imageUrl)}`;

    try {
      api.sendMessage("🛠️ Génération en cours...", threadID);

      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, "cache", `xnxx_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, res.data);

      api.sendMessage({
        body: `🔞 Voici ta fausse miniature XNXX :\n🖊️ Titre : ${title}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath));
    } catch (err) {
      console.error("Erreur XNXX :", err);
      api.sendMessage("❌ Une erreur est survenue lors de la génération.", threadID, messageID);
    }
  }
};
