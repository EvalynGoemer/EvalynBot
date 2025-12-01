import { Events, EmbedBuilder, User, TextChannel, MessageReaction } from 'discord.js';

export default class Starboard implements botModule {
    name = "Starboard";
    version = "1.0";
    type = Events.MessageReactionAdd;
    once = false;
    async execute(reaction: MessageReaction, user: User) {
        if (user.bot) return;
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();
        if (user.partial) await user.fetch();

        const server = global.db.servers.find(server => server.server_id === reaction.message.guild?.id)

        if (server == null) {
            return;
        }

        if (server.starboard_emoji_id == null) {
            server.starboard_emoji_id = "⭐"
        }
        if (server.starboard_reaction_threshold == null) {
            server.starboard_reaction_threshold = 3
        }

        if (((reaction.emoji.id == server.starboard_emoji_id)
            || (reaction.emoji.name == server.starboard_emoji_id))
            && reaction.count >= server.starboard_reaction_threshold
            && server.starboard_channel_id != null) {
            const starboardChannel = await reaction.message.guild?.channels.fetch(server.starboard_channel_id);
            const starboardTextChannel = starboardChannel as TextChannel;
            if (!starboardChannel) return console.error('Starboard channel not found.');

            const fetchedMessages = await starboardTextChannel.messages.fetch({ limit: 100 });
            const existingPost = fetchedMessages.find(msg => msg.embeds.length > 0 && msg.embeds[0]?.footer?.text.endsWith(`ID: ${reaction.message.id}`));

            if (existingPost) {
                return
            }

            if (!(reaction.message.channel instanceof TextChannel)) return;
            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setAuthor({
                    name: reaction.message.author?.tag ?? "Unknown User",
                    iconURL: reaction.message.author?.displayAvatarURL() ?? "Invalid URL"
                })
                .setDescription(reaction.message.content || null)
                .setTimestamp()
                .setFooter({ text: `Channel: #${reaction.message.channel.name} | ID: ${reaction.message.id}` });

            let hasVideo = false
            if (reaction.message.attachments.size > 0) {
                if (reaction.message.attachments.first()?.contentType?.startsWith("video/")) {
                    hasVideo = true
                } else {
                    embed.setImage(reaction.message.attachments.first()?.url ?? "Invalid URL");
                }
            }

            if (!(starboardChannel instanceof TextChannel)) return;
            await starboardChannel.send({ embeds: [embed] });
            if (hasVideo) {
                await starboardChannel.send({
                    files: [
                        `${reaction.message.attachments.first()?.url}`
                    ]
                })
            }
            await starboardChannel.send(`https://discord.com/channels/${reaction.message.guild?.id}/${reaction.message.channel.id}/${reaction.message.id}`)
        }
    }
};
