# EvalynBot
EvalynBot is the discord bot that i maintain for my personal servers.  
It is now open source for people to use under the MIT Licence.

The bot is fully modular. Just drop a module in either `/modules` or `/user_modules` and restart the bot and
all the modules will be loaded properly.

Modules designed to be added to main repo should be in `/modules`  
Modules designed for your own personal instance should be in `/user_modules`

## Running the bot
Copy `config.json` and `db.json` from `/templates` to the root directory of the bot
Put your bot token into `config.json` and fill in anything extra you might need

Run `npm install` to download the libraries needed to run as follows
- `discord.js`
- `emoji-regex`

Run the TypeScript Compile `tsc` and if not installed use `npm install -g typescript` or your distros package manager  
Run `node ./compiled-ts/deploy-commands.js` to register slash commands (do this every update)  
Run `node ./compiled-ts` to run the bot

You should use [PM2](https://pm2.keymetrics.io/) to run the bot and have it auto restart if it crashes  
While it shouldnt crash some edge cases exist that are pretty rare to just let it be and auto reboot ¯\\\_(ツ)_/¯

## Features

Add the bot to your server and run `!help` to get info on how to use the bot  
You will need to run `!initServer` once to add the server to the database for some commands to work
if the command requires it

The following features / modules are included
- Help Command
- Levels
- Link Cleanup
- Purge Messages
- Reaction Roles
- Repost Message as Bot
- Starboard
- Steal Emojis

### Uptime Monitoring
Fill in `uptimePushURL` and `uptimePushInterval` in the config fie with a URL from a tool such as uptime kuma and an interval in miliseconds and the bot will
send the proper heartbeat to your uptime monitor


## Making Modules
This bot is structured similar to the [discord.js tutorial](https://discordjs.guide/legacy/app-creation/handling-events) but then modified to suit my needs

Look at `/templates/module.ts` and `/templates/moduleSlashCommand.ts` for an example module to base your others off of aswell `/modules` has plenty of modules to look at for reference  
`/templates/module.js` has a template for "legacy modules" which lack certain metadata needed for other features (eg will not support slash commands)

Modules that need more than one file to be complete eg needing more than one event should be in a folder

## Questions and Answers

### Really? JSON for a database?
Yes it is perfectly fine for small deployments but I am working on a soultion to abstract the database and have options for
JSON & SQLite and maybe others  
~~Yes this bot uses JSON for its database and it is perfectly fine for its intended usecase, which is for being a bot for a few smaller personal servers If things become an issue i will add a sqlite backend for the database~~

### Why not TypeScript?
Yes TypeScript. The bot has now been rewritten in TypeScript!  
~~I made this bot to be easy and quick to prototype in and TypeScript would make some stuff take longer feel free to make your own modules in TypeScript and i might convert some of the existing ones at some point Tomorrow™~~

### Slash Commands?
These have now been implemented!  
~~These are being worked on for the next update!~~  
~~I am not currently in a hurry to implement them as my bot works good enough for *now* for me but i will certainly add them at some point Tomorrow™~~
