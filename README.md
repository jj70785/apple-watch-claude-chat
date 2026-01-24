# Apple Watch Claude Chat

Chat with Claude AI from your Apple Watch using Telegram. Messages are processed through Claude Code using your Claude Pro/Max subscription.

## How It Works

```
Apple Watch → Telegram App → Telegram Bot API → Your PC → Claude Code
                                                    ↓
Apple Watch ← Telegram App ← Telegram Bot API ←────┘
```

1. You send a message to your Telegram bot from your Apple Watch (or any device)
2. The bot server running on your PC receives the message
3. It runs Claude Code with your message
4. Claude's response is sent back through Telegram to your watch

## Features

- Chat with Claude from your Apple Watch
- **Full permissions mode** - Claude can search the web, read/write files, run commands without asking
- Uses your existing Claude Pro/Max subscription (no API costs)
- Free Telegram messaging

## Cost

**$0** - Uses your existing Claude Pro/Max subscription through Claude Code. Telegram is free.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Claude Code](https://github.com/anthropics/claude-code) installed and authenticated
- A Telegram account
- Claude Pro or Max subscription

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Choose a name (e.g., "Claude Bot")
4. Choose a username ending in `bot` (e.g., `my_claude_bot`)
5. Save the **Bot Token** that BotFather gives you

### 2. Install Dependencies

```bash
cd "Apple Watch Claude Chat"
npm install
```

### 3. Configure Environment

Create a `.env` file in the project folder:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

Replace `your_bot_token_here` with the token from BotFather.

### 4. Run the Bot

```bash
node server.js
```

You should see: `Bot is running! Waiting for messages...`

### 5. Start Chatting

Message your bot on Telegram - it will respond with Claude!

## Commands

| Message | Action |
|---------|--------|
| Any text | Chat with Claude (remembers context!) |
| `new chat` / `new session` / `clear` | Start fresh conversation |
| `help` or `/start` | Show help message |

## Conversation Memory

The bot remembers your conversation! Claude will recall what you talked about in the same session.

- Memory persists until you say "new chat" or restart the bot
- Last 5 exchanges (10 messages) are kept as context
- Memory is stored in RAM (clears if bot restarts)

## Files

- `server.js` - Main bot server (with conversation memory)
- `server-v1-simple.js` - Backup: simple version without memory
- `package.json` - Node.js dependencies
- `.env` - Your bot token (not committed to git)
- `.env.example` - Template for environment variables

## Running on Apple Watch

1. Install a Telegram app on your Apple Watch (e.g., "X for Telegram Messenger")
2. Sign into your Telegram account
3. Find your bot and start chatting!

## Keeping It Running

The bot needs to stay running for messages to work. Options:

**Windows:**
- Keep the terminal open
- Use Task Scheduler to auto-start on boot

**Linux:**
```bash
# Using pm2
npm install -g pm2
pm2 start server.js --name claude-bot
pm2 startup
pm2 save
```

## Troubleshooting

**401 Unauthorized**: Your bot token is invalid. Get a new one from BotFather.

**No response from Claude**: Make sure Claude Code is installed and authenticated. Test with `claude -p "hi"` in terminal.

## Permissions Mode

The bot runs with `--dangerously-skip-permissions` flag, which means Claude can:
- Search the web
- Read and write files
- Run shell commands
- Access the internet

All without asking for permission. If you want Claude to ask before taking actions, remove the `--dangerously-skip-permissions` flag from line 28 in `server.js`.

**Bot not receiving messages**: Check that the bot is running and your internet connection is working.

## License

MIT
