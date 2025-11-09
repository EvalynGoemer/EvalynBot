import { Events, PermissionsBitField } from 'discord.js';
import emojiRegex from 'emoji-regex';

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

        if (command === "!setupstarboard") {
            if (message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                let server = global.db.servers.find(server => server.server_id === message.guild.id);
                if (!server) {
                    await message.reply("Please use !initServer to register the server in the database")
                    return;
                }

                let starboardChannelID = null
                let starbordEmojiID = null
                let starboardReactionThreshold = null
                try {
                    const channel = global.client.channels.cache.get(String(args[0]));
                    if (!channel) {
                        await message.reply("Channel ID is invalid.")
                        await message.channel.send("Please use the command correctly !setupStarboard {starboard_channel_id} {starboard_emoji} {starboard_reaction_threshold}")
                        return;
                    }
                    if (channel.guildId != server.server_id) {
                        await message.reply("Channel ID is not from this server. Nice try ;3")
                        return;
                    }
                    starboardChannelID = String(args[0])

                    let emojiInfo = getEmojiInfo(args[1])
                    if (emojiInfo == null) {
                        if (args[1] == null) {
                            args[1] = "invalid"
                        }
                        if ((args[1].match(emojiRegex()) || []).length === 1) {
                            starbordEmojiID = args[1]
                        } else {
                            await message.reply("Emoji is invalid.");
                            await message.channel.send("Please use the command correctly !setupStarboard {starboard_channel_id} {starboard_emoji} {starboard_reaction_threshold}")
                            return;
                        }
                    } else {
                        starbordEmojiID = emojiInfo.id
                    }

                    if (args[2] == null) {
                        args[2] = -1
                    }

                    starboardReactionThreshold = parseInt(args[2])

                    if (isNaN(starboardReactionThreshold) || starboardReactionThreshold < 1 || starboardReactionThreshold > 100) {
                        await message.reply("Starboard Reaction Threshold is invalid or not between 1 and 100.")
                        await message.channel.send("Please use the command correctly !setupStarboard {starboard_channel_id} {starboard_emoji} {starboard_reaction_threshold}")
                        return;
                    }
                } catch (e) {
                    await message.reply("Please use the command correctly !setupStarboard {starboard_channel_id} {starboard_emoji} {starboard_reaction_threshold}")
                    console.log(e)
                    return;
                }

                if (starboardChannelID != null && starbordEmojiID != null && starboardReactionThreshold != null) {
                    server.starboard_channel_id = starboardChannelID
                    server.starboard_emoji_id = starbordEmojiID
                    server.starboard_reaction_threshold = starboardReactionThreshold

                    await message.reply("Starboard is now setup!")
                } else {
                    await message.reply("Please use the command correctly !setupStarboard {starboard_channel_id} {starboard_emoji} {starboard_reaction_threshold}")
                }
            } else {
                await message.reply("You don't have permission to use this command.");
            }
        }
    },
};
