// deploy-commands.ts

import { REST, Routes } from "discord.js";
import message from "./data/messages.json" with { type: "json" };
import { DISCORD_TOKEN, APPLICATION_ID, GUILD_ID } from "./env.js";

import task from "./commands/task.js";

const commands = [task.data.toJSON()];

const rest = new REST({
    version: "10"
}).setToken(DISCORD_TOKEN());

(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(APPLICATION_ID(), GUILD_ID()), {
            body: commands
        });
        console.log(message.log.commandRegSuc);
    } catch (error) {
        console.error(message.log.commandRegFail, error);
    }
})();
