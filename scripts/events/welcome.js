const { getTime } = global.utils;
const Canvas = require("canvas");
const axios = require("axios");
const fs = require("fs");

if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "welcome",
        version: "1.7",
        author: "SAMY-CHARLES",
        category: "events"
    },

    onStart: async ({ threadsData, message, event, api }) => {  
        if (event.logMessageType == "log:subscribe")  
            return async function () {  
                const hours = getTime("HH");  
                const { threadID } = event;  
                const prefix = global.utils.getPrefix(threadID);  
                const dataAddedParticipants = event.logMessageData.addedParticipants;  

                // Si le bot rejoint le groupe
                if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {  
                    return;  
                }  

                if (!global.temp.welcomeEvent[threadID])  
                    global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };  

                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);  
                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);  

                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {  
                    const threadData = await threadsData.get(threadID);  
                    if (threadData.settings.sendWelcomeMessage == false) return;  

                    const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;  
                    const dataBanned = threadData.data.banned_ban || [];  

                    const usersToWelcome = dataAddedParticipants.filter(u => !dataBanned.some(b => b.id == u.userFbId));  
                    if (usersToWelcome.length == 0) return;  

                    // --- IMAGE WELCOME ---
                    const backgrounds = [
                        "https://i.ibb.co/5hT4dK5W/591590664-824856947100070-1507971260693593290-n-jpg-nc-cat-102-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-G59l.jpg",
                        "https://i.ibb.co/sdXCWW74/589402649-24991090130562892-264518499823859214-n-jpg-nc-cat-101-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-GDU.jpg",
                        "https://i.ibb.co/KxVFVHPW/591707822-793465223669815-424196897577793955-n-jpg-nc-cat-107-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-E-J2.jpg",
                        "https://i.ibb.co/Pv0SHMdq/575852278-24815482858124117-9090142435870537324-n-jpg-nc-cat-109-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-Gq.jpg",
                        "https://i.ibb.co/k2vRrzFF/590394599-1767057837318363-575421139021239884-n-jpg-nc-cat-107-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-Hht.jpg"
                    ];

                    const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];
                    const bgBuffer = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
                    const background = await Canvas.loadImage(bgBuffer);

                    for (const user of usersToWelcome) {
                        const ppURL = `https://graph.facebook.com/${user.userFbId}/picture?height=512&width=512`;
                        const ppBuffer = (await axios.get(ppURL, { responseType: "arraybuffer" })).data;
                        const avatar = await Canvas.loadImage(ppBuffer);

                        const canvas = Canvas.createCanvas(background.width, background.height);
                        const ctx = canvas.getContext("2d");

                        // Fond
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

                        // Cercle photo
                        const avatarSize = 200;
                        const x = (canvas.width - avatarSize) / 2;
                        const y = (canvas.height - avatarSize) / 2 - 30;

                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(avatar, x, y, avatarSize, avatarSize);
                        ctx.restore();

                        // Nom en gras
                        ctx.font = "bold 40px Sans";
                        ctx.fillStyle = "#ffffff";
                        ctx.textAlign = "center";
                        ctx.fillText(user.fullName, canvas.width / 2, y + avatarSize + 50);

                        const buffer = canvas.toBuffer();
                        fs.writeFileSync(__dirname + "/welcome.png", buffer);

                        await api.sendMessage({
                            body: `🎉 Bienvenue ${user.fullName} !`,
                            attachment: fs.createReadStream(__dirname + "/welcome.png")
                        }, threadID);

                        fs.unlinkSync(__dirname + "/welcome.png");
                    }

                    delete global.temp.welcomeEvent[threadID];
                }, 1500);  
            };  
    }
};
