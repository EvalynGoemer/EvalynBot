import { Events, Message, PermissionsBitField } from 'discord.js';

export default class ToggleLinkCleanup implements botModule{
    name = "ToggleLinkCleanup";
    version = "1.0";
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift()?.toLowerCase();

        if (command === "!togglelinkcleanup") {
            if (message.member == null) return;
            if (message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                let server = global.db.servers.find(server => server.server_id === message.guild?.id);
                if (!server) {
                    await message.reply("Please use !initServer to register the server in the database")
                    return;
                }

                if (server.linkCleanupEnabled == null) {
                    server.linkCleanupEnabled = false;
                }

                server.linkCleanupEnabled = server.linkCleanupEnabled ? false : true;
                await message.reply(server.linkCleanupEnabled ? "Link cleanup has been Enabled" : "Link cleanup has been Disabled");
            } else {
                await message.reply("You don't have permission to use this command.");
            }
        }
    }
};
