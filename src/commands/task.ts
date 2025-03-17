import { CHANNEL_ID, TIMEZONE_OFFSET } from "../env.js";
import {
    type Client,
    type CommandInteraction,
    type CommandInteractionOptionResolver,
    Events,
    type MessageReaction,
    type PartialMessageReaction,
    type PartialUser,
    SlashCommandBuilder,
    TextChannel,
    type User
} from "discord.js";
import { logError, logInfo } from "../log.js";
import { resetTaskCompletion, updateTaskCompletion, writeToSheet } from "../sheets.js";
import { createTaskCheckEmbed } from "../embeds/task-check.js";
import { format } from "../format.js";
import messages from "../data/messages.json" with { type: "json" };
import { randomUUID } from "crypto";

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

    // eslint-disable-next-line max-statements, max-lines-per-function
    execute: async (interaction: CommandInteraction): Promise<void> => {
        const options = interaction.options as CommandInteractionOptionResolver;

        const taskId = randomUUID();
        const taskContent = options.getString("task-content", true);

        // `2025/03/17`の形式
        const rawDeadLine = options.getString("dead-line", true);

        // タイムゾーン付きのISO 8601形式に変換
        const isoDate = rawDeadLine.replace(/\//gu, "-");
        const deadline = `${isoDate}T23:59:59${TIMEZONE_OFFSET}`;

        const assignee = options.getUser("user", true);
        const notes = options.getString("notes") ?? "なし";

        const taskCheckEmbed = createTaskCheckEmbed({ assignee, deadline, notes, taskContent, taskId });

        // 依頼主に確認で送る用
        const interactionCallbackResponse = await interaction.reply({
            content: format(messages.guild.taskCheck.title, assignee.toString()),
            embeds: [taskCheckEmbed],
            withResponse: true
        });

        // ユーザー名の記録方法を変更する場合は、`src/reminders.ts`の`sendReminder()`の正規表現も変更する必要がある
        await writeToSheet({
            assignee: `${assignee.displayName} (${assignee.id})`,
            deadline,
            notes,
            taskContent,
            taskId
        });

        // 依頼された人に送る用
        const channel = await interaction.client.channels.fetch(CHANNEL_ID);

        if (channel instanceof TextChannel) {
            const { resource } = interactionCallbackResponse;

            if (!resource?.message) {
                logError(messages.log.messageSendFail);
                return;
            }

            // リアクションを追加
            await resource.message.react("✅");
        } else {
            logError(messages.log.messageSendFail);
        }
    }
};

// eslint-disable-next-line max-statements
const onReactionChange = async (
    type: "added" | "removed",
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
): Promise<void> => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            logError("リアクションの情報取得に失敗しました:", error);
            return;
        }
    }

    if (user.partial) {
        try {
            await user.fetch();
        } catch (error) {
            logError("ユーザーの情報取得に失敗しました:", error);
            return;
        }
    }

    if (reaction.emoji.name === "✅" && !user.bot) {
        const taskMessage = await reaction.message.fetch();

        if (
            taskMessage.content.includes("下記の内容で依頼を送信します！") ||
            taskMessage.content.includes("締め切り日の24時間前です！")
        ) {
            const description = taskMessage.embeds[0]?.description;
            const taskIdMatch = description?.match(/taskId: (?<taskId>[^]+)/u);
            const taskId = taskIdMatch?.groups?.["taskId"];
            if (!taskId) {
                logError("メッセージからタスクIDを取得できませんでした。");
                return;
            }

            if (type === "added") {
                logInfo(`リアクションが追加されました。タスクID: ${taskId}`);
                await updateTaskCompletion(taskId);
            } else {
                logInfo(`リアクションが削除されました。タスクID: ${taskId}`);
                await resetTaskCompletion(taskId);
            }
        }
    }
};

const monitorReactions = (client: Client): void => {
    client.on(Events.MessageReactionAdd, (reaction, partialUser) => {
        void onReactionChange("added", reaction, partialUser);
    });

    client.on(Events.MessageReactionRemove, (reaction, partialUser) => {
        void onReactionChange("removed", reaction, partialUser);
    });
};

export { slashCommand, monitorReactions };
