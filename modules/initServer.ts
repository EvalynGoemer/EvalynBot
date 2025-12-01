import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, InteractionContextType } from 'discord.js';

export default class InitServer implements botModule {
    name = "InitServer";
    version = "1.2";
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder()
    .setName('init_server')
    .setDescription("Sets up server to be used with bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild);
    async execute(interaction: ChatInputCommandInteraction) {
        let server = global.db.servers.find(server => server.server_id === interaction.guild?.id);
        if (server) {
            await interaction.reply("This server is already in the database and does not to be init.")
            return;
        } else {
            if (interaction.guild?.id == undefined) {
                interaction.reply("Failed to add server to database");
                return;
            }
            server = { server_id: interaction.guild.id };
            global.db.servers.push(server);
            await interaction.reply("Server is now in database!")
        }
    }
};
