// main.ts

import { GatewayIntentBits, Client, REST, Routes, Events, Partials } from 'discord.js';
import { google } from 'googleapis';
import { TOKEN } from './env';
import format from './format';
import messages from './data/messages.json';
import taskEmbed from './embeds/task';

// Slash command
import task, { monitorReactions } from './commands/task';


const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
    partials: [Partials.Message, Partials.Reaction]
});

client.once('ready', () => {
    console.log('Ready!')
    if(client.user){
        console.log(client.user.tag)
    }
});

// slash command
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
  
    if (interaction.commandName === 'task') {
      await task.execute(interaction);
    }
});

monitorReactions(client);

client.login(TOKEN())
