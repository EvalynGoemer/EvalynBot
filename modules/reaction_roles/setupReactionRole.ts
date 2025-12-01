import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel, InteractionContextType } from 'discord.js';
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
    version = "1.2"
    type = false;
    once = false;
    slashCommand = new SlashCommandBuilder()
        .setName('setup_reaction_role')
        .setDescription("Sets up the server starboard")
        .addStringOption((option) => option.setName("message_id").setDescription("The ID of the message to bind this to").setRequired(true))
        .addStringOption((option) => option.setName("role_id").setDescription("The ID of the role to give on reaction").setRequired(true))
        .addStringOption((option) => option.setName("emoji").setDescription("Emoiji to react to for role").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setContexts(InteractionContextType.Guild);
    async execute(interaction: ChatInputCommandInteraction) {

        let server = global.db.servers.find(server => server.server_id === interaction.guild?.id);
        if (!server) {
            await interaction.reply("Please use /initServer to register the server in the database")
            return;
        }

        let reactionRoleMessageID = null;
        let reactionRoleRoleID = null;
        let reactionRoleEmojiID = null;

        if (/^\d+$/.test(interaction.options.getString("message_id")!)) {
            reactionRoleMessageID = interaction.options.getString("message_id")!
        } else {
            await interaction.reply("message_id is invalid")
            return;
        }

        if (interaction.channel?.id == null) {
            await interaction.reply("Error: could not validate message ID is from this server");
            return;
        }

        const channel = global.client.channels.cache.get(interaction.channel.id);
        const textChannel = channel as TextChannel;
        const msg = await textChannel.messages.fetch(reactionRoleMessageID).catch(() => {
            interaction.reply("Message ID is invalid");
        });

        if (!msg) return;

        if (msg?.guildId !== server.server_id) {
            await interaction.reply("Message ID is not from this server. Nice try ;3");
            return;
        }

        if (/^\d+$/.test(interaction.options.getString("role_id")!)) {
            reactionRoleRoleID = interaction.options.getString("role_id")!
        } else {
            await interaction.reply("role_id is invalid")
            return;
        }

        let emojiString = interaction.options.getString("emoji")!
        let emojiInfo = getEmojiInfo(emojiString)
        if (emojiInfo.valid == true) {
            reactionRoleEmojiID = emojiInfo.id
        } else {
            if ((emojiString.match(emojiRegex()) || []).length === 1) {
                reactionRoleEmojiID = emojiString
            } else {
                await interaction.reply("Emoji is invalid.");
                return;
            }
        }

        if (!server) {
            await interaction.reply("Please use /initServer to register the server in the database")
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
            if (!(interaction.channel instanceof TextChannel)) return;
            await interaction.channel.send(`Bot could not react to message with emoji id: ${reactionRoleEmojiID}\n`)
        });

        await interaction.reply("Reaction Role Setup!")
        return;
    }
};
