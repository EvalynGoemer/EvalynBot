import { Client, Events } from 'discord.js';
import config from "../config.json" with {type: "json"}

export default class UptimeMonitor implements botModule {
    name = "UptimeMonitor";
    version = "1.1"
    type = Events.ClientReady;
    once = true;
    execute(_client: Client) {
        if (!config.uptimePushURL || config.uptimePushURL === "OPTIONAL URL" || !config.uptimePushInterval || !config.uptimePushMaxRetries || !config.uptimePushtimeoutMs) {
            return;
        }

        const push = async () => {
            for (let attempt = 1; attempt <= config.uptimePushMaxRetries; attempt++) {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), config.uptimePushtimeoutMs);

                    await fetch(config.uptimePushURL, {
                        method: "GET",
                        headers: { "User-Agent": `EvalynBot/${this.name}/${this.version}` },
                        signal: controller.signal
                    });

                    clearTimeout(timeout);
                    console.log("heartbeat sent");
                    break;
                } catch (err: unknown) {
                    if (!(err instanceof Error)) break;
                    if (attempt === config.uptimePushMaxRetries) {
                        console.warn(`Failed to send heartbeat after ${config.uptimePushMaxRetries} attempts:`, err.message);
                    } else {
                        console.log(`Attempt ${attempt} failed, retrying...`);
                        await new Promise(r => setTimeout(r, 200));
                    }
                }
            }
        };

        push();
        console.log("heartbeat sent & timer started");
        setInterval(push, config.uptimePushInterval);
    }
};
