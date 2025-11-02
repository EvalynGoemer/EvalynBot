import { Events } from 'discord.js';

export default {
    name: Events.MessageReactionAdd,
    once: false,
    async execute(reaction, user) {
        if (user.bot) return;
        try {
            if (reaction.partial) await reaction.fetch();
            if (reaction.message.partial) await reaction.message.fetch();
            if (user.partial) await user.fetch();

            const guild = reaction.message.guild;
            const member = await guild.members.fetch(user.id);
            const server = global.db.servers.find(server => server.server_id === reaction.message.guild.id)

            try {
                const message = server.reaction_roles.find(message => message.message_id === reaction.message.id);
                const reactionRole = message.roles.find(reactionRole => (reactionRole.emoji_id === reaction.emoji.id || reactionRole.emoji_id === reaction.emoji.name));
                const role = guild.roles.cache.get(reactionRole.role_id);
                await member.roles.add(role)
            }
            catch(error) {
                return;
            }
        } catch (error) {
            console.error('Error in reactionRolesAdd.js: ', error);
        }
    },
};
