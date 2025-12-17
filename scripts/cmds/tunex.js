const axios = require("axios");
const fs = require("fs");
const ytSearch = require("yt-search");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "tunex",
    aliases: ["atu", "sona", "melea"],
    version: "2.0",
    author: "Samy Charles",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "🌸✨ Discover & download music softly"
    },
    longDescription: {
      en: "🌷 Search, preview and download music from YouTube with an aesthetic experience"
    },
    category: "music"
  },

  onStart: async function ({ api, args, event }) {
    if (!args.length) {
      return api.sendMessage(
        "🌸✨ Please tell me which song you’re looking for 🪐",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("🌷", event.messageID, () => {}, true);

    try {
      const query = args.join(" ");
      const search = await ytSearch(query);
      const results = search.videos.slice(0, 6);

      if (!results.length) {
        return api.sendMessage(
          "🌼 No music found… try another vibe ✨",
          event.threadID,
          event.messageID
        );
      }

      if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

      let body =
`╭─────── 🌸 ───────╮
   𝗔𝗘𝗦𝗧𝗛𝗘𝗥 𝗧𝗨𝗡𝗘𝗫 🍀🥙
╰─────── 🪐 ───────╯

🎧 Soft results for:
${query}

`;

      const attachments = [];

      for (let i = 0; i < results.length; i++) {
        const v = results[i];
        body += `🪐 ${i + 1} ─ ${v.title}\n⏱ ${v.timestamp}\n\n`;

        try {
          const thumb = await axios.get(v.thumbnail, { responseType: "arraybuffer" });
          const thumbPath = path.join(CACHE_DIR, `tunex_${i}.jpg`);
          fs.writeFileSync(thumbPath, Buffer.from(thumb.data));
          attachments.push(fs.createReadStream(thumbPath));
        } catch {}
      }

      body +=
`🌸 Reply to this message
with the number of the song
you want to feel ✨`;

      api.sendMessage(
        { body, attachment: attachments },
        event.threadID,
        (err, info) => {
          if (err) return;

          global.GoatBot.onReply.set(info.messageID, {
            commandName: "tunex",
            videos: results,
            messageID: info.messageID
          });

          attachments.forEach(a => {
            try { fs.unlinkSync(a.path); } catch {}
          });
        },
        event.messageID
      );

    } catch (e) {
      console.error(e);
      api.sendMessage(
        "🌸✨ Something went wrong… please try again 🍃",
        event.threadID,
        event.messageID
      );
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const choice = parseInt(event.body.trim());
    if (isNaN(choice) || choice < 1 || choice > Reply.videos.length) {
      return api.sendMessage(
        "🌼 Please reply with a valid number 🌷",
        event.threadID,
        event.messageID
      );
    }

    const video = Reply.videos[choice - 1];
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const cfg = await axios.get(
        "https://raw.githubusercontent.com/arychauhann/APIs/refs/heads/main/api.json"
      );

      const base = cfg.data?.ary;
      if (!base) throw new Error("API base not found");

      const url = `${base}/api/ytmp3?url=${encodeURIComponent(video.url)}&format=mp3`;
      const res = await axios.get(url);
      const data = res.data;

      if (!data?.success || !data.directLink) {
        return api.sendMessage(
          "🌸✨ Music unavailable right now 🍃",
          event.threadID,
          event.messageID
        );
      }

      const file = path.join(CACHE_DIR, `${Date.now()}.mp3`);
      const stream = await axios.get(data.directLink, { responseType: "stream" });
      const writer = fs.createWriteStream(file);
      stream.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body:
`🎶 Now playing softly 🌸

Title: ${data.title}
Format: MP3
Size: ${data.fileSize}

🌷 Enjoy the moment`,
            attachment: fs.createReadStream(file)
          },
          event.threadID,
          () => fs.unlinkSync(file),
          event.messageID
        );

        api.setMessageReaction("🌷", event.messageID, () => {}, true);

        if (Reply.messageID) {
          try { api.unsendMessage(Reply.messageID); } catch {}
        }
      });

    } catch (e) {
      console.error(e);
      api.sendMessage(
        "🌸✨ Download failed… please retry later 🍀",
        event.threadID,
        event.messageID
      );
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
