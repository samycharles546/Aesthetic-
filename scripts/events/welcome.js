const fs = require("fs-extra");
const axios = require("axios");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "welcome",
    eventType: ["log:subscribe"],
  },

  onStart: async ({ event, api }) => {
    try {
      const threadID = event.threadID;
      const info = await api.getThreadInfo(threadID);

      const addedUser = event.logMessageData.addedParticipants[0];
      const name = addedUser.fullName;
      const uid = addedUser.userFbId;
      const memberCount = info.participantIDs.length;

      // === BACKGROUND IMAGE ===
      const bgURL = "https://i.ibb.co/7K1vzLJ/wallpaper-anime-samurai.jpg"; // Fond stylé
      const bg = await Canvas.loadImage(bgURL);

      // === USER AVATAR ===
      const avatarURL = `https://graph.facebook.com/${uid}/picture?height=720&width=720`;
      const avatarImg = await Canvas.loadImage(avatarURL);

      // === CANVAS ===
      const canvas = Canvas.createCanvas(1500, 800);
      const ctx = canvas.getContext("2d");

      // Fond
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Zone avatar ronde
      ctx.save();
      ctx.beginPath();
      ctx.arc(750, 270, 150, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, 600, 120, 300, 300);
      ctx.restore();

      // Pseudo
      ctx.font = "70px Arial Black";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(name, 750, 500);

      // Code stylé hex
      ctx.font = "35px Consolas";
      ctx.fillStyle = "#00eaff";
      ctx.fillText("{ 0F1 • 84D • 23E • 01D • 91F }", 750, 560);

      // Nombre de membres
      ctx.font = "45px Arial Black";
      ctx.fillStyle = "#fff";
      ctx.fillText(`YOU'RE THE ${memberCount}ᵗʰ MEMBER OF THIS GROUP`, 750, 650);

      // === OUTPUT ===
      const path = __dirname + `/cache/welcome_${uid}.png`;
      fs.writeFileSync(path, canvas.toBuffer());

      api.sendMessage(
        {
          body: `🎉 Bienvenue ${name} !`,
          attachment: fs.createReadStream(path)
        },
        threadID,
        () => fs.unlinkSync(path)
      );

    } catch (err) {
      console.log(err);
      api.sendMessage("❌ Impossible de générer l'image de bienvenue.", event.threadID);
    }
  }
};
