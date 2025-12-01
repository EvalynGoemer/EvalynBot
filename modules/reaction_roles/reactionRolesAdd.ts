import { Events, User, MessageReaction } from 'discord.js';

export default class ReactionRolesAdd implements botModule {
    name = "ReactionRolesAdd";
    version = "1.0"
    type = Events.MessageReactionAdd;
    once = false;
    async execute(reaction: MessageReaction, user: User) {
        if (user.bot) return;
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();
        if (user.partial) await user.fetch();

        const guild = reaction.message.guild;
        if (guild == null) return;
        const member = await guild.members.fetch(user.id);
        const server = global.db.servers.find(server => server.server_id === reaction.message.guild?.id)

        const message = server?.reaction_roles?.find(message => message.message_id === reaction.message.id);
        const reactionRole = message?.roles.find(reactionRole => (reactionRole.emoji_id === reaction.emoji.id || reactionRole.emoji_id === reaction.emoji.name));
        if (reactionRole == null) return;
        const role = guild.roles.cache.get(reactionRole.role_id);
        if (role == null) return;
        await member.roles.add(role)
    }
};
