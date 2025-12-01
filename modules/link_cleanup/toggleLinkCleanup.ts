import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, InteractionContextType } from 'discord.js';

export default class ToggleLinkCleanup implements botModule{
    name = "ToggleLinkCleanup";
    version = "1.1";
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder()
    .setName('toggle_link_cleanup')
    .setDescription("Sets up server to be used with bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild);
    async execute(interaction: ChatInputCommandInteraction) {
        let server = global.db.servers.find(server => server.server_id === interaction.guild?.id);
        if (!server) {
            await interaction.reply("Please use /initServer to register the server in the database")
            return;
        }

        if (server.linkCleanupEnabled == null) {
            server.linkCleanupEnabled = false;
        }

        server.linkCleanupEnabled = server.linkCleanupEnabled ? false : true;
        await interaction.reply(server.linkCleanupEnabled ? "Link cleanup has been Enabled" : "Link cleanup has been Disabled");
    }
};
