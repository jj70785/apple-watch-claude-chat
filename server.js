require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { spawn } = require('child_process');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('Bot is running! Waiting for messages...');

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  if (!text) return;

  if (text.toLowerCase() === 'new chat' || text.toLowerCase() === 'clear') {
    bot.sendMessage(chatId, 'Conversation cleared!');
    return;
  }

  if (text.toLowerCase() === '/start' || text.toLowerCase() === 'help') {
    bot.sendMessage(chatId, 'Just type to chat with Claude!');
    return;
  }

  bot.sendChatAction(chatId, 'typing');
  console.log('Message received:', text);

  // Use cmd.exe to run claude
  const child = spawn('cmd.exe', ['/c', 'claude', '-p', text], {
    cwd: 'C:\\Users\\john',
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true
  });

  // Close stdin immediately
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

    const response = stdout.trim();
    if (response) {
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
    bot.sendMessage(chatId, 'Failed to start Claude: ' + err.message);
  });
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});
