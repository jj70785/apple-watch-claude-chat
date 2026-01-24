require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// ===== CUSTOMIZE CLAUDE'S PERSONALITY HERE =====
const SYSTEM_PROMPT = `You are a helpful, friendly AI assistant named Claude. You can help with ANY topic - not just programming. Be conversational, warm, and concise. Keep responses short since they may be read on a small watch screen. Don't mention being a software engineer or Claude Code.`;
// ===============================================

// Store conversation history per chat (in memory)
const conversations = new Map();

// Track users in "resume selection" mode
const resumeMode = new Map();

// File to save conversations
const SAVED_CHATS_FILE = path.join(__dirname, 'conversations.json');

// Load saved conversations from file
function loadSavedChats() {
  try {
    if (fs.existsSync(SAVED_CHATS_FILE)) {
      return JSON.parse(fs.readFileSync(SAVED_CHATS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading saved chats:', e);
  }
  return {};
}

// Save conversations to file
function saveSavedChats(chats) {
  try {
    fs.writeFileSync(SAVED_CHATS_FILE, JSON.stringify(chats, null, 2));
  } catch (e) {
    console.error('Error saving chats:', e);
  }
}

// Generate a chat name from the first message
function generateChatName(messages) {
  if (messages.length === 0) return 'empty-chat';
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (!firstUserMsg) return 'empty-chat';

  // Take first 5 words, lowercase, replace spaces with dashes
  const name = firstUserMsg.content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 5)
    .join('-');

  return name || 'chat';
}

// Format timestamp to relative time
function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

console.log('Bot is running! Waiting for messages...');

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  if (!text) return;

  const lowerText = text.toLowerCase();

  // Check if user is in resume selection mode
  if (resumeMode.has(chatId)) {
    const savedChats = resumeMode.get(chatId);
    const num = parseInt(text);

    if (!isNaN(num) && num >= 1 && num <= savedChats.length) {
      // User selected a chat to resume
      const selectedChat = savedChats[num - 1];
      conversations.set(chatId, [...selectedChat.messages]);
      resumeMode.delete(chatId);
      bot.sendMessage(chatId, `Resumed: ${selectedChat.name}\n\nContinue your conversation!`);
      return;
    } else {
      // Invalid selection, exit resume mode
      resumeMode.delete(chatId);
      bot.sendMessage(chatId, 'Cancelled. Send a message to start chatting!');
      return;
    }
  }

  // Handle new chat/clear commands
  if (lowerText === 'new chat' || lowerText === 'new session' || lowerText === 'clear' || lowerText === '/clear' || lowerText === '/new') {
    const currentHistory = conversations.get(chatId) || [];

    // Save current conversation if it has messages
    if (currentHistory.length > 0) {
      const savedChats = loadSavedChats();
      const chatName = generateChatName(currentHistory);
      const chatKey = `${chatId}-${Date.now()}`;

      savedChats[chatKey] = {
        name: chatName,
        messages: currentHistory,
        timestamp: Date.now()
      };

      // Keep only last 10 saved chats per user
      const userChats = Object.entries(savedChats)
        .filter(([key]) => key.startsWith(`${chatId}-`))
        .sort((a, b) => b[1].timestamp - a[1].timestamp);

      if (userChats.length > 10) {
        userChats.slice(10).forEach(([key]) => delete savedChats[key]);
      }

      saveSavedChats(savedChats);
      bot.sendMessage(chatId, `Saved as "${chatName}"\nStarting new conversation!`);
    } else {
      bot.sendMessage(chatId, 'Starting new conversation!');
    }

    conversations.delete(chatId);
    return;
  }

  // Handle resume command
  if (lowerText === 'resume' || lowerText === '/resume') {
    const savedChats = loadSavedChats();
    const userChats = Object.entries(savedChats)
      .filter(([key]) => key.startsWith(`${chatId}-`))
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, 5)
      .map(([key, chat]) => ({
        key,
        name: chat.name,
        messages: chat.messages,
        timestamp: chat.timestamp
      }));

    if (userChats.length === 0) {
      bot.sendMessage(chatId, 'No saved conversations. Start chatting and say "new chat" to save!');
      return;
    }

    // Enter resume mode
    resumeMode.set(chatId, userChats);

    let response = 'Saved conversations:\n\n';
    userChats.forEach((chat, i) => {
      response += `${i + 1}. ${chat.name} (${timeAgo(chat.timestamp)})\n`;
    });
    response += '\nReply with a number to resume, or anything else to cancel.';

    bot.sendMessage(chatId, response);
    return;
  }

  // Handle help/start commands
  if (lowerText === '/start' || lowerText === 'help' || lowerText === '/help') {
    bot.sendMessage(chatId,
      'Chat with Claude! I remember our conversation.\n\n' +
      'Commands:\n' +
      '• new chat - Save & start fresh\n' +
      '• resume - Load a saved chat\n' +
      '• help - Show this message'
    );
    return;
  }

  bot.sendChatAction(chatId, 'typing');
  console.log('Message received:', text);

  // Get or create conversation history
  let history = conversations.get(chatId) || [];

  // Build the full prompt with history
  let fullPrompt = SYSTEM_PROMPT + '\n\n';

  if (history.length > 0) {
    fullPrompt += 'Here is our conversation so far:\n\n';
    for (const msg of history.slice(-40)) {  // Last 20 exchanges
      fullPrompt += `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}\n\n`;
    }
    fullPrompt += `User: ${text}\n\nRespond to the user's latest message. Remember the conversation context above.`;
  } else {
    fullPrompt += `User: ${text}`;
  }

  console.log('Full prompt:', fullPrompt);

  // Write prompt to temp file to avoid command line escaping issues
  const tempFile = path.join('C:\\Users\\john', `claude-prompt-${chatId}.txt`);
  fs.writeFileSync(tempFile, fullPrompt);

  // Use cmd.exe to run claude, reading from file
  const child = spawn('cmd.exe', ['/c', `type "${tempFile}" | claude --dangerously-skip-permissions -p -`], {
    cwd: 'C:\\Users\\john',
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
    windowsHide: true
  });

  child.stdin.end();

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    stdout += data.toString();
    console.log('stdout chunk:', data.toString());
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
    console.log('stderr chunk:', data.toString());
  });

  child.on('close', (code) => {
    console.log('Exit code:', code);
    console.log('Full stdout:', stdout);

    // Clean up temp file
    try { fs.unlinkSync(tempFile); } catch (e) {}

    const response = stdout.trim();
    if (response) {
      // Add to history
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: response });

      // Keep only last 40 messages (20 exchanges)
      if (history.length > 40) {
        history = history.slice(-40);
      }
      conversations.set(chatId, history);

      // Send response
      if (response.length > 4000) {
        const chunks = response.match(/.{1,4000}/gs);
        chunks.forEach(chunk => bot.sendMessage(chatId, chunk));
      } else {
        bot.sendMessage(chatId, response);
      }
    } else {
      bot.sendMessage(chatId, 'No response from Claude.');
    }
  });

  child.on('error', (err) => {
    console.log('Spawn error:', err);
    try { fs.unlinkSync(tempFile); } catch (e) {}
    bot.sendMessage(chatId, 'Failed to start Claude: ' + err.message);
  });
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});
