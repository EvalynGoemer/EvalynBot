import config from "./config.json" with {type: "json"}

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { REST, Routes } from 'discord.js'

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

const commands = [];
for (const filePath of modulesFiles) {
    const module = await import(filePath);
    let botModule: botModule;

    if (typeof module.default === 'function') {
        const ModuleClass = module.default;
        botModule = new ModuleClass();
        if (!botModule.slashCommand) continue;
        console.log(`Registering Module Commands: ${botModule.name}`);
        console.log(`                       Path: ${filePath}`);
        console.log(`                    Version: ${botModule.version}`);
        console.log(`                       Type: ${botModule.type}`);
        console.log(`                       Once: ${botModule.once}`);
    } else {
        continue;
    }

    if (!botModule || !botModule.execute || !botModule.slashCommand) continue;

    commands.push(botModule.slashCommand);
}

const rest = new REST().setToken(config.token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        if (config.devMode == true
            && config.clientId != null
            && config.guildId != null
            && config.clientId != "CLIENT ID HERE"
            && config.guildId != "GUILD ID HERE") {
                await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands })
                console.log(`Successfully loaded ${commands.length} application (/) commands.`);
            } else if (config.devMode == false
                && config.clientId != null
                && config.clientId != "CLIENT ID HERE") {
                await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
                console.log(`Successfully loaded ${commands.length} application (/) commands.`);
            } else {
                console.log("Invalid Config File");
            }
    } catch (error) {
        console.error(error);
    }
})();
