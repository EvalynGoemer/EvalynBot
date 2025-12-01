import { Events, Message, TextChannel, PermissionsBitField } from 'discord.js';

export default class Purge implements botModule {
    name = "Purge";
    version = "1.1";
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift()?.toLowerCase();

        if (command === '!purge') {
            if (message.member == null) return;
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return message.reply("You don't have permission to use this command!");
            }

            if (!args[0]) return;
            let amount = parseInt(args[0]) + 1;

            amount = Math.min(Math.max(amount, 1), 100);

            if (!(message.channel instanceof TextChannel)) return;
            const deletedMessages = await message.channel.bulkDelete(amount, true);
            message.channel.send(`Successfully deleted ${deletedMessages.size} messages.`).then((msg) => setTimeout(() => msg.delete(), 5000));
        }
    }
};
