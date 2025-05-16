const os = require("os");
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "upt2",
    version: "1.0.0",
    hasPermission: 0,
    credits: "AnhKiet - Fix by qt", // qt code thêm video random
    description: "Hiển thị thông tin hệ thống bot kèm video",
    commandCategory: "Hệ thống",
    usages: "upt2",
    cooldowns: 5
  },

  run: async ({ api, event }) => {
    const start = Date.now();

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const heap = process.memoryUsage();
    const heapTotal = Math.round(heap.heapTotal / 1024 / 1024);
    const heapUsed = Math.round(heap.heapUsed / 1024 / 1024);

    const uptime = process.uptime();
    const d = Math.floor(uptime / (24 * 60 * 60));
    const h = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const m = Math.floor((uptime % (60 * 60)) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${d > 0 ? d + " ngày " : ""}${h} giờ ${m} phút ${s} giây`;

    const cpuUsage = await (async () => {
      const start = process.cpuUsage();
      await new Promise(r => setTimeout(r, 100));
      const end = process.cpuUsage(start);
      return ((end.user + end.system) / 10000).toFixed(1);
    })();

    const dependencyCount = await (async () => {
      try {
        const pkg = JSON.parse(await fs.readFile("package.json", "utf8"));
        return Object.keys(pkg.dependencies).length;
      } catch {
        return "Không xác định";
      }
    })();

    const ping = Date.now() - start;
    const status = ping < 200 ? "✅ Mượt mà" : ping < 800 ? "⚠️ Bình thường" : "❌ Lag";
    const videoFilePath = path.resolve(__dirname, "../../gojo/datajson/vdgai.json");
    let videoLinks = [];
    const fileContent = await fs.readFile(videoFilePath, "utf8");
    videoLinks = JSON.parse(fileContent);
    const randomVideoLink = videoLinks[Math.floor(Math.random() * videoLinks.length)];
    const videoStream = await axios.get(randomVideoLink, { responseType: 'stream' });

    const msg = `
╭───────────────╮
│  ⚙️  𝗛𝗘̣̂ 𝗧𝗛𝗢̂́𝗡𝗚 𝗕𝗢𝗧  │
╰───────────────╯
⏰ 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻: ${moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss - DD/MM/YYYY')}
⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptimeStr}
📶 𝗣𝗶𝗻𝗴: ${ping}ms — ${status}

🧠 𝗛𝗲𝗮𝗽: ${heapUsed}MB / ${heapTotal}MB
💾 𝗥𝗔𝗠: ${Math.round(usedMem / 1024 / 1024)}MB / ${Math.round(totalMem / 1024 / 1024)}MB
🔧 𝗖𝗣𝗨: ${os.cpus().length} core — ${cpuUsage}% sử dụng
📦 𝗣𝗵𝘂̣ 𝘁𝗵𝘂𝗼̣̂𝗰: ${dependencyCount}
🖥️ 𝗛𝗗𝗛: ${os.type()} ${os.release()} (${os.arch()})
━━━━━━━━━━━━━━━━━━━`.trim();

    return api.sendMessage({
        body: msg,
        attachment: videoStream.data
    }, event.threadID, event.messageID);
  }
};