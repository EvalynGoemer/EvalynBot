import { Events, Message } from 'discord.js';

export default class Ready implements botModule {
    name = "Example Typescript Module";
    version = "1.0";
    type = Events.ClientReady;
    once = true;
    async execute(message: Message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift()?.toLowerCase();

        if (command === "!example") {
            await message.reply("Example Module Working :3");
        }
    }
};
