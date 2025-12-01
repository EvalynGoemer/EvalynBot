import { Client, Events } from 'discord.js';

declare global {
    var client: Client
    var config: config;
    var db: jsonDatabase;

    export interface config {
        skipStartupDelay: boolean;
        uptimePushURL: string;
        uptimePushMaxRetries: number;
        uptimePushtimeoutMs: number;
        uptimePushInterval: number
        token: string;
    }

    export interface jsonDatabase {
        servers: discordServer[];
    }

    export interface discordServer {
        server_id: string;
        linkCleanupEnabled?: bool;
        starboard_channel_id?: string;
        starboard_reaction_threshold?: number;
        starboard_emoji_id?: string;
        reaction_roles?: reactionRole[];
        users?: discordUser[];
    }

    export interface reactionRole {
        message_id: string;
        roles: reactionRoleRole[];
    }

    export interface reactionRoleRole {
        emoji_id: string;
        role_id: string;
    }

    export interface discordUser {
        id: string;
        xp: number;
        lastMessageThatGaveXpTimestamp: number;
    }

    export interface botModule {
        name: string;
        version: string;
        type: ClientEvents;
        once: boolean;
        execute(...args: any[]): void;
    }
}
