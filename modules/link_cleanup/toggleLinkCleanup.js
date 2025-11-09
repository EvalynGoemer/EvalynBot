import { Events, PermissionsBitField } from 'discord.js';

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift().toLowerCase();

        if (command === "!togglelinkcleanup") {
            if (message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                let server = global.db.servers.find(server => server.server_id === message.guild.id);
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
    },
};
