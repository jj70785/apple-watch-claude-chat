# Apple Watch Claude Chat

Chat with Claude AI from your Apple Watch using Telegram. Messages are processed through Claude Code using your Claude Pro/Max subscription.

## Quick Download

**[Download ZIP](https://github.com/jj70785/apple-watch-claude-chat/archive/refs/heads/master.zip)** | **[View on GitHub](https://github.com/jj70785/apple-watch-claude-chat)**

### Quick Install (Windows)
```bash
# 1. Download and extract ZIP, then:
cd apple-watch-claude-chat-master
npm install

# 2. Create .env file with your bot token:
echo TELEGRAM_BOT_TOKEN=your_token_here > .env

# 3. Run:
node server.js
```

### Linux Users
See **[LINUX-SETUP.md](LINUX-SETUP.md)** for complete Linux installation guide.

---

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
- **Conversation memory** - Claude remembers up to 20 exchanges
- **Save & resume chats** - Save conversations and load them later
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

### 2. Download the Project

**Option A: Download ZIP**
- Download from: https://github.com/jj70785/apple-watch-claude-chat/archive/refs/heads/master.zip
- Extract the ZIP file

**Option B: Clone with Git**
```bash
git clone https://github.com/jj70785/apple-watch-claude-chat.git
cd apple-watch-claude-chat
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

Create a `.env` file in the project folder:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

Replace `your_bot_token_here` with the token from BotFather.

### 5. Run the Bot

```bash
node server.js
```

You should see: `Bot is running! Waiting for messages...`

### 6. Start Chatting

Message your bot on Telegram - it will respond with Claude!

## Commands

| Message | Action |
|---------|--------|
| Any text | Chat with Claude (remembers context!) |
| `new chat` / `new session` / `clear` | Save current chat & start fresh |
| `resume` | Show list of saved conversations |
| `1`, `2`, `3`... | Resume that saved conversation |
| `help` or `/start` | Show help message |

## Conversation Memory

The bot remembers your conversation! Claude will recall what you talked about in the same session.

- **Remembers last 20 exchanges** (40 messages)
- Say "new chat" to save the conversation before starting fresh
- Say "resume" to load a previously saved conversation
- Saved chats persist in `conversations.json` (survives bot restarts)

## Files

| File | Description |
|------|-------------|
| `server.js` | Main bot server (with memory + resume) |
| `server-v2-memory.js` | Backup: memory only (no resume) |
| `server-v1-simple.js` | Backup: simple version (no memory) |
| `conversations.json` | Saved conversations (auto-created) |
| `package.json` | Node.js dependencies |
| `.env` | Your bot token (not committed to git) |
| `.env.example` | Template for environment variables |
| `LINUX-SETUP.md` | Setup guide for Linux |

## Running on Apple Watch

1. Install a Telegram app on your Apple Watch (e.g., "X for Telegram Messenger")
2. Sign into your Telegram account
3. Find your bot and start chatting!

## Keeping It Running 24/7

The bot needs to stay running for messages to work.

**Windows:**
- Keep the terminal open
- Use Task Scheduler to auto-start on boot

**Linux:**
```bash
# Using pm2 (recommended)
npm install -g pm2
pm2 start server.js --name claude-bot
pm2 startup    # Enable auto-start on boot
pm2 save
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Your bot token is invalid. Get a new one from BotFather |
| No response from Claude | Make sure Claude Code is installed and authenticated. Test: `claude -p "hi"` |
| Bot not receiving messages | Check that the bot is running and internet is connected |

## Permissions Mode

The bot runs with `--dangerously-skip-permissions` flag, which means Claude can:
- Search the web
- Read and write files
- Run shell commands
- Access the internet

All without asking for permission. To require permission prompts, remove `--dangerously-skip-permissions` from `server.js`.

## Version History

| Version | File | Features |
|---------|------|----------|
| v3 (current) | `server.js` | Memory + Resume + 20 exchanges |
| v2 | `server-v2-memory.js` | Memory only |
| v1 | `server-v1-simple.js` | Basic (no memory) |

## License

MIT
