# Linux Setup Guide for Apple Watch Claude Chat

This guide is for setting up the Telegram Claude bot on a Linux machine. Give this file to Claude Code and it will help you install everything correctly.

## Project Overview

This is a Telegram bot that connects to Claude Code, allowing you to chat with Claude from your Apple Watch (or any device with Telegram).

**Architecture:**
```
Apple Watch → Telegram → Telegram Bot API → Linux Server → Claude Code
                                                 ↓
Apple Watch ← Telegram ← Telegram Bot API ←─────┘
```

**Cost:** $0 (uses Claude Pro/Max subscription through Claude Code)

## Prerequisites

Before starting, you need:
1. A Telegram bot token (from @BotFather)
2. Claude Code installed and authenticated on your Linux machine
3. Node.js v18 or higher

## Step-by-Step Installation

### Step 1: Install Node.js

```bash
# For Debian/Ubuntu/MX Linux:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation:
node --version  # Should show v20.x.x or higher
```

### Step 2: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

### Step 3: Authenticate Claude Code

```bash
claude
```

Follow the prompts to log in with your Claude Pro/Max account. Test it works:

```bash
claude -p "hi"
```

Should respond with a greeting.

### Step 4: Find Claude Code Path

```bash
which claude
```

**IMPORTANT:** Note this path! Common locations:
- `/home/USERNAME/.local/bin/claude`
- `/usr/local/bin/claude`

You'll need to update `server.js` with this path.

### Step 5: Download the Project

```bash
# Option A: Clone from GitHub
git clone https://github.com/jj70785/apple-watch-claude-chat.git
cd apple-watch-claude-chat

# Option B: Download ZIP and extract
# Download from: https://github.com/jj70785/apple-watch-claude-chat/archive/refs/heads/master.zip
unzip master.zip
cd apple-watch-claude-chat-master
```

### Step 6: Install Dependencies

```bash
npm install
```

### Step 7: Configure Environment

```bash
cp .env.example .env
nano .env
```

Add your Telegram bot token:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### Step 8: CRITICAL - Update server.js for Linux

The default `server.js` is configured for Windows. You MUST modify it for Linux.

Open `server.js` and make these changes:

**Change 1:** Find this line (around line 195):
```javascript
const tempFile = path.join('C:\\Users\\john', `claude-prompt-${chatId}.txt`);
```

Change to:
```javascript
const tempFile = path.join('/tmp', `claude-prompt-${chatId}.txt`);
```

**Change 2:** Find this line (around line 198-205):
```javascript
const child = spawn('cmd.exe', ['/c', `type "${tempFile}" | claude --dangerously-skip-permissions -p -`], {
  cwd: 'C:\\Users\\john',
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
  windowsHide: true
});
```

Change to (replace `/home/USERNAME/.local/bin/claude` with YOUR claude path from Step 4):
```javascript
const child = spawn('bash', ['-l', '-c', `cat "${tempFile}" | /home/USERNAME/.local/bin/claude --dangerously-skip-permissions -p -`], {
  cwd: process.env.HOME,
  env: { ...process.env, HOME: process.env.HOME, USER: process.env.USER },
  stdio: ['pipe', 'pipe', 'pipe']
});
```

### Step 9: Test the Bot

```bash
node server.js
```

You should see: `Bot is running! Waiting for messages...`

Send a message to your bot on Telegram. If it works, proceed to Step 10.

### Step 10: Keep Running 24/7

**Option A: Using pm2 (Recommended)**
```bash
npm install -g pm2
pm2 start server.js --name claude-bot
pm2 startup    # Follow instructions to enable auto-start on boot
pm2 save
```

**Option B: Using screen**
```bash
screen -S claude-bot
node server.js
# Press Ctrl+A, then D to detach
# To reattach: screen -r claude-bot
```

## Troubleshooting

### "claude: command not found"
- Make sure you updated the path in server.js to match YOUR claude installation
- Run `which claude` to find the correct path

### Bot hangs / No response
- Make sure you're using `bash -l -c` (login shell) in the spawn command
- Verify Claude Code works: `claude -p "test"`

### "ETELEGRAM: 401 Unauthorized"
- Your bot token is invalid
- Get a new one from @BotFather: `/mybots` → your bot → API Token → Revoke

### Permission denied
- Make sure Claude Code is authenticated: run `claude` and log in

## Commands

| Message | Action |
|---------|--------|
| Any text | Chat with Claude |
| `new chat` | Save current chat & start fresh |
| `resume` | Load a saved conversation |
| `help` | Show commands |

## Files

- `server.js` - Main bot (modify for Linux!)
- `server-v2-memory.js` - Backup: memory only
- `server-v1-simple.js` - Backup: no memory
- `conversations.json` - Saved chats (auto-created)
- `.env` - Your bot token

## Memory

- Remembers last 20 exchanges (40 messages)
- Say "new chat" to save before starting fresh
- Say "resume" to restore a saved chat
