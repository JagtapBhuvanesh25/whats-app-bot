# WhatsApp Bot

A simple WhatsApp Web bot built with `whatsapp-web.js` that listens for messages in a specific WhatsApp group and replies when a trigger word is detected.

## Features

- Connects to WhatsApp Web using local session authentication
- Displays a QR code in the terminal for first-time login
- Listens for incoming messages in a target group
- Replies with a predefined response when a trigger text is detected
- Includes a basic test suite with Node.js built-in test runner

## Project Structure

- `index.js` - main bot implementation
- `package.json` - Node.js dependencies and scripts
- `test.js` - simple unit tests for message handling logic

## Requirements

- Node.js 18 or later
- npm (Node package manager)
- A WhatsApp account mobile device

## Setup

1. Open a terminal in the project folder:
   ```bash
   cd d:\WhatsAppBot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Git Ignore

This project includes a `.gitignore` file that excludes files and folders that should not be committed:

- `node_modules/`
- `.wwebjs_auth/`
- `.wwebjs_cache/`
- `.DS_Store`
- `npm-debug.log*`
- `yarn-debug.log*`
- `.env`

## Configure the Bot

By default, the bot is configured in `index.js` with:

- `TARGET_GROUP_NAME = "Maqsad"`
- `TRIGGER_TEXT = "hello"`
- `REPLY_TEXT = "Hi"`

To change the target group, trigger text, or reply message, edit these constants in `index.js`.

## Run the Bot

Start the bot with:

```bash
npm start
```

When the bot starts for the first time, it will display a QR code in the terminal. Scan the QR code with your WhatsApp app to authenticate.

After authentication, the bot will keep a local session and will not require scanning again unless session data is removed.

### What the bot does

- Only replies in the group whose normalized name includes the target group name
- Only replies when the normalized message text starts with the trigger text
- Logs message metadata to the console for each incoming message

## Run Tests

To run the built-in test suite:

```bash
npm test
```

## Notes

- The bot uses `whatsapp-web.js` and `qrcode-terminal`.
- Authentication data is stored locally using `LocalAuth`.
- Keep your terminal open while the bot runs.

## Troubleshooting

- If the QR code does not appear, make sure your terminal supports UTF-8 characters.
- If the bot does not reply, verify that the group name matches `TARGET_GROUP_NAME` and the message starts with `TRIGGER_TEXT`.

## Customize Further

You can extend the bot to support:

- multiple groups or triggers
- natural language processing
- logging to a file
- command-based responses