import { Events, PermissionsBitField } from 'discord.js';

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift().toLowerCase();

        if (command === "!initserver") {
            if (message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                let server = global.db.servers.find(server => server.server_id === message.guild.id);
                if (server) {
                    await message.reply("This server is already in the database and dose not to be init.")
                    return;
                } else {
                    server = { server_id: message.guild.id };
                    global.db.servers.push(server);
                    await message.reply("Server is now in database!")
                }
            } else {
                await message.reply("You don't have permission to use this command.");
            }
        }
    },
};
