module.exports.config = {
  name: "contact",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Trần Như Anh Kiệt",
  description: "Liên hệ Admin bot",
  commandCategory: "Tiện ích",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  try {
    const adminInfo = {
      name: "Trần Như Anh Kiệt",
      momo: "0777505553",
      fbLink: "https://www.facebook.com/share/15kS5Vabzm/",
      zalo: "0777505553",
      email: "lienquan.tb789@gmail.com",
      message: "Cần gì thì liên hệ admin nhé ❤️"
    };

    let contactMsg = `╔═══════◈◈◈═══════╗\n`;
    contactMsg += `║  🎖️ 𝗧𝗛𝗢̂𝗡𝗚 𝗧𝗜𝗡 𝗔𝗗𝗠𝗜𝗡  ║\n`;
    contactMsg += `╚═══════◈◈◈═══════╝\n\n`;
    contactMsg += `👤 𝗧𝗲̂𝗻: ${adminInfo.name}\n\n`;
    contactMsg += `💰 𝗠𝗼𝗠𝗼: ${adminInfo.momo}\n\n`;
    contactMsg += `📱 𝗭𝗮𝗹𝗼: ${adminInfo.zalo}\n\n`;
    contactMsg += `📧 𝗘𝗺𝗮𝗶𝗹: ${adminInfo.email}\n\n`;
    contactMsg += `🌐 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: ${adminInfo.fbLink}\n\n`;
    contactMsg += `💬 𝗟𝗼̛̀𝗶 𝗻𝗵𝗮̆́𝗻: ${adminInfo.message}\n\n`;
    contactMsg += `╔═══════◈◈◈═══════╗\n`;
    contactMsg += `║  💌 𝗖𝗔̉𝗠 𝗢̛𝗡 𝗕𝗔̣𝗡  💌  ║\n`;
    contactMsg += `╚═══════◈◈◈═══════╝`;

    // Gửi tin nhắn
    return api.sendMessage(contactMsg, event.threadID, event.messageID);
    
  } catch (error) {
    console.error(error);
    return api.sendMessage("Đã có lỗi xảy ra khi hiển thị thông tin liên hệ!", event.threadID, event.messageID);
  }
};