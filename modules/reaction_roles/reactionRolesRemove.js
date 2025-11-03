import { Events } from 'discord.js';

export default {
    name: Events.MessageReactionRemove,
    once: false,
    async execute(reaction, user) {
        if (user.bot) return;

        try {
            if (reaction.partial) await reaction.fetch();
            if (reaction.message.partial) await reaction.message.fetch();
            if (user.partial) await user.fetch();

            try {
                const server = global.db.servers.find(server => server.server_id === reaction.message.guild.id)
                const message = server.reaction_roles.find(message => message.message_id === reaction.message.id);
                const reactionRole = message.roles.find(reactionRole => (reactionRole.emoji_id === reaction.emoji.id || reactionRole.emoji_id === reaction.emoji.name));

                const guild = reaction.message.guild;
                const member = await guild.members.fetch(user.id);
                const role = guild.roles.cache.get(reactionRole.role_id);
                await member.roles.remove(role)
            } catch (error) {
            }
        } catch (error) {
            console.error('Error in reactionRolesRemove.js: ', error);
        }
    },
};
