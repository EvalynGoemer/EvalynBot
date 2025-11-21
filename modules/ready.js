import { Events } from 'discord.js';
import config from "../config.json" with {type: "json"}

export default {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        if (config.uptimePushURL && config.uptimePushURL !== "OPTIONAL URL") {
            console.log("heartbeat sent & time started");
            fetch(config.uptimePushURL).catch(() => {});
            setInterval(() => {
                console.log("heartbeat sent");
                fetch(config.uptimePushURL).catch(() => {});
            }, config.uptimePushInterval);
        }
    },
};
