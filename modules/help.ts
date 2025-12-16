import {EmbedBuilder, SlashCommandBuilder, CommandInteraction } from 'discord.js';

export default class Help implements botModule {
    name = "Help";
    version = "1.2";
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder().setName('help').setDescription('Gives a list of commands and a description of them');
    async execute(interaction: CommandInteraction) {
        const embed = new EmbedBuilder()
            .setTitle("Help")
            .setDescription(`
===== USER SLASH COMMANDS =====
/help - Shows this message
/level ?{user} - Shows yours or anothers current level and xp
/steal {emoji_to_steal} - Gives the image or gif of an emoji
===== ADMIN SLASH COMMANDS =====
/purge {x 2 to 100} - Deletes x messages
/repost {text} - Reposts whatever you type (More limited than the text based version)
/init_server - Sets up server to be used with bot
/toggle_link_cleanup - Enables and disables cleanup of links to remove tracking and improve embeding
/setup_logging ?{channel} - Setup the logging module to output to a channel. If {channel} is empty disable logging
/setup_reaction_role {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji} - Sets up a reaction role
/setup_starboard {starboard_channel_id} {starboard_emoji} {starboard_reaction_threshold} -  Sets up the starboard
===== ADMIN TEXT COMMANDS =====
!repost - Reposts whatever you type (Supports Multible Lines & Images)
`)
        await interaction.reply({ embeds: [embed] });
    }
};
