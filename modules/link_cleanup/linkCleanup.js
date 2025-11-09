import { Events, MessageFlags } from 'discord.js';

function URLSanitizer(text) {
    const BLOCKED_PARAMS = new Set([
        "si",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "utm_name",
        "share_id"
    ]);

    const DOMAIN_MAP = {
        "x.com": "vxtwitter.com",
        "twitter.com": "vxtwitter.com",
        "tiktok.com": "vxtiktok.com",
        "instagram.com": "kkinstagram.com",
        "reddit.com": "vxreddit.com",
    };

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.replace(urlRegex, (match) => {
        try {
            let u = new URL(match);
            const hadTrailingSlash = match.endsWith('/');

            for (const [original, mapped] of Object.entries(DOMAIN_MAP)) {
                if (u.hostname === original || u.hostname.endsWith("." + original)) {
                    u.hostname = mapped;
                    break;
                }
            }

            if (DOMAIN_MAP[u.hostname]) {
                u.hostname = DOMAIN_MAP[u.hostname];
            }

            // amazon specific rules
            if (u.hostname.includes("amazon.")) {
                let asin = null;
                const dpMatch = u.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
                const gpMatch = u.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);

                if (dpMatch) asin = dpMatch[1];
                if (gpMatch) asin = gpMatch[1];

                if (asin) {
                    return `${u.protocol}//${u.hostname}/dp/${asin}`;
                }
            }

            for (let param of [...u.searchParams.keys()]) {
                if (BLOCKED_PARAMS.has(param)) {
                    u.searchParams.delete(param);
                }
            }

            let sanitized = u.toString();
            if (!hadTrailingSlash && sanitized.endsWith('/')) {
                sanitized = sanitized.slice(0, -1);
            }

            return sanitized;
        } catch {
            return match;
        }
    });
}

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;

        try {
            let server = global.db.servers.find(server => server.server_id === message.guild.id);
            if (server.linkCleanupEnabled == null) {
                server.linkCleanupEnabled = false;
            }

            if (server.linkCleanupEnabled == true) {
                const sanitizedContent = URLSanitizer(message.content);
                if (sanitizedContent !== message.content) {
                    await message.delete();
                    await message.channel.send({
                        content: `${message.author} sent a message with bad links, message content with sanitized links:\n${sanitizedContent}`,
                        flags: [MessageFlags.SuppressNotifications]
                    }
                    );
                }
            }
        } catch (e) {
        }
    },
};
