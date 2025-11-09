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

        if (command === "!setupreactionrole") {
            try {
                if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    await message.reply("You don't have permission to use this command.");
                    return;
                }

                let server = global.db.servers.find(server => server.server_id === message.guild.id);
                if (!server) {
                    await message.reply("Please use !initServer to register the server in the database")
                    return;
                }

                let reactionRoleMessageID = null;
                let reactionRoleRoleID = null;
                let reactionRoleEmojiID = null;

                if (/^\d+$/.test(args[0])) {
                    reactionRoleMessageID = args[0]
                } else {
                    await message.reply("Reaction Role Message ID is invalid")
                    await message.channel.send("Please use the command correctly !setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji}")
                    return;
                }

                try {
                    const chnl = global.client.channels.cache.get(message.channel.id);
                    const msg = await chnl.messages.fetch(reactionRoleMessageID);

                    if (msg.guildId !== server.server_id) {
                        await message.reply("Message ID is not from this server. Nice try ;3");
                        return;
                    }
                } catch (e) {
                    await message.reply("Message ID is not from this server. Nice try ;3");
                    return;
                }

                if (/^\d+$/.test(args[1])) {
                    reactionRoleRoleID = args[1]
                } else {
                    await message.reply("Reaction Role Role ID is invalid")
                    await message.channel.send("Please use the command correctly !setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji}")
                    return;
                }

                let emojiInfo = getEmojiInfo(args[2])

                if (emojiInfo == null) {
                    if (args[2] == null) {
                        args[2] = "invalid"
                    }

                    if ((args[2].match(emojiRegex()) || []).length === 1) {
                        reactionRoleEmojiID = args[2]
                    } else {
                        await message.reply("Emoji is invalid.");
                        await message.channel.send("Please use the command correctly !setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji}")
                        return;
                    }
                } else {
                    reactionRoleEmojiID = emojiInfo.id
                }

                if (reactionRoleMessageID != null && reactionRoleRoleID != null && reactionRoleEmojiID != null) {
                    if (!server) {
                        await message.reply("Please use !initServer to register the server in the database")
                        return;
                    }

                    if (!server.reaction_roles) {
                        server.reaction_roles = []
                    }

                    let dbMessage = server.reaction_roles.find(dbMessage => dbMessage.message_id === reactionRoleMessageID);
                    if (!dbMessage) {
                        dbMessage = {
                            message_id: reactionRoleMessageID,
                            roles: []
                        };
                        server.reaction_roles.push(dbMessage);
                    }

                    let reactionRole = dbMessage.roles.find(reactionRole => reactionRole.role_id === reactionRoleRoleID);
                    if (!reactionRole) {
                        reactionRole = {
                            emoji_id: reactionRoleEmojiID,
                            role_id: reactionRoleRoleID
                        };
                        dbMessage.roles.push(reactionRole);
                    } else {
                        reactionRole.emoji_id = reactionRoleEmojiID;
                        reactionRole.role_id = reactionRoleRoleID;
                    }

                    await message.reply("Reaction Role Setup!")
                    return;
                }
            } catch (e) {
                console.log(e)
            }
        }
    },
};
