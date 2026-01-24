require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Store conversation history per chat
const conversations = new Map();

console.log('Bot is running! Waiting for messages...');

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  if (!text) return;

  const lowerText = text.toLowerCase();

  // Handle new chat/clear commands
  if (lowerText === 'new chat' || lowerText === 'new session' || lowerText === 'clear' || lowerText === '/clear' || lowerText === '/new') {
    conversations.delete(chatId);
    bot.sendMessage(chatId, 'Starting new conversation!');
    return;
  }

  // Handle help/start commands
  if (lowerText === '/start' || lowerText === 'help' || lowerText === '/help') {
    bot.sendMessage(chatId,
      'Chat with Claude! I remember our conversation.\n\n' +
      'Commands:\n' +
      '• new chat - Start fresh conversation\n' +
      '• help - Show this message'
    );
    return;
  }

  bot.sendChatAction(chatId, 'typing');
  console.log('Message received:', text);

  // Get or create conversation history
  let history = conversations.get(chatId) || [];

  // Build the full prompt with history
  let fullPrompt = '';

  if (history.length > 0) {
    fullPrompt = 'Here is our conversation so far:\n\n';
    for (const msg of history.slice(-10)) {  // Last 5 exchanges
      fullPrompt += `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}\n\n`;
    }
    fullPrompt += `User: ${text}\n\nRespond to the user's latest message. Remember the conversation context above.`;
  } else {
    fullPrompt = text;
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

      // Keep only last 10 messages
      if (history.length > 10) {
        history = history.slice(-10);
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
