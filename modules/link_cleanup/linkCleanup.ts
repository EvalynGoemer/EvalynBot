import { Events, Message, TextChannel, MessageFlags } from 'discord.js';

function URLSanitizer(text: string) {
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

    const DOMAIN_BLOCKED_PARAMS = {
        "x.com": ["t", "s"],
        "twitter.com": ["t", "s"],
        "vxtwitter.com": ["t", "s"],
        "fixupx.com": ["t", "s"]
    };

    const DOMAIN_MAP: Record<string, string> = {
        "x.com": "fixupx.com",
        "twitter.com": "fixupx.com",
        "vxtwitter.com": "fixupx.com",
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

            if (u.hostname in DOMAIN_MAP) {
                u.hostname = DOMAIN_MAP[u.hostname]!;
            }

            for (let param of [...u.searchParams.keys()]) {
                if (BLOCKED_PARAMS.has(param)) {
                    u.searchParams.delete(param);
                }
            }

            for (let [domain, blockedParams] of Object.entries(DOMAIN_BLOCKED_PARAMS)) {
                if (u.hostname.includes(domain)) {
                    for (let param of blockedParams) {
                        u.searchParams.delete(param);
                    }
                }
            }

            // final sanitization pass
            let sanitized = u.toString();

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

            // twitter & co specific rules
            // TODO: add config options for server language
            if (u.hostname.includes("fixupx.com")) {
                if (!sanitized.endsWith("/en") && !sanitized.endsWith("/en/")) {
                    if (sanitized.endsWith('/')) {
                        sanitized += "en";
                    } else {
                        sanitized += "/en";
                    }
                }
            }

            if (!hadTrailingSlash && sanitized.endsWith('/')) {
                sanitized = sanitized.slice(0, -1);
            }

            return sanitized;
        } catch {
            return match;
        }
    });
}

export default class LinkCleanup implements botModule {
    name = "LinkCleanup";
    version = "1.0";
    type = Events.MessageCreate;
    once = false;
    async execute(message: Message) {
        if (message.author.bot) return;

        let server = global.db.servers.find(server => server.server_id === message.guild?.id);
        if (server == null) return;

        if (server.linkCleanupEnabled == null) {
            server.linkCleanupEnabled = false;
        }

        if (server.linkCleanupEnabled == true) {
            const sanitizedContent = URLSanitizer(message.content);
            if (sanitizedContent !== message.content) {
                await message.delete();
                if (!(message.channel instanceof TextChannel)) return;
                await message.channel.send({
                    content: `${message.author} sent a message with bad links, message content with sanitized links:\n${sanitizedContent}`,
                    flags: [MessageFlags.SuppressNotifications]
                });
            }
        }
    }
}
