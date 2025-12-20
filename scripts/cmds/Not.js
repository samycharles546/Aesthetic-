const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61582382664051";
const DATA_PATH = path.join(__dirname, "not_data.json");

module.exports = {
  config: {
    name: "not",
    version: "1.0",
    author: "SAMY CHARLES",
    role: 0,
    category: "PROTECT",
    shortDescription: {
      en: "Night protection mode"
    },
    longDescription: {
      en: "Auto-kick & owner protection system"
    },
    guide: {
      en: "{pn} on | off"
    }
  },

  onStart: async function ({ api, event, args }) {
    if (event.senderID !== OWNER_UID)
      return api.sendMessage(
`╭────── 🌸 ──────╮
  Access denied
╰────── 🍃 ──────╯

Only the owner can use this command`,
        event.threadID,
        event.messageID
      );

    const data = fs.existsSync(DATA_PATH)
      ? fs.readJsonSync(DATA_PATH)
      : {};

    const tid = event.threadID;

    if (args[0] === "on") {
      data[tid] = { enabled: true, blacklist: [] };
      fs.writeJsonSync(DATA_PATH, data, { spaces: 2 });

      return api.sendMessage(
`╭────── 🌸 ──────╮
  Night Mode
╰────── 🌙 ──────╯

Protection enabled  
Auto-Kick active ⚡

Stay safe 🍀`,
        tid
      );
    }

    if (args[0] === "off") {
      delete data[tid];
      fs.writeJsonSync(DATA_PATH, data, { spaces: 2 });

      return api.sendMessage(
`╭────── 🌸 ──────╮
  Night Mode
╰────── ☀️ ──────╯

Protection disabled`,
        tid
      );
    }

    return api.sendMessage("Use: not on | not off", tid, event.messageID);
  },

  onEvent: async function ({ api, event }) {
    if (!event.threadID) return;

    const data = fs.existsSync(DATA_PATH)
      ? fs.readJsonSync(DATA_PATH)
      : {};

    const tid = event.threadID;
    if (!data[tid]?.enabled) return;

    const blacklist = data[tid].blacklist || [];

    /* AUTO-KICK IF BLACKLISTED USER JOINS */
    if (
      event.logMessageType === "log:subscribe"
    ) {
      const uid = event.logMessageData.addedParticipants?.[0]?.userFbId;
      if (blacklist.includes(uid)) {
        try { await api.removeUserFromGroup(uid, tid); } catch {}
      }
    }

    /* OWNER KICKED */
    if (
      event.logMessageType === "log:unsubscribe" &&
      event.logMessageData.leftParticipantFbId === OWNER_UID
    ) {
      const attacker = event.author;

      if (!blacklist.includes(attacker))
        blacklist.push(attacker);

      data[tid].blacklist = blacklist;
      fs.writeJsonSync(DATA_PATH, data, { spaces: 2 });

      try {
        await api.removeUserFromGroup(attacker, tid);
        await api.addUserToGroup(OWNER_UID, tid);
        await api.changeAdminStatus(tid, OWNER_UID, true);

        api.sendMessage(
`╭────── 🌸 ──────╮
  Aesther Shield
╰────── ⚡ ──────╯

Threat neutralized  
Owner restored 🛡️`,
          tid
        );
      } catch {}
    }

    /* OWNER ADMIN REMOVED */
    if (
      event.logMessageType === "log:thread-admins" &&
      event.logMessageData.ADMIN_EVENT === "remove_admin" &&
      event.logMessageData.TARGET_ID === OWNER_UID
    ) {
      const attacker = event.author;

      if (!blacklist.includes(attacker))
        blacklist.push(attacker);

      data[tid].blacklist = blacklist;
      fs.writeJsonSync(DATA_PATH, data, { spaces: 2 });

      try {
        await api.removeUserFromGroup(attacker, tid);
        await api.changeAdminStatus(tid, OWNER_UID, true);
      } catch {}
    }
  }
};
