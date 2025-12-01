import { Events, Client } from 'discord.js';

export default class Ready implements botModule {
    name = "Ready";
    version = "1.0";
    type = Events.ClientReady;
    once = true;
    execute(client: Client) {
        console.log(`Ready! Logged in as ${client.user?.tag}`);
    }
};
