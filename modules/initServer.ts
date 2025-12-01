import { Events, Message, PermissionsBitField } from 'discord.js';

export default class InitServer implements botModule {
    name = "InitServer";
    version = "1.1";
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift()?.toLowerCase();

        if (command === "!initserver") {
            if (message.member == null) return;
            if (message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                let server = global.db.servers.find(server => server.server_id === message.guild?.id);
                if (server) {
                    await message.reply("This server is already in the database and dose not to be init.")
                    return;
                } else {
                    if (message.guild?.id == undefined) {
                        message.reply("Failed to add server to database");
                        return;
                    }
                    server = { server_id: message.guild.id };
                    global.db.servers.push(server);
                    await message.reply("Server is now in database!")
                }
            } else {
                await message.reply("You don't have permission to use this command.");
            }
        }
    }
};
