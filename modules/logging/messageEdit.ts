import { Events, Message, EmbedBuilder, TextChannel } from 'discord.js';

export default class Ready implements botModule {
    name = "MessageEditLogger";
    version = "1.0";
    type = Events.MessageUpdate;
    once = false;
    async execute(...args: any[]) {
        const oldMessage = args[0] as Message;
        const newMessage = args[1] as Message;

        if (!oldMessage || !newMessage) return;
        if (!(oldMessage instanceof Message) || !(newMessage instanceof Message)) return;

        if (newMessage.author.bot) return;

        const server = global.db.servers.find(server => server.server_id === newMessage.guild?.id)

        if (server == null) {
            return;
        }

        if (server.logging_channel_id == null) {
            return;
        }

        if (server.logging_channel_id == "") {
            return;
        }

        if (!newMessage.inGuild()) return;
        const embed = new EmbedBuilder()
        .setColor(0x4086FF)
        .setAuthor({
            name: newMessage.author?.tag ?? "Unknown User",
            iconURL: newMessage.author?.displayAvatarURL() ?? "Invalid URL"
        })
        .setDescription(
            `**Old:**\n${oldMessage?.content || '*Could not fetch*'}\n\n` +
            `**New:**\n${newMessage.content || '*empty*'}`
        )
        .setTimestamp()
        .setTitle(`Message Edited in #${newMessage.channel.name}`)
        .setFooter({ text: `ID: ${newMessage.id}`});

        const loggingChannel = await newMessage.guild?.channels.fetch(server.logging_channel_id);
        const loggingTextChannel = loggingChannel as TextChannel;

        await loggingTextChannel.send({ embeds: [embed] });
    }
};
