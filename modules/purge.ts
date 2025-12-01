import { PermissionFlagsBits, SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType, TextChannel } from 'discord.js';

export default class Purge implements botModule {
    name = "Purge";
    version = "1.2";
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge X messages in current channel')
    .addNumberOption((option) => option.setName("number").setDescription('The number of messages to purge').setRequired(true).setMinValue(2).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setContexts(InteractionContextType.Guild);
    async execute(interaction: ChatInputCommandInteraction) {
        if (!(interaction.channel instanceof TextChannel)) return;
        const deletedMessages = await interaction.channel.bulkDelete(interaction.options.getNumber("number")!, true);
        interaction.reply(`Successfully deleted ${deletedMessages.size} messages.`).then((msg) => setTimeout(() => msg.delete(), 5000));
    }
};
