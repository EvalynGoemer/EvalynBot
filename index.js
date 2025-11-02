import { Client, GatewayIntentBits, Partials } from 'discord.js';

import config from "./config.json" with {type: "json"}

import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';



function blockingWait(seconds) {
    const start = Date.now();
    while (Date.now() - start < seconds * 1000) {
    }
}

for (let i = 10; i != 0; i--) {
    console.log("Starting in " + i + " seconds.")
    if (!config.skipStartupDelay) {
      blockingWait(1);
    }
}

try {
    const raw = fs.readFileSync("./db.json", 'utf8');
    global.db = JSON.parse(raw);
} catch (err) {
    console.error('Failed to load db.json:', err);
}

process.on('exit', () => {
  try {
    fs.writeFileSync("./db.json", JSON.stringify(global.db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save db.json on exit:', err);
  }
});

process.on('SIGINT', () => {
  try {
    fs.writeFileSync("./db.json", JSON.stringify(global.db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save db.json on SIGINT:', err);
  }
  process.exit();
});

process.on('SIGTERM', () => {
  try {
    fs.writeFileSync("./db.json", JSON.stringify(global.db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save db.json on SIGTERM:', err);
  }
  process.exit();
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesDirs = [
    path.join(__dirname, 'modules'),
    path.join(__dirname, 'user_modules')
];

let modulesFiles = [];

for (const dir of modulesDirs) {
    if (!fs.existsSync(dir)) continue;
    const stack = [dir];
    while (stack.length) {
        const current = stack.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) stack.push(fullPath);
            else if (entry.isFile() && entry.name.endsWith('.js'))
                modulesFiles.push(fullPath);
        }
    }
}

for (const filePath of modulesFiles) {
    const module = await import(pathToFileURL(filePath));
    const event = module.default;
    if (!event?.name || !event?.execute) continue;
    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));
}

client.login(config.token);
global.client = client
