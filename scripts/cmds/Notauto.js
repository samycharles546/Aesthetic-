const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61582382664051";
const DATA = path.join(__dirname, "not_data.json");

function getData() {
  if (!fs.existsSync(DATA)) {
    fs.writeJsonSync(DATA, { protect: {}, blacklist: {} }, { spaces: 2 });
  }

  const data = fs.readJsonSync(DATA);

  if (!data.protect) data.protect = {};
  if (!data.blacklist) data.blacklist = {};

  return data;
}

function saveData(data) {
  fs.writeJsonSync(DATA, data, { spaces: 2 });
}

module.exports = {
  config: {
    name: "notauto",
    version: "1.1",
    author: "SAMY CHARLES",
    role: 0,
    category: "PROTECT"
  },

  onStart: async function ({ api, event, args }) {
    if (event.senderID !== OWNER_UID) return;

    const data = getData();
    const tid = event.threadID;

    if (args[0] === "on") {
      data.protect[tid] = true;
      saveData(data);

      return api.sendMessage(
`╭──────── 🌸 ────────╮
   Auto-Kick System
╰──────── ⚡ ────────╯

Protection enabled
Blacklist active`,
        tid
      );
    }

    if (args[0] === "off") {
      delete data.protect[tid];
      saveData(data);

      return api.sendMessage(
`╭──────── 🌸 ────────╮
   Auto-Kick System
╰──────── 🍃 ────────╯

Protection disabled`,
        tid
      );
    }
  }
};
