import { Events, PermissionsBitField, Message, TextChannel } from 'discord.js';
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

export default class SetupReactionRoles implements botModule {
    name = "SetupReactionRoles";
    version = "1.1"
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift()?.toLowerCase();

        if (command === "!setupreactionrole") {
            if (!(message.channel instanceof TextChannel)) return;
            if (!message.member?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                await message.reply("You don't have permission to use this command.");
                return;
            }

            let server = global.db.servers.find(server => server.server_id === message.guild?.id);
            if (!server) {
                await message.reply("Please use !initServer to register the server in the database")
                return;
            }

            let reactionRoleMessageID = null;
            let reactionRoleRoleID = null;
            let reactionRoleEmojiID = null;

            if (args[0] == null) {
                await message.reply("Reaction Role Message ID is invalid")
                await message.channel.send("Please use the command correctly !setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji}")
                return;
            } else {
                if (/^\d+$/.test(args[0])) {
                    reactionRoleMessageID = args[0]
                } else {
                    await message.reply("Reaction Role Message ID is invalid")
                    await message.channel.send("Please use the command correctly !setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji}")
                    return;
                }
            }

            const channel = global.client.channels.cache.get(message.channel.id);
            const textChannel = channel as TextChannel;
            const msg = await textChannel.messages.fetch(reactionRoleMessageID);

            if (msg.guildId !== server.server_id) {
                await message.reply("Message ID is not from this server. Nice try ;3");
                return;
            }

            if (args[1] == null) {
                await message.reply("Reaction Role Role ID is invalid")
                await message.channel.send("Please use the command correctly !setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji}")
                return;
            } else {
                if (/^\d+$/.test(args[1])) {
                    reactionRoleRoleID = args[1]
                } else {
                    await message.reply("Reaction Role Role ID is invalid")
                    await message.channel.send("Please use the command correctly !setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji}")
                    return;
                }
            }

            if (args[2] == null) {
                await message.reply("Emoji is invalid.");
                await message.channel.send("Please use the command correctly !setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji}")
                return;
            } else {
                let emojiInfo = getEmojiInfo(args[2])

                if (emojiInfo.valid == true) {
                    reactionRoleEmojiID = emojiInfo.id
                } else {
                    if (args[2] == null) {
                        await message.reply("Emoji is invalid.");
                        await message.channel.send("Please use the command correctly !setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji}")
                        return;
                    }

                    if ((args[2].match(emojiRegex()) || []).length === 1) {
                        reactionRoleEmojiID = args[2]
                    } else {
                        await message.reply("Emoji is invalid.");
                        await message.channel.send("Please use the command correctly !setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji}")
                        return;
                    }
                }
            }

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

            msg.react(reactionRoleEmojiID).catch(async () => {
                await message.reply(`Bot could not react to message with emoji id: ${reactionRoleEmojiID}\n`)
            });

            await message.reply("Reaction Role Setup!")
            return;
        }
    }
};
