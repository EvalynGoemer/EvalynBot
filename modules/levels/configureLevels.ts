import {SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

export default class Help implements botModule {
    name = "ConfigureLevels";
    version = "1.0";
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder()
    .setName('configure_levels').setDescription('Configure Level System')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) => subcommand
    .setName('mult')
    .setDescription('Set the xp gain multiplier')
    .addNumberOption((option) => option.setName('multiplier').setDescription('The xp gain multiplier').setRequired(true).setMinValue(0.5).setMaxValue(100)))
    .addSubcommand((subcommand) => subcommand
    .setName('roles')
    .setDescription('Give roles on level milestone')
    .addNumberOption((option) => option.setName('level').setDescription('The level to give the role on').setRequired(true).setMinValue(0).setMaxValue(999))
    .addRoleOption((option) => option.setName('role').setDescription('The role to give').setRequired(true))
    .addBooleanOption((option) => option.setName('delete').setDescription('Set to true to delete from database (Role ignored)').setRequired(false))
    ).addSubcommand((subcommand) => subcommand
    .setName('info')
    .setDescription('Get info on the current config')
    );
    async execute(interaction: ChatInputCommandInteraction) {
        let server = global.db.servers.find(server => server.server_id === interaction.guild?.id);
        if (!server) {
            await interaction.reply("Please use /initServer to register the server in the database")
            return;
        }

        if (server.xpMult == null) {
            server.xpMult = 1;
        }

        if (server.xpMilestones == null) {
            server.xpMilestones = {

            }
        }

        if (interaction.options.getSubcommand(true) == "mult") {
            server.xpMult = interaction.options.getNumber("multiplier")!;
            interaction.reply("Multiplier Set");
        } else if (interaction.options.getSubcommand(true) == "roles") {
            if (interaction.options.getBoolean("delete")) {
                const level = interaction.options.getNumber("level")!;
                if (server.xpMilestones && level in server.xpMilestones) {
                    delete server.xpMilestones[level];
                }
                await interaction.reply("Deleted Level Role")
                return;
            }

            server.xpMilestones[interaction.options.getNumber("level")!] = interaction.options.getRole("role")!.id
            interaction.reply("Level Role Setup");
        } else if (interaction.options.getSubcommand(true) == "info") {
            const header = [
                "=== Level Config ===",
                `XP Multiplier ${server.xpMult}x`,
                "=== Current Level Milestones==="
            ];

            const result = [
                ...header,
                ...Object.entries(server.xpMilestones).map(
                    ([level, roleID]) => `Level: ${level} : RoleID: ${roleID}`
                )
            ].join("\n");


            interaction.reply(result);
        } else {
            interaction.reply("Use a sub command");
        }
    }
};
