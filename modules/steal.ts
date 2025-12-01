import { Events, Message } from 'discord.js';

interface discordEmioji {
    valid: boolean;
    animated: boolean;
    name: string;
    id: string;
}

function getEmojiInfo(input: string): discordEmioji {
    const emojiRegex = /<(a)?:([ -~]+):([0-9]+)>/
    let match = emojiRegex.exec(input);
    let result: discordEmioji = {valid: false, animated: false, name: "INVALID", id: "INVALID"};

    if (match?.[0]) {
        if (match[1] === "a") {
            result.animated = true;
        }

        result.name = match[2]!;
        result.id =  match[3]!;

        result.valid = true;
    }

    return result;
}

export default class Steal implements botModule {
    name = "Steal";
    version = "1.1";
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift()?.toLowerCase();

        if (command === "!steal") {
            if (args[0] === undefined) {
                message.reply('Please provide an emoji to steal.');
                return;
            }

            let emojiData: discordEmioji = getEmojiInfo(args[0])

            if (emojiData.valid == false) {
                message.reply('Please provide a valid emoji to steal.');
                return;
            }

            if (emojiData.animated == true) {
                message.reply(`https://cdn.discordapp.com/emojis/${emojiData.id}.gif?animated=true`)
            } else {
                message.reply(`https://cdn.discordapp.com/emojis/${emojiData.id}.png`)
            }
        }
    }
};
