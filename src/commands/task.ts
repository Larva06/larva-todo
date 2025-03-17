import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    TextChannel,
    Client,
    Events
} from "discord.js";
import messages from "../data/messages.json" with { type: "json" };
import { createTaskCheckEmbed } from "../embeds/task-check.js";
import { format } from "../format.js";
import { writeToSheet, updateTaskCompletion, resetTaskCompletion } from "../sheets.js";
import { randomUUID } from "crypto";
import { CHANNEL_ID, TIMEZONE_OFFSET } from "../env.js";

const slashCommand = {
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

    execute: async (interaction: CommandInteraction): Promise<void> => {
        const options = interaction.options as CommandInteractionOptionResolver;

        const taskId = randomUUID();
        const taskContent = options.getString("task-content", true);
        const rawDeadLine = options.getString("dead-line", true); // "2025/03/17"
        const isoDate = rawDeadLine.replace(/\//g, "-"); // "2025-03-17"
        const deadline = `${isoDate}T23:59:59${TIMEZONE_OFFSET()}`; // "2025-03-17T23:59:59+09:00"
        const assignee = options.getUser("user", true);
        const notes = options.getString("notes") || "なし";

        const taskCheckEmbed = createTaskCheckEmbed({ taskId, taskContent, deadline, notes, assignee });

        // 依頼主に確認で送る用
        const interactionCallbackResponse = await interaction.reply({
            content: format(messages.guild.taskCheck.title, assignee.toString()),
            embeds: [taskCheckEmbed],
            withResponse: true
        });

        // ユーザー名の記録方法を変更する場合は、`src/reminders.ts`の`sendReminder()`の正規表現も変更する必要がある
        await writeToSheet({
            taskId,
            taskContent,
            deadline,
            assignee: `${assignee.displayName} (${assignee.id})`,
            notes
        });

        // 依頼された人に送る用
        const channel = await interaction.client.channels.fetch(CHANNEL_ID());

        if (channel instanceof TextChannel) {
            const { resource } = interactionCallbackResponse;

            if (!resource || !resource.message) {
                console.error(messages.log.messageSendFail);
                return;
            }

            // リアクションを追加
            await resource.message.react("✅");
        } else {
            console.error(messages.log.messageSendFail);
        }
    }
};

const monitorReactions = (client: Client) => {
    client.on(Events.MessageReactionAdd, async (reaction, partialUser) => {
        if (reaction.emoji.name === "✅" && !partialUser.bot) {
            const taskMessage = await reaction.message.fetch();

            if (
                taskMessage.content.includes("下記の内容で依頼を送信します！") ||
                taskMessage.content.includes("締め切り日の24時間前です！")
            ) {
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

            if (
                taskMessage.content.includes("下記の内容で依頼を送信します！") ||
                taskMessage.content.includes("締め切り日の24時間前です！")
            ) {
                const description = taskMessage.embeds[0]?.description;
                const taskId = description?.match(/taskId: ([^]+)/)?.[1];

                if (taskId) {
                    const timestamp = new Date().toISOString();
                    console.log(`リアクションが削除されました。タスクID: ${taskId}, タイムスタンプ: ${timestamp}`);
                    await resetTaskCompletion(taskId);
                }
            }
        }
    });
};

export { slashCommand, monitorReactions };
