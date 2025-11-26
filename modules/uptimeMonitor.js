import { Events } from 'discord.js';
import config from "../config.json" with {type: "json"}

export default {
    name: Events.ClientReady,
    once: true,
    execute(_client) {
        const push = async () => {
            await fetch(config.uptimePushURL, {
                method: "GET",
                headers: {
                    "User-Agent": "EvalynBot/UptimeMonitor/1.0"
                }
            });
            console.log("heartbeat sent");
        };

        push();
        console.log("heartbeat sent & timer started");
        setInterval(push, config.uptimePushInterval);
    },
};
