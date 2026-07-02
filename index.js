const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const TARGET_GROUP_NAME = "Maqsad";
const TRIGGER_TEXT = "hello";
const REPLY_TEXT = "Hi";
const STICKER_REPLY_TEXT = "Tejas";

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    protocolTimeout: 60000
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

  if (!isTargetGroup) {
    return { shouldReply: false, reason: "group" };
  }

  const text = normalizeText(message.body);
  const isHelloTrigger = text === TRIGGER_TEXT || text.startsWith(`${TRIGGER_TEXT}`);

  if (!isHelloTrigger) {
    return { shouldReply: false, reason: "text" };
  }

  return { shouldReply: true, reason: "match", replyWith: REPLY_TEXT };
}

async function shouldReplyToSticker(message) {
  if (!message || message.fromMe) return { shouldReply: false, reason: "skip" };

  const chat = await message.getChat();
  const groupName = chat?.name ? normalizeText(chat.name) : "";
  const normalizedTarget = normalizeText(TARGET_GROUP_NAME);
  const isTargetGroup = Boolean(chat?.isGroup && groupName && groupName.includes(normalizedTarget));

  if (!isTargetGroup) {
    return { shouldReply: false, reason: "group" };
  }

  const isSticker = message.type === "sticker";

  if (!isSticker) {
    return { shouldReply: false, reason: "not_sticker" };
  }

  return { shouldReply: true, reason: "sticker_match", replyWith: STICKER_REPLY_TEXT };
}

client.on("qr", (qr) => {
  console.log("Scan this QR code with WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot is Ready!");
});

client.on("message", async (message) => {
  if (!message) return;

  // Skip system notifications and other non-user messages
  if (message.type && ["e2e_notification", "notification_template"].includes(message.type)) {
    return;
  }

  try {
    const chat = await message.getChat();
    const text = normalizeText(message.body || "");

    console.log("Chat:", message.from);
    console.log("Group:", chat?.name || "N/A");
    console.log("Type:", message.type);
    console.log("Sender:", message.author || "Private Chat");
    console.log("Message:", message.body || "(sticker/media)");
    console.log("------------------------");

    // Check for text trigger
    let result = await shouldReplyToMessage(message);
    if (result.shouldReply) {
      await message.reply(result.replyWith);
      console.log(`Replied: ${result.replyWith}`);
      return;
    }

    // Check for sticker trigger
    result = await shouldReplyToSticker(message);
    if (result.shouldReply) {
      await message.reply(result.replyWith);
      console.log(`Replied: ${result.replyWith}`);
      return;
    }

    if (result.reason !== "skip") {
      console.log(`Skip reply: ${result.reason}`);
    }
  } catch (error) {
    console.error("Message handling error:", error.message);
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
  STICKER_REPLY_TEXT,
  shouldReplyToMessage,
  shouldReplyToSticker,
  normalizeText
};
