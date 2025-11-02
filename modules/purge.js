import { Events, PermissionsBitField } from 'discord.js';

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift().toLowerCase();

        if (command === '!purge') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return message.reply("You don't have permission to use this command!");
            }

            let amount = parseInt(args[0]) + 1;

            if(amount == 101) {
                amount = 100
            }

            if (isNaN(amount) || amount < 1 || amount > 100) {
                return message.reply('Please specify a number between 1 and 99.');
            }

            try {
                const deletedMessages = await message.channel.bulkDelete(amount, true);
                message.channel
                .send(`Successfully deleted ${deletedMessages.size} messages.`)
                .then((msg) => setTimeout(() => msg.delete(), 5000));
            } catch (error) {
                console.error("Error in purge.js: ", error);
                message.reply('There was an error trying to purge messages in this channel.');
            }
        }
    },
};
