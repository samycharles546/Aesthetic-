const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61582382664051";
const DATA_PATH = path.join(__dirname, "kickall_data.json");

function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeJsonSync(DATA_PATH, { groups: {} }, { spaces: 2 });
  }

  const data = fs.readJsonSync(DATA_PATH);
  if (!data.groups) data.groups = {};
  return data;
}

function saveData(data) {
  fs.writeJsonSync(DATA_PATH, data, { spaces: 2 });
}

module.exports = {
  config: {
    name: "kickall",
    version: "1.0",
    author: "SAMY CHARLES",
    role: 0,
    category: "PROTECT"
  },

  onStart: async function ({ api, event, args }) {
    if (event.senderID !== OWNER_UID) return;

    const data = loadData();
    const tid = event.threadID;

    if (args[0] === "on") {
      if (!event.messageReply)
        return api.sendMessage("Reply to the user message.", tid);

      const uid = event.messageReply.senderID;

      data.groups[tid] = {
        enabled: true,
        target: uid
      };

      saveData(data);

      try {
        await api.removeUserFromGroup(uid, tid);
      } catch {}

      return api.sendMessage(
`╭────── ⚡ KickAll ──────╮
│ Auto-kick enabled
│ Target locked
╰──────────────────────╯`,
        tid
      );
    }

    if (args[0] === "off") {
      delete data.groups[tid];
      saveData(data);

      return api.sendMessage(
`╭────── 🌸 KickAll ──────╮
│ Auto-kick disabled
╰──────────────────────╯`,
        tid
      );
    }

    // kick simple (sans auto)
    if (event.messageReply) {
      const uid = event.messageReply.senderID;
      try {
        await api.removeUserFromGroup(uid, tid);
        return api.sendMessage("User removed.", tid);
      } catch {
        return api.sendMessage("Kick failed.", tid);
      }
    }
  },

  onEvent: async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    const data = loadData();
    const tid = event.threadID;
    const group = data.groups[tid];

    if (!group || !group.enabled) return;

    const addedID = event.logMessageData.addedParticipants[0]?.userFbId;
    if (!addedID) return;

    if (addedID === group.target) {
      setTimeout(async () => {
        try {
          await api.removeUserFromGroup(addedID, tid);
        } catch {}
      }, 200); // ⚡ vitesse lumière
    }
  }
};
