import { Events, Message, EmbedBuilder } from 'discord.js';

export default class Help implements botModule {
    name = "Help";
    version = "1.1";
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift()?.toLowerCase();

        if (command === "!help") {
            const embed = new EmbedBuilder()
                .setTitle("Help")
                .setDescription(`
===== USER COMMANDS =====
!help - Shows this message
!level - Shows your level and xp
!steal {emoji_to_steal} - Gives the image or gif of an emoji
===== ADMIN COMMANDS =====
!purge {x 1 to 99} - Deletes x messages
!repost - Reposts whatever is after !repost
!initServer -  Sets up server to be used with bot
!toggleLinkCleanup - Enables and disables cleanup of links to remove tracking and improve embeding
!setupReactionRole {reaction_role_message_id} {reaction_role_role_id} {reaction_role_emoji} - Sets up a reaction role
!setupStarboard {starboard_channel_id} {starboard_emoji} {starboard_reaction_threshold} -  Sets up the starboard
`)
            await message.reply({ embeds: [embed] });
        }
    }
};
