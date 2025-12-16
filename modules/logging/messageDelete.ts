import { Events, Message, EmbedBuilder, TextChannel } from 'discord.js';

export default class Ready implements botModule {
    name = "MessageDeleteLogger";
    version = "1.0";
    type = Events.MessageDelete;
    once = false;
    async execute(message: Message) {
        if (!message) return;
        if (message.partial) return;
        if (message.author.bot && !message.webhookId) return;
        if (message.author.id == global.client.user?.id) return;

        const server = global.db.servers.find(server => server.server_id === message.guild?.id)

        if (server == null) {
            return;
        }

        if (server.logging_channel_id == null) {
            return;
        }

        if (server.logging_channel_id == "") {
            return;
        }

        if (!message.inGuild()) return;

        const embed = new EmbedBuilder()
        .setColor(0xFF4545)
        .setAuthor({
            name: message.author?.tag ?? "Unknown User",
            iconURL: message.author?.displayAvatarURL() ?? "Invalid URL"
        })
        .setDescription(message.content || null)
        .setTimestamp()
        .setTitle(`Message Deleted in #${message.channel.name}`)
        .setFooter({ text: `ID: ${message.id}` });

        if (message.attachments.size > 0) {
            const urls = message.attachments.map(att => att.url);
            let attachmentText = `\n\n**Attachments:**\n${urls.join("\n")}`;

            if (!message.attachments.first()?.contentType?.startsWith("video/")) {
                embed.setImage(message.attachments.first()?.url ?? "Invalid URL");
            }

            embed.setDescription((embed.data.description || "") + attachmentText);
        }

        const loggingChannel = await message.guild?.channels.fetch(server.logging_channel_id);
        const loggingTextChannel = loggingChannel as TextChannel;

        await loggingTextChannel.send({ embeds: [embed] }).then((msg) => setTimeout(() => {
            // delete logs for messages in internal buffer
            // messages are put here by the bot if it know its safe to not log them
            // eg it wont log messages it deleted sent from linkCleanup.ts
            // and it wont log messages sent by any webhook as it is assumed if they
            // are deleting messages they have thier own way of logging and its
            // known that thoes kinds of deletions clutter logs heavily and
            // deleting the "proxied" message still gets propery logged
            // so if your other bots are properly behaved this is safe and
            // pretty minor if it can even be abused and have messaes not logged
            // because you have a thing called eyeballs and the ability
            // to deduce and reason with people and find out whats going on.
            // this also wont help with every kind of spam from these bots
            // or other bots deleting messages on a command usage but
            // it clears enough and its bettter than nothing.
            const index = global.messageLogBuffer.indexOf(message.content);
            if (index !== -1) {
                msg.delete().catch();
                global.messageLogBuffer.splice(index, 1);
            }
        }, 2000));
    }
};
