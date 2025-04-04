import {
    type APIInteractionDataResolvedGuildMember,
    type APIRole,
    type Client,
    type CommandInteraction,
    type CommandInteractionOptionResolver,
    Events,
    type GuildMember,
    type Message,
    type MessageReaction,
    type PartialMessageReaction,
    type PartialUser,
    Role,
    SlashCommandBuilder,
    TextChannel,
    User
} from "discord.js";
import { CHANNEL_ID, TIMEZONE_OFFSET } from "../env.js";
import { logError, logInfo } from "../log.js";
import { resetTaskCompletion, updateTaskCompletion, writeToSheet } from "../sheets.js";
import { createTaskCheckEmbed } from "../embeds/task-check.js";
import { format } from "../format.js";
import messages from "../data/messages.json" with { type: "json" };
import { randomUUID } from "crypto";

interface TaskCompletionInfo {
    assigneeName: string;
    taskContent: string;
}

const getTaskCompletionInfo = (message: Message): TaskCompletionInfo | null => {
    const [embed] = message.embeds;

    return {
        assigneeName: embed?.author ? embed.author.name : "不明なユーザー",
        taskContent: embed?.fields[0] ? embed.fields[0].value : "不明なタスク"
    };
};

// eslint-disable-next-line max-statements
const sendStatusMessage = async (
    taskMessage: Message,
    user: User | PartialUser,
    isComplete: boolean
): Promise<void> => {
    const taskInfo = getTaskCompletionInfo(taskMessage);
    if (!taskInfo) {
        logError("タスクのメッセージから必要な情報を取得できませんでした。");
        return;
    }

    const { taskContent, assigneeName } = taskInfo;
    const { channel } = taskMessage;

    if (!channel.isSendable()) {
        logError("メッセージの送信に必要な情報を取得できませんでした。");
        return;
    }

    const messageTemplate = isComplete ? messages.guild.taskCheck.completion : messages.guild.taskCheck.incomplete;
    const statusMessage = format(messageTemplate, user.displayName, assigneeName, taskContent);
    await channel.send(statusMessage);
};

const convertMentionableToUserOrRole = (
    mentionable: GuildMember | APIInteractionDataResolvedGuildMember | Role | APIRole | User
): User | Role | null => {
    if (mentionable instanceof User) {
        return mentionable;
    }

    if (mentionable instanceof Role) {
        return mentionable;
    }

    if ("user" in mentionable) {
        return mentionable.user;
    }

    return null;
};

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
        .addMentionableOption((option) =>
            option
                .setName("assignee")
                .setDescription(messages.commands.task.stringOption[3].description)
                .setRequired(true)
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

        const mentionableAssignee = options.getMentionable("assignee", true);
        const notes = options.getString("notes") ?? "なし";

        const assignee = convertMentionableToUserOrRole(mentionableAssignee);

        if (!assignee) {
            logError("タスクの依頼先が無効です。", mentionableAssignee);
            await interaction.reply({
                content: "タスクの依頼先が無効です。ユーザーまたはロールを指定してください。",
                ephemeral: true
            });
            return;
        }

        const taskCheckEmbed = createTaskCheckEmbed({
            assignee,
            deadline,
            notes,
            taskContent,
            taskId,
            type: "discord"
        });

        // 依頼主に確認で送る用
        const interactionCallbackResponse = await interaction.reply({
            content: format(messages.guild.taskCheck.title, assignee.toString()),
            embeds: [taskCheckEmbed],
            ephemeral: true,
            withResponse: true
        });

        await writeToSheet({
            assignee,
            deadline,
            notes,
            taskContent,
            taskId,
            type: "discord"
        });

        // 依頼された人に送る用
        const channel = await interaction.client.channels.fetch(CHANNEL_ID);

        if (channel instanceof TextChannel) {
            const taskMessage = await channel.send({
                content: format(
                    messages.guild.task.title,
                    assignee.toString(),
                    interaction.user.displayName.toString()
                ),
                embeds: [taskCheckEmbed]
            });
            const { resource } = interactionCallbackResponse;
            if (!resource?.message) {
                logError(messages.log.messageSendFail);
                return;
            }

            // リアクションを追加
            await taskMessage.react("✅");
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
            taskMessage.content.includes("さんから依頼が来ています！") ||
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
                await sendStatusMessage(taskMessage, user, true);
            } else {
                logInfo(`リアクションが削除されました。タスクID: ${taskId}`);
                await resetTaskCompletion(taskId);
                await sendStatusMessage(taskMessage, user, false);
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
