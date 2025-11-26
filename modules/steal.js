import { Events } from 'discord.js';

function getEmojiInfo(input) {
    const animatedEmojiRegex = /<(?:(a):)?([^:]+):(\d+)>/;
    const emojiRegex = /<?([^:]+):(\d+)>/
    let match = animatedEmojiRegex.exec(input);

    if (match) {
        let emojiName = match[2];
        let id = match[3];

        if (match[1] === 'a') {
            return { "type": 'Animated', "name": emojiName, "id": id };
        }
    } else {
        match = emojiRegex.exec(input);
        if (match) {
            let emojiName = match[1];
            let id = match[2];
            return { "type": 'Normal', "name": emojiName, "id": id };
        }
        return null;
    }
}

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift().toLowerCase();

        if (command === "!steal") {
            let emojiData;
            try {
                emojiData = getEmojiInfo(message.content)
            } catch (e) {
                message.reply('Please provide a valid emoji to steal.');
                return;
            }

            if (emojiData == null) {
                message.reply('Please provide a valid emoji to steal.');
                return;
            }

            if (emojiData.type === "Animated") {
                message.reply(`https://cdn.discordapp.com/emojis/${emojiData.id}.gif?animated=true`)
            } else {
                message.reply(`https://cdn.discordapp.com/emojis/${emojiData.id}.png`)
            }
        }
    },
};
