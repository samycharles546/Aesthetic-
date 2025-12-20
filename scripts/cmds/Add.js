module.exports = {
  config: {
    name: "add",
    version: "1.0",
    author: "SAMY CHARLES",
    role: 2,
    countDown: 5,
    shortDescription: {
      en: "Add owner to a group"
    },
    longDescription: {
      en: "List bot groups and add the owner to the selected one"
    },
    category: "SYSTEM"
  },

  onStart: async function ({ api, event, message }) {
    const OWNER_UID = "61582382664051";

    if (event.senderID !== OWNER_UID) {
      return message.reply(
`╭────── 🌸 ──────╮
   Access Denied
╰────── 🌙 ──────╯

This command is private.

🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞`
      );
    }

    try {
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const groups = threads.filter(t => t.isGroup);

      if (!groups.length) {
        return message.reply(
`╭────── 🌸 ──────╮
   No Groups Found
╰────── 🌙 ──────╯

The bot is not in any group.`
        );
      }

      let text =
`╭────── 🌸 ──────╮
   AESTHER GROUP PORTAL
╰────── 🌙 ──────╯

🌸 Reply with the group number  
to join that group 🪐

╭───────────┈⊷
`;

      groups.forEach((g, i) => {
        text += `│ ${i + 1}. ${g.name || "Unnamed Group"}\n`;
      });

      text +=
`╰───────────┈⊷

🌸 Waiting for your choice…`;

      api.sendMessage(text, event.threadID, (err, info) => {
        if (err) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "add",
          author: event.senderID,
          groups
        });
      });

    } catch (e) {
      console.error(e);
      message.reply("❌ Failed to fetch group list.");
    }
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body.trim());
    if (isNaN(choice) || choice < 1 || choice > Reply.groups.length) {
      return message.reply("⚠️ Please reply with a valid group number.");
    }

    const group = Reply.groups[choice - 1];
    const OWNER_UID = "61582382664051";

    try {
      await api.addUserToGroup(OWNER_UID, group.threadID);

      message.reply(
`╭────── 🌸 ──────╮
   Added Successfully
╰────── 🌙 ──────╯

🌷 You have been added to  
${group.name || "Unnamed Group"}

🌸✨ ﹝@ 𝗔𝗘𝗦𝗧𝗛𝗘𝗥🍀🥙﹞`
      );
    } catch (e) {
      console.error(e);
      message.reply(
`❌ Failed to add you to the group.

Make sure:
• The bot has permission
• You are not blocked
• The group still exists`
      );
    }
  }
};
