# EvalynBot
EvalynBot is the discord bot that i maintain for my personal servers.  
It is now open source for people to use under the MIT Licence.

The bot is fully modular. Just drop a module in either `/modules` or `/user_modules` and restart the bot and
all the modules will be loaded properly.

Modules designed to be added to main repo should be in `/modules`  
Modules designed for your own personal server should be in `/user_modules`

## Running the bot
Copy `config.json` and `db.json` from `/templates` to the root directory of the bot
Put your bot token into `config.json`

Run `npm install` to download the libraries needed to run as follows
- `discord.js`
- `emoji-regex`

Run `node .` to run the bot

You should use [PM2](https://pm2.keymetrics.io/) to run the bot and have it auto restart if it crashes  
While it shouldnt crash some edge cases exist that are pretty rare to just let it be and auto reboot ¯\\\_(ツ)_/¯

## Features

Add the bot to your server and run `!help` to get info on how to use the bot  
You will need to run `!initServer` once before some commands to add the server to the database
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

## Making Modules
This bot is structured similar to the [discord.js tutorial](https://discordjs.guide/legacy/app-creation/handling-events) but then modified to suit my needs

Look at `/templates/module.js` for an example module to base your others off of aswell `/modules` has plenty of modules to look at for reference

Modules that need more than one file to be complete eg needing more than one event should be in a folder

## Questions and Answers

### Really? JSON for a database?
Yes this bot uses JSON for its database and it is perfectly fine for its intended usecase,
which is for being a bot for a few smaller personal servers  
If things become an issue i will add a sqlite backend for the database

### Why not TypeScript?
I made this bot to be easy and quick to prototype in and TypeScript would make some stuff take longer
feel free to make your own modules in TypeScript and i might convert some of the existing ones at some point Tomorrow™

### Slash Commands?
![Perhaps](https://media1.tenor.com/m/r0FmW0rANpIAAAAC/perhaps-hmm.gif)  
I am not currently in a hurry to implement them as my bot works good enough for *now* for me but i will certainly add them at some point Tomorrow™
