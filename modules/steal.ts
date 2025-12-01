import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

interface discordEmioji {
    valid: boolean;
    animated: boolean;
    name: string;
    id: string;
}

function getEmojiInfo(input: string): discordEmioji {
    const emojiRegex = /<(a)?:([ -~]+):([0-9]+)>/
    let match = emojiRegex.exec(input);
    let result: discordEmioji = { valid: false, animated: false, name: "INVALID", id: "INVALID" };

    if (match?.[0]) {
        if (match[1] === "a") {
            result.animated = true;
        }

        result.name = match[2]!;
        result.id = match[3]!;

        result.valid = true;
    }

    return result;
}

export default class Steal implements botModule {
    name = "Steal";
    version = "1.2";
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder()
    .setName('steal')
    .setDescription("Steal an emoji (Provides the image file)")
    .addStringOption((option) => option.setName("emoji").setDescription("Emoji to be stolen").setRequired(true))
    async execute(interaction: ChatInputCommandInteraction) {
        let emojiData: discordEmioji = getEmojiInfo(interaction.options.getString("emoji")!)

        if (emojiData.valid == false) {
            interaction.reply('Please provide a valid emoji to steal.');
            return;
        }

        if (emojiData.animated == true) {
            interaction.reply(`https://cdn.discordapp.com/emojis/${emojiData.id}.gif?animated=true`)
        } else {
            interaction.reply(`https://cdn.discordapp.com/emojis/${emojiData.id}.png`)
        }
    }
};
