// main.ts

import { GatewayIntentBits, Client, Partials, Events, TextChannel } from "discord.js";
import { CHANNEL_ID, DISCORD_TOKEN } from "./env.js";

// Slash command
import { monitorReactions, slashCommand } from "./commands/task.js";
import { checkAndSendReminders } from "./reminders.js";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
    partials: [Partials.Message, Partials.Reaction]
});

client.once(Events.ClientReady, async (): Promise<void> => {
    console.log("Ready!");
    if (client.user) {
        console.log(client.user.tag);
    }

    // ボットの再起動前に送信されたメッセージへのリアクションの追加・削除に反応するためにメッセージをキャッシュする
    const channel = await client.channels.fetch(CHANNEL_ID());
    if (channel instanceof TextChannel) {
        await channel.messages.fetch({ limit: 100 });
    }
    console.log("メッセージキャッシュを構築しました。");

    // 1時間ごとにリマインダーをチェック
    setInterval(() => checkAndSendReminders(client), 1000 * 60 * 60);
});

// slash command
client.on(Events.InteractionCreate, async (interaction): Promise<void> => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "task") {
        await slashCommand.execute(interaction);
    }
});

monitorReactions(client);

client.login(DISCORD_TOKEN());
