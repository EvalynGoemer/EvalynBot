import { Events, Message } from 'discord.js';

export default class Ready implements botModule {
    name = "LogCleaner";
    version = "1.0";
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.id == global.client.user?.id) return;

        // log bot messages into internal buffer so proxy bots that delete messages and repost them dont clutter logs
        // most of these bots will have thier own logging system for messages so its safe enough to chuck them out

        if (message.webhookId) {
            global.messageLogBuffer.push(message.content)
            if (global.messageLogBuffer.length > global.messageLogBufferMax) global.messageLogBuffer.shift();
        }
    }
};
