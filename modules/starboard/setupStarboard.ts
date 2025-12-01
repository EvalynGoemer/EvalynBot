import { Events, Message, TextChannel, PermissionsBitField } from 'discord.js';
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
    version = "1.1"
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift()?.toLowerCase();

        if (command === "!setupstarboard") {
            if (!(message.channel instanceof TextChannel)) return;
            if (!message.member?.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                await message.reply("You don't have permission to use this command.");
                return;
            }

            let server = global.db.servers.find(server => server.server_id === message.guild?.id);
            if (!server) {
                await message.reply("Please use !initServer to register the server in the database")
                return;
            }

            let starboardChannelID = null
            let starbordEmojiID = null
            let starboardReactionThreshold = null
            const channel = global.client.channels.cache.get(String(args[0]));
            if (!channel) {
                await message.reply("Channel ID is invalid.")
                await message.channel.send("Please use the command correctly !setupStarboard {starboard_channel_id} {starboard_emoji} {starboard_reaction_threshold}")
                return;
            }
            if (!(channel instanceof TextChannel)) {
                await message.reply("Channel ID is invalid. Ensure it is a text channel inside a guild.")
                return;
            }
            if (channel.guildId != server.server_id) {
                await message.reply("Channel ID is not from this server. Nice try ;3")
                return;
            }
            starboardChannelID = String(args[0])

            let emojiInfo = getEmojiInfo(args[1] ?? "")
            if (emojiInfo.valid == true) {
                starbordEmojiID = emojiInfo.id
            } else {
                if (args[1] != null && (args[1].match(emojiRegex()) || []).length === 1) {
                    starbordEmojiID = args[1]
                } else {
                    await message.reply("Emoji is invalid.");
                    await message.channel.send("Please use the command correctly !setupStarboard {starboard_channel_id} {starboard_emoji} {starboard_reaction_threshold}")
                    return;
                }
            }

            starboardReactionThreshold = parseInt(args[2] ?? "3")

            if (isNaN(starboardReactionThreshold) || starboardReactionThreshold < 1 || starboardReactionThreshold > 100) {
                await message.reply("Starboard Reaction Threshold is invalid or not between 1 and 100.")
                await message.channel.send("Please use the command correctly !setupStarboard {starboard_channel_id} {starboard_emoji} {starboard_reaction_threshold}")
                return;
            }

            server.starboard_channel_id = starboardChannelID
            server.starboard_emoji_id = starbordEmojiID
            server.starboard_reaction_threshold = starboardReactionThreshold
            await message.reply("Starboard is now setup!")
        }
    }
}
