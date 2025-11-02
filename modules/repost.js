import { Events, PermissionsBitField } from 'discord.js';

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift().toLowerCase();

        if (command === "!repost") {
            if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                const content = message.content.slice(command.length).trim();
                if (content.length > 0) {
                    await message.channel.send(content);
                }
                
                if (message.attachments.size > 0) {
                    await message.channel.send({files: [`${message.attachments.first().url}`]})
                }

                message.delete();
            } else {
                await message.reply("You don't have permission to use this command.");
            }
        }

    },
};
