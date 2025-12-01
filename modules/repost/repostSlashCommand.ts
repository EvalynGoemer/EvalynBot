import { PermissionFlagsBits, SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags, InteractionContextType } from 'discord.js';

export default class RepostSlashCommand implements botModule {
    name = "RepostSlashCommand";
    version = "1.0";
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder()
    .setName('repost')
    .setDescription('Make the bot say something --- See !repost the text command for a more advanced option')
    .addStringOption((option) => option.setName('input').setDescription('The text to be sent').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setContexts(InteractionContextType.Guild);
    async execute(interaction: ChatInputCommandInteraction) {
        const string = interaction.options.getString("input")!
        if (!(interaction.channel instanceof TextChannel)) {
            await interaction.reply({
                content: 'Unable to send.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        };
        await interaction.reply({
            content: 'Sent!',
            flags: MessageFlags.Ephemeral,
        });
        await interaction.channel.send(string);
    }
};
