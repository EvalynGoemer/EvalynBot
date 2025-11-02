import { Events, } from 'discord.js';

function levelFromXp(xpTotal) {
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

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;

        const args = message.content.split(/\s+/);
        const command = args.shift().toLowerCase();

        const server = global.db.servers.find(server => server.server_id === message.guild.id)

        if (server == null) {
            return;
        }

        if (server.users == null) {
            server.users = []
        }

        let user = server.users.find(user => user.id === message.author.id);

        if (user == null) {
            user = {
                id: message.author.id,
                xp: Math.floor(Math.random() * (10 - 1 + 1) + 1),
                lastMessageThatGaveXpTimestamp: Date.now()
            }

            server.users.push(user)
        }

        if (Date.now() - user.lastMessageThatGaveXpTimestamp >= 60000) {
            user.xp += Math.floor(Math.random() * (10 - 1 + 1) + 1);
            user.lastMessageThatGaveXpTimestamp = Date.now()
        }

        if (command === "!level") {
            message.reply(`You are level ${levelFromXp(user.xp)} (XP: ${user.xp})`)
        }
    },
};
