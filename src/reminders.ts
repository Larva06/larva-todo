import { type Client, TextChannel } from "discord.js";
import { logError, logInfo } from "./log.js";
import { CHANNEL_ID } from "./env.js";
import type { Task } from "./types/types.js";
import { createTaskCheckEmbed } from "./embeds/task-check.js";
import { format } from "./format.js";
import { getUncompletedTasks } from "./sheets.js";
import messages from "./data/messages.json" with { type: "json" };

const sendReminder = async (client: Client, task: Task & { assignee: string }): Promise<void> => {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (channel instanceof TextChannel) {
        // `表示名 (ユーザーID)`の形式からユーザーIDを抽出
        const userIdMatch = /.*\((?<userId>[^)]+)\)\s*$/u.exec(task.assignee);
        const userId = userIdMatch?.groups?.["userId"] ?? "";
        const message = format(messages.guild.task.reTitle, `<@${userId}>`);

        const embed = createTaskCheckEmbed(task);

        const reminder = await channel.send({
            content: message,
            embeds: [embed]
        });

        // リマインダーメッセージにもチェックマークリアクションを追加
        await reminder.react("✅");
        logInfo(
            `リマインダーを送信しました。ユーザー: ${task.assignee}, タスク内容: ${task.taskContent}, 締め切り: ${task.deadline}`
        );
    } else {
        logError(messages.log.messageSendFail);
    }
};

// eslint-disable-next-line max-statements
const checkAndSendReminders = async (client: Client): Promise<void> => {
    const tasks = await getUncompletedTasks();
    const now = new Date();

    const reminderPromises: Array<Promise<void>> = [];

    for (const task of tasks) {
        const deadline = new Date(task.deadline);
        const timeDiff = deadline.getTime() - now.getTime();
        // eslint-disable-next-line no-magic-numbers
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // 締め切りが23〜24時間以内の場合にリマインダーを送信
        // eslint-disable-next-line no-magic-numbers
        if (hoursDiff <= 24 && hoursDiff > 23) {
            reminderPromises.push(sendReminder(client, task));
        }
    }

    await Promise.all(reminderPromises);
    logInfo("リマインダーをチェックしました。");
};

export { checkAndSendReminders };
