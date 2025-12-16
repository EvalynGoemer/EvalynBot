import {SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, PermissionFlagsBits } from 'discord.js';

export default class Help implements botModule {
    name = "SetupLogging";
    version = "1.0";
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder().setName('setup_logging').setDescription('Setup the logging module to output to a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) => option.setName("channel")
    .setDescription("The channel for logs to be sent to. (Leave blank to disable)")
    .setRequired(false)
    .addChannelTypes(ChannelType.GuildText));
    async execute(interaction: ChatInputCommandInteraction) {
        let server = global.db.servers.find(server => server.server_id === interaction.guild?.id);
        if (!server) {
            await interaction.reply("Please use /initServer to register the server in the database")
            return;
        }

        let channel = interaction.options.getChannel("channel");
        if (channel != null) {
            server.logging_channel_id = channel.id;
            await interaction.reply("Logging Enabled!")
        } else {
            server.logging_channel_id = "";
            await interaction.reply("Logging Disabled!")
        }
    }
};
