import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

import config from "./config.json" with {type: "json"}

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { setMaxListeners } from 'events';

setMaxListeners(100)

const originalLog = console.log;

console.log = function(...args) {
    const date = new Date()

    const timestamp = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    }).format(date).replace(',', '');

    originalLog.apply(console, [`[${timestamp}]`, ...args]);
};

function blockingWait(seconds: number) {
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
    path.join(__dirname, '../modules'),
    path.join(__dirname, 'user_modules'),
    path.join(__dirname, '../user_modules')
];

let modulesFiles = [];

for (const dir of modulesDirs) {
    if (!fs.existsSync(dir)) continue;
    const stack = [dir];
    while (stack.length) {
        const current = stack.pop();
        if (current == undefined) break;
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) stack.push(fullPath);
            else if (entry.isFile() && entry.name.endsWith('.js'))
                modulesFiles.push(fullPath);
        }
    }
}

client.commands = new Collection();
for (const filePath of modulesFiles) {
    const module = await import(filePath);
    let botModule: botModule;

    if (typeof module.default === 'function') {
        const ModuleClass = module.default;
        botModule = new ModuleClass();

        console.log(`Loading Module: ${botModule.name}`);
        console.log(`          Path: ${filePath}`);
        console.log(`       Version: ${botModule.version}`);
        console.log(`          Type: ${botModule.type}`);
        console.log(`          Once: ${botModule.once}`);
    } else {
        console.log(`Loading Legacy Module from ${filePath}`);
        botModule = module.default;
    }

    if (!botModule || !botModule.execute) continue;

    if (botModule.slashCommand != null && botModule.execute != null) {
        client.commands.set(botModule.slashCommand.name, botModule);
        continue;
    }

    if (!botModule || !botModule.type) continue;

    if (botModule.once === true) {
        client.once(botModule.type, (...args) => botModule.execute(...args));
    } else {
        client.on(botModule.type, (...args) => botModule.execute(...args));
    }
}

global.messageLogBuffer = [];
global.messageLogBufferMax = 5000;

client.login(config.token);
global.client = client
