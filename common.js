const CHAT_ADDR = process.env.CHAT_ADDR ?? '127.0.0.1:4501';

exports.CHAT_ADDR = CHAT_ADDR;
exports.Info = (msg) => {
   console.log(`[${new Date().toLocaleTimeString()}]: ${msg}`);
}