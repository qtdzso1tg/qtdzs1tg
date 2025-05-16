const fs = require('fs'),
  ytdl = require('@distube/ytdl-core'),
  fse = require("fs-extra"),
  moment = require("moment-timezone"),
  Youtube = require('youtube-search-api');

module.exports.config = {
  name: "sing",
  version: "1.0.8",
  hasPermission: 0,
  credits: "D-Jukie fix TKDEV & qt fix", // qt fix đmm đổi cre cc
  description: "Nghe nhạc của Youtube ngay trên Messenger với tốc độ tối đa",
  commandCategory: "Tiện ích",
  usages: "[tên bài hát]",
  cooldowns: 3,
  usePrefix: true
};

module.exports.run = async function({ api, event, args }) {
  if (!args[0])
    return api.sendMessage("❎ Vui lòng nhập tên bài hát!", event.threadID, event.messageID);
  try {
    const data = (await Youtube.GetListByKeyword(args.join(" "), false, 6)).items.filter(i => i.type === "video");
    if (!data.length)
      return api.sendMessage("❎ Không tìm thấy bài nào phù hợp!", event.threadID, event.messageID);
    const msg = data.map((v, i) =>
      `|› ${i + 1}. ${v.title}\n|› 👤 ${v.channelTitle}\n|› ⏱️ ${v.length.simpleText}\n──────────────────`
    ).join('\n');
    const link = data.map(v => v.id);
    return api.sendMessage(
      `📝 Kết quả:\n${msg}\n\n📌 Reply STT để bot gửi nhạc cho bạn!`,
      event.threadID,
      (err, info) => global.client.handleReply.push({
        type: 'reply',
        name: module.exports.config.name,
        author: event.senderID,
        messageID: info.messageID,
        link
      }),
      event.messageID
    );
  } catch (e) {
    console.error("Lỗi tìm kiếm:", e);
    return api.sendMessage("❎ Lỗi khi tìm kiếm bài hát!", event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  const id = handleReply.link[parseInt(body) - 1];
  if (!id)
    return api.sendMessage("❎ Số bạn chọn không hợp lệ!", threadID, messageID);

  const path = `${__dirname}/cache/sing-${senderID}.mp3`;

  try {
    
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    ytdl.cache.update = () => {};
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const format = audioFormats.find(f =>
      f.mimeType?.includes('audio/mp4') && f.audioBitrate <= 128
    ) || audioFormats.find(f => f.mimeType?.includes('audio/mp4')) || audioFormats[0];

    if (!format?.url) {
      console.error("Không tìm thấy định dạng audio phù hợp:", audioFormats);
      return api.sendMessage("❎ Không thể tìm thấy định dạng nào phù hợp!", threadID, messageID);
    }

    const stream = ytdl.downloadFromInfo(info, {
      format,
      highWaterMark: 1 << 26
    }).pipe(fs.createWriteStream(path, { highWaterMark: 1 << 26 }));

    stream.on('finish', () => {
      try {
        if (!fs.existsSync(path)) throw new Error("File không tồn tại sau khi tải");
        const size = fs.statSync(path).size;
        if (size > 26214400 || size === 0)
          throw new Error("File không hợp lệ hoặc quá lớn");

        api.unsendMessage(handleReply.messageID);

        api.sendMessage({
          attachment: fs.createReadStream(path, { highWaterMark: 1 << 26 })
        }, threadID, (err) => {
          fse.unlinkSync(path);
          if (err) {
            console.error("Lỗi gửi file:", err);
            api.sendMessage("❎ Lỗi khi gửi file âm thanh!", threadID, messageID);
          } else {
            
            api.setMessageReaction("✅", event.messageID, () => {}, true);
          }
        }, messageID);
      } catch (e) {
        console.error("Lỗi kiểm tra file:", e);
        api.sendMessage("❎ File không hợp lệ hoặc quá lớn không thể gửi!", threadID, () => fse.unlinkSync(path), messageID);
      }
    });

    stream.on('error', e => {
      console.error("Lỗi stream:", e);
      api.sendMessage("❎ Lỗi khi tải bài hát!", threadID, messageID);
      if (fs.existsSync(path)) fse.unlinkSync(path);
    });

  } catch (e) {
    console.error("Lỗi xử lý bài hát:", e);
    api.sendMessage("❎ Đã xảy ra lỗi khi tải bài hát!", threadID, messageID);
    if (fs.existsSync(path)) fse.unlinkSync(path);
  }
};
