const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tik"],
    version: "1.0",
    author: "Samy Charles",
    role: 0,
    countDown: 0,
    shortDescription: "🌸✨ Search & download TikTok videos",
    hasPrefix: false,
    category: "VIDEO",
    usage: "[search term]",
    cooldown: 5
  },

  onStart: async function({ api, event, args }) {
    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const searchQuery = args.join(" ");
      if (!searchQuery) {
        api.sendMessage("Usage: tiktok [TikTok search]", event.threadID);
        return;
      }

      if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

      const response = await axios.get(
        `https://aryanx-apisx.onrender.com/aryan/tiksearch?search=${encodeURIComponent(searchQuery)}`
      );

      const videos = response.data.data?.videos;
      if (!videos || !Array.isArray(videos) || videos.length === 0) {
        api.sendMessage("🌼 No videos found for your search query.", event.threadID);
        return;
      }

      const videoData = videos[0];
      const videoUrl = videoData.play;
      if (!videoUrl) {
        api.sendMessage("❌ No playable video found.", event.threadID);
        return;
      }

      const message = 
`╭─── 🌸 TikTok ───╮
│ 🎵 Title: ${videoData.desc || "Unknown"}
│ 👤 Author: ${videoData.author.nickname} (@${videoData.author.unique_id})
│ 💖 Likes: ${videoData.stats.digg_count}
│ 💬 Comments: ${videoData.stats.comment_count}
│ 🔁 Shares: ${videoData.stats.share_count}
╰─────────────🌷╯`;

      const filePath = path.join(CACHE_DIR, `tiktok_video.mp4`);
      const writer = fs.createWriteStream(filePath);

      const videoResponse = await axios({
        method: "get",
        url: videoUrl,
        responseType: "stream",
      });

      videoResponse.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          { body: message, attachment: fs.createReadStream(filePath) },
          event.threadID,
          () => fs.unlinkSync(filePath)
        );
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

      writer.on("error", () => {
        api.sendMessage("❌ Failed to download the video.", event.threadID);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ An error occurred while processing your request.", event.threadID);
    }
  }
};
