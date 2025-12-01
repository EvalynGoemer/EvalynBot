import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType } from 'discord.js';

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

export default class LevelSlashCommand implements botModule {
    name = "LevelSlashCommand";
    version = "1.0";
    type = null;
    once = false;
    slashCommand = new SlashCommandBuilder()
    .setName('level')
    .setDescription('Get your or anothers current level and xp')
    .addUserOption((option) => option.setName("user").setDescription('User to lookup').setRequired(false))
    .setContexts(InteractionContextType.Guild)
    async execute(interaction: ChatInputCommandInteraction) {
        const server = global.db.servers.find(server => server.server_id === interaction.guild?.id)
        const userId = interaction.options.getUser("user")?.id ?? interaction.user.id

        let user = server?.users?.find(user => user.id === userId);

        if (user != null && interaction.options.getUser("user") == null) {
         interaction.reply(`You are level ${levelFromXp(user.xp)} (XP: ${user.xp})`)
        }
        else if(user != null && interaction.options.getUser("user") != null) {
            interaction.reply(`${interaction.options.getUser("user")?.tag} is level ${levelFromXp(user.xp)} (XP: ${user.xp})`)
        }
        else {
            interaction.reply(`Invalid User`)
        }
    }
};
