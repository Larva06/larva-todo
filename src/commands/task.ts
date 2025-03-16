import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    TextChannel,
    Client,
    Events
} from "discord.js";
import messages from "../data/messages.json" with { type: "json" };
import taskCheck from "../embeds/task-check.js";
import format from "../format.js";
import { writeToSheet, updateTaskCompletion, resetTaskCompletion } from "../sheets.js";
import { randomUUID } from "crypto";
import { CHANNEL_ID } from "../env.js";

export default {
    data: new SlashCommandBuilder()
        .setName(messages.commands.task.name)
        .setDescription(messages.commands.task.description)
        .addStringOption((option) =>
            option
                .setName("task-content")
                .setDescription(messages.commands.task.stringOption[1].description)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("dead-line")
                .setDescription(messages.commands.task.stringOption[2].description)
                .setRequired(true)
        )
        .addUserOption((option) =>
            option.setName("user").setDescription(messages.commands.task.stringOption[3].description).setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("notes")
                .setDescription(messages.commands.task.stringOption[4].description)
                .setRequired(false)
        ),

    execute: async function (interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;

        const taskId = randomUUID();
        const taskContent = options.getString("task-content", true);
        const deadLine = options.getString("dead-line", true);
        const user = options.getUser("user", true);
        const notes = options.getString("notes") || "なし";

        const taskCheckEmbed = taskCheck(taskId, taskContent, deadLine, notes);

        // 依頼主に確認で送る用
        const reply = await interaction.reply({
            content: format(messages.guild.taskCheck.title, user.username),
            embeds: [taskCheckEmbed],
            fetchReply: true
        });

        await writeToSheet(taskId, taskContent, deadLine, user.username, notes);

        // 依頼された人に送る用
        const channel = await interaction.client.channels.fetch(CHANNEL_ID());

        if (channel instanceof TextChannel) {
            // リアクションを追加
            await reply.react("✅");
        } else {
            console.error(messages.log.messageSendFail);
        }
    }
};

export const monitorReactions = (client: Client) => {
    client.on(Events.MessageReactionAdd, async (reaction, partialUser) => {
        if (reaction.emoji.name === "✅" && !partialUser.bot) {
            const taskMessage = await reaction.message.fetch();

            if (taskMessage.content.includes("下記の内容で依頼を送信します！")) {
                const description = taskMessage.embeds[0]?.description;
                const taskId = description?.match(/taskId: ([^]+)/)?.[1];

                if (taskId) {
                    const timestamp = new Date().toISOString();
                    console.log(`リアクションが追加されました。タスクID: ${taskId}, タイムスタンプ: ${timestamp}`);
                    await updateTaskCompletion(taskId, timestamp);
                }
            }
        }
    });

    client.on(Events.MessageReactionRemove, async (reaction, partialUser) => {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error("リアクションの情報取得に失敗しました:", error);
                return;
            }
        }

        if (reaction.emoji.name === "✅" && !partialUser.bot) {
            const taskMessage = await reaction.message.fetch();

            if (taskMessage.content.includes("下記の内容で依頼を送信します！")) {
                const description = taskMessage.embeds[0]?.description;
                const taskId = description?.match(/taskId: ([^]+)/)?.[1];

                if (taskId) {
                    console.log(`リアクションが削除されました。タスクID: ${taskId}`);
                    await resetTaskCompletion(taskId);
                }
            }
        }
    });
};
