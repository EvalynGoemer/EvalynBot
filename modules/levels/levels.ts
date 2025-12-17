import { DiscordAPIError, Events, Message } from 'discord.js';

function levelFromXp(xpTotal: number): number | string {
    let lvl = 0;

    while (true) {
        const xpForNextLevel = (5 * lvl * (lvl - 1) * (2 * lvl - 1)) / 6 + (50 * lvl * (lvl - 1)) / 2 + 100 * lvl;

        if (xpForNextLevel > xpTotal) {
            return lvl - 1;
        }

        lvl++;

        if (lvl > 999) {
            return "MAX"
        }
    }
}

export default class Levels implements botModule {
    name = "Levels";
    version = "1.2";
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.bot) return;

        const server = global.db.servers.find(server => server.server_id === message.guild?.id)

        if (server == null) return;
        if (server.users == null) server.users = [];

        if (server.xpMult == null) {
            server.xpMult = 1;
        }

        let user = server.users.find(user => user.id === message.author.id);

        if (user == null) {
            user = {
                id: message.author.id,
                xp: Math.floor(Math.random() * (10 - 1 + 1) + 1) * server.xpMult,
                lvl: 0,
                xpMilestonesObtained: {},
                lastMessageThatGaveXpTimestamp: Date.now()
            }

            server.users.push(user)
        }

        if (user.xpMilestonesObtained == null) {
            user.xpMilestonesObtained = {};
        }

        if (Date.now() - user.lastMessageThatGaveXpTimestamp >= 60000) {
            user.xp += (Math.random() * (10 - 1 + 1) + 1) * server.xpMult;
            user.lvl = levelFromXp(user.xp);
            user.lastMessageThatGaveXpTimestamp = Date.now()
        }

        if (server.xpMilestones) {
            for (const [level, roleID] of Object.entries(server.xpMilestones)) {
                if (user.lvl != null) {
                    if ((Number.isNaN(Number(user.lvl)) ? 999 : Number(user.lvl)) >= Number(level)) {
                        if (user.xpMilestonesObtained[roleID] === true) {
                            continue;
                        }
                        const guild = message.guild;
                        if (guild == null) return;
                        const member = await guild.members.fetch(user.id);
                        if (member == null) return;
                        const role = guild.roles.cache.get(roleID);
                        if (role == null) return;
                        // discord lets you put @everyone as a role in slash commands for some reason
                        // so extra care handling the error has to happen.
                        // if discord says the role its self is invalid just delete it and log it
                        // otherwise log the error
                        // aswell .catch() does not seem to work so i have to use a try catch
                        try {
                            await member.roles.add(role).catch()
                        } catch (e) {
                            if (e instanceof DiscordAPIError) {
                                if (e.code == 10011) {
                                    console.warn(`Deleting invalid role from xpMilestones`);
                                    delete server.xpMilestones[Number(level)];
                                    continue;
                                } else {
                                    console.error(`Other Discord API Error: ${e.code}: ${e.message}`)
                                    continue;
                                }
                            } else {
                                console.error(`Other error from Module ${this.name}/${this.version}: ${e}`)
                            }
                        }
                        user.xpMilestonesObtained[roleID] = true;
                    }
                }
            }
        }
    }
};
