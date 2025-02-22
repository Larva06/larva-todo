// main.ts

import { GatewayIntentBits, Client, Partials } from 'discord.js';
import { TOKEN } from './env.js';

// Slash command
import task, { monitorReactions } from './commands/task.js';


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
