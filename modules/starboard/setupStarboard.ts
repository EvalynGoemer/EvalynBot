import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ChannelType, InteractionContextType } from 'discord.js';
import emojiRegex from 'emoji-regex';

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

export default class SetupStarboard implements botModule {
    name = "SetupStarboard";
    version = "1.2"
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder()
    .setName('setup_starboard')
    .setDescription("Sets up the server starboard")
    .addChannelOption((option) => option.setName("channel").setDescription("The channel for the starboard to be in").setRequired(true).addChannelTypes(ChannelType.GuildText))
    .addStringOption((option) => option.setName("emoji").setDescription("Emoiji to count for putting things on the starboard").setRequired(true))
    .addNumberOption((option) => option.setName("number").setDescription("The number of reactions of the starboard emoji needed to pin").setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild);
    async execute(interaction: ChatInputCommandInteraction) {

            let server = global.db.servers.find(server => server.server_id === interaction.guild?.id);
            if (!server) {
                await interaction.reply("Please use /initServer to register the server in the database")
                return;
            }

            let starbordEmojiID = null
            let emojiString = interaction.options.getString("emoji")!;
            let emojiInfo = getEmojiInfo(emojiString)
            if (emojiInfo.valid == true) {
                starbordEmojiID = emojiInfo.id
            } else {
                if (emojiString != null && (emojiString.match(emojiRegex()) || []).length === 1) {
                    starbordEmojiID = emojiString
                } else {
                    await interaction.reply("Emoji is invalid.");
                    return;
                }
            }

            let channel = interaction.options.getChannel("channel");
            if (channel == null) {
                await interaction.reply("Error: Channel could not be found")
                return;
            }

            server.starboard_channel_id = channel.id
            server.starboard_emoji_id = starbordEmojiID
            server.starboard_reaction_threshold = interaction.options.getNumber("number")!
            await interaction.reply("Starboard is now setup!")
    }
}
