import {SlashCommandBuilder, CommandInteraction } from 'discord.js';

export default class Help implements botModule {
    name = "Example Typescript Slash Command Module";
    version = "1.0";
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder().setName('example').setDescription('Example slash command');
    async execute(interaction: CommandInteraction) {
        await interaction.reply("Example Slash Command Module Working :3");
    }
};
