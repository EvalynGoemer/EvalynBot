import { Events, Message } from 'discord.js';

export default class Levels implements botModule {
    name = "Levels";
    version = "1.1";
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift()?.toLowerCase();

        const server = global.db.servers.find(server => server.server_id === message.guild?.id)

        if (server == null) return;
        if (server.users == null) server.users = [];

        let user = server.users.find(user => user.id === message.author.id);

        if (user == null) {
            user = {
                id: message.author.id,
                xp: Math.floor(Math.random() * (10 - 1 + 1) + 1),
                lastMessageThatGaveXpTimestamp: Date.now()
            }

            server.users.push(user)
        }

        if (Date.now() - user.lastMessageThatGaveXpTimestamp >= 60000) {
            user.xp += Math.floor(Math.random() * (10 - 1 + 1) + 1);
            user.lastMessageThatGaveXpTimestamp = Date.now()
        }
    }
};
