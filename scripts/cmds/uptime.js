module.exports = {
  config: {
    name: "uptime",
    aliases: [],
    version: "1.0",
    author: "Samy",
    countDown: 5,
    role: 0,
    shortDescription: "Affiche le temps d'activité du bot",
    longDescription: "Montre depuis combien de temps 🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞ fonctionne.",
    category: "info"
  },

  onStart: async function ({ message }) {
    let totalSeconds = process.uptime();

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const msg = 
`🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞ 💫
『 ⚡ 𝖫𝖾 𝖻𝗈𝗍 𝖿𝗈𝗇𝖼𝗍𝗂𝗈𝗇𝗇𝖾 𝖽𝖾𝗉𝗎𝗂𝗌 : 🕑 ${minutes}𝗆 ⏱️ ${seconds}𝗌 ⚡ 』 💖`;

    return message.reply(msg);
  }
};
