const icons = ['⚡', '🔮', '🧠', '🔧', '💻', '🎯', '🧰', '📌', '🌐', '🛸', '🚀', '🪐', '🧿', '🗂️'];
const commandsPerPage = 45;
const autoDeleteDelay = 30;

module.exports.config = {
  name: 'menu',
  version: '4.0.0',
  hasPermssion: 0,
  credits: 'NgTuann',
  description: 'Menu lệnh đẹp với khung từng lệnh',
  commandCategory: 'Tiện ích',
  usages: '[all [số trang]]',
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args, permssion }) {
  const cmds = global.client.commands;
  const isGroupAdmin = (await api.getThreadInfo(event.threadID)).adminIDs.some(e => e.id == event.senderID);

  if (args[0]?.toLowerCase() === 'all') {
    const list = Array.from(cmds.values()).filter(cmd => canUse(cmd.config.hasPermssion, permssion, isGroupAdmin));
    const page = parseInt(args[1]) || 1;
    return sendAllCommands(api, event, list, page);
  }

  const groups = groupCommands(cmds, permssion, isGroupAdmin);
  let msg = '╔════════════════════════════════════════╗\n';
  msg += '║           ✨ MENU LỆNH ✨            ║\n';
  msg += '╠════════════════════════════════════════╣\n';
  
  groups.forEach((g, i) => {
    msg += `║ ${(i + 1).toString().padStart(2)}. ${icons[i % icons.length]} ${g.category.padEnd(20)} ║\n`;
    msg += '╠────────────────────────────────────────╣\n';
  });
  
  msg += '║                                        ║\n';
  msg += '║ 📌 Reply số tương ứng để xem chi tiết  ║\n';
  msg += '╚════════════════════════════════════════╝';

  api.sendMessage(msg, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID,
      type: 'menu',
      groups,
      timestamp: Date.now()
    });

    setTimeout(() => {
      if (api.unsendMessage) api.unsendMessage(info.messageID);
    }, autoDeleteDelay * 1000);
  });
};

async function sendAllCommands(api, event, list, page) {
  const totalPages = Math.ceil(list.length / commandsPerPage);
  if (page < 1 || page > totalPages) {
    return api.sendMessage(`❌ Trang không hợp lệ (1-${totalPages})`, event.threadID, event.messageID);
  }

  const startIdx = (page - 1) * commandsPerPage;
  const endIdx = Math.min(startIdx + commandsPerPage, list.length);
  const pageCommands = list.slice(startIdx, endIdx);

  let msg = '╔════════════════════════════════════════╗\n';
  msg += `║        📜 MENU ALL (${page}/${totalPages})        ║\n`;
  msg += '╠════════════════════════════════════════╣\n';
  
  pageCommands.forEach((cmd, i) => {
    const cmdNum = startIdx + i + 1;
    msg += `╔═══ ${cmdNum.toString().padStart(3)}. ${cmd.config.name.toUpperCase()} ═══╗\n`;
    msg += `║ ${icons[cmdNum % icons.length]} ${cmd.config.description}\n`;
    msg += `║ 📌 Cách dùng: ${cmd.config.usages || 'Không có'}\n`;
    msg += `║ ⏱️ Cooldown: ${cmd.config.cooldowns}s\n`;
    msg += `║ 🔐 Quyền: ${getPermissionName(cmd.config.hasPermssion)}\n`;
    msg += '╚════════════════════════════════════════╝\n';
  });
  
  msg += '╔════════════════════════════════════════╗\n';
  msg += `║ 📄 Trang ${page}/${totalPages} | Tổng ${list.length} lệnh ║\n`;
  msg += '╚════════════════════════════════════════╝\n';
  msg += '📌 Gõ "menu all [trang]" để xem trang khác';

  api.sendMessage(msg, event.threadID, (err, info) => {
    setTimeout(() => {
      if (api.unsendMessage) api.unsendMessage(info.messageID);
    }, autoDeleteDelay * 1000);
  });
}

module.exports.handleReply = async function ({ handleReply, api, event }) {
  if (event.senderID != handleReply.author) return;
  
  if (api.unsendMessage) {
    try {
      await api.unsendMessage(handleReply.messageID);
    } catch (e) {}
  }

  if (handleReply.type === 'menu') {
    const index = parseInt(event.body) - 1;
    const group = handleReply.groups[index];
    if (!group) return api.sendMessage('❌ Số không hợp lệ', event.threadID, event.messageID);

    let msg = '╔════════════════════════════════════════╗\n';
    msg += `║     ${icons[index % icons.length]} ${group.category.toUpperCase()}     ║\n`;
    msg += '╠════════════════════════════════════════╣\n';
    
    group.commands.forEach((cmd, i) => {
      msg += `║ ${(i + 1).toString().padStart(2)}. ${cmd.config.name.padEnd(20)} ║\n`;
      msg += '╠────────────────────────────────────────╣\n';
    });
    
    msg += '║                                        ║\n';
    msg += '║ 📌 Reply số lệnh để xem chi tiết       ║\n';
    msg += '╚════════════════════════════════════════╝';

    api.sendMessage(msg, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        type: 'command',
        commands: group.commands,
        timestamp: Date.now()
      });

      setTimeout(() => {
        if (api.unsendMessage) api.unsendMessage(info.messageID);
      }, autoDeleteDelay * 1000);
    });
  }
  else if (handleReply.type === 'command') {
    const index = parseInt(event.body) - 1;
    const cmd = handleReply.commands[index];
    if (!cmd) return api.sendMessage('❌ Số lệnh không hợp lệ', event.threadID, event.messageID);

    let detail = '╔════════════════════════════════════════╗\n';
    detail += `║         🛠️ CHI TIẾT LỆNH         ║\n`;
    detail += '╠════════════════════════════════════════╣\n';
    detail += `║ 🏷️ Tên: ${cmd.config.name}\n`;
    detail += `║ 📝 Mô tả: ${cmd.config.description}\n`;
    detail += `║ 📂 Danh mục: ${cmd.config.commandCategory}\n`;
    detail += `║ 📌 Cách dùng: ${cmd.config.usages || 'Không có'}\n`;
    detail += `║ ⏱️ Cooldown: ${cmd.config.cooldowns}s\n`;
    detail += `║ 🔐 Quyền: ${getPermissionName(cmd.config.hasPermssion)}\n`;
    detail += '╚════════════════════════════════════════╝';
    
    api.sendMessage(detail, event.threadID);
  }
};

function groupCommands(cmds, permssion, isGroupAdmin) {
  const grouped = {};
  for (let [name, cmd] of cmds) {
    if (!canUse(cmd.config.hasPermssion, permssion, isGroupAdmin)) continue;
    let cat = cmd.config.commandCategory || 'Khác';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(cmd);
  }
  return Object.entries(grouped).map(([category, commands]) => ({ category, commands }));
}

function canUse(cmdPerm, userPerm, isGroupAdmin) {
  if (userPerm === 3) return true;
  if (userPerm === 2) return cmdPerm <= 2;
  if (isGroupAdmin) return cmdPerm <= 1;
  return cmdPerm === 0;
}

function getPermissionName(level) {
  const permissions = {
    0: 'Thành viên',
    1: 'QTV nhóm',
    2: 'Admin bot',
    3: 'Developer'
  };
  return permissions[level] || 'Không xác định';
}