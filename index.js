const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const TARGET_GROUP_NAME = "Maqsad";
const TRIGGER_TEXT = "hello";
const REPLY_TEXT = "Hi";

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
  }
});

function normalizeText(text) {
  if (!text) return "";
  return String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

async function shouldReplyToMessage(message) {
  if (!message || message.fromMe || !message.body) return { shouldReply: false, reason: "skip" };

  const chat = await message.getChat();
  const groupName = chat?.name ? normalizeText(chat.name) : "";
  const normalizedTarget = normalizeText(TARGET_GROUP_NAME);
  const isTargetGroup = Boolean(chat?.isGroup && groupName && groupName.includes(normalizedTarget));
  const text = normalizeText(message.body);
  const isHelloTrigger = text === TRIGGER_TEXT || text.startsWith(`${TRIGGER_TEXT}`);

  if (!isTargetGroup) {
    return { shouldReply: false, reason: "group" };
  }

  if (!isHelloTrigger) {
    return { shouldReply: false, reason: "text" };
  }

  return { shouldReply: true, reason: "match" };
}

client.on("qr", (qr) => {
  console.log("Scan this QR code with WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot is Ready!");
});

client.on("message", async (message) => {
  if (!message || !message.body) return;

  try {
    const chat = await message.getChat();
    const text = normalizeText(message.body);

    console.log("Chat:", message.from);
    console.log("Group:", chat?.name || "N/A");
    console.log("Sender:", message.author || "Private Chat");
    console.log("Message:", message.body);
    console.log("------------------------");

    const result = await shouldReplyToMessage(message);
    if (result.shouldReply) {
      await message.reply(REPLY_TEXT);
      console.log(`Replied: ${REPLY_TEXT}`);
    } else {
      console.log(`Skip reply: ${result.reason}`);
    }
  } catch (error) {
    console.error("Message handling error:", error);
  }
});

if (require.main === module) {
  client.initialize();
}

module.exports = {
  client,
  TARGET_GROUP_NAME,
  TRIGGER_TEXT,
  REPLY_TEXT,
  shouldReplyToMessage,
  normalizeText
};
