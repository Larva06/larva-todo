// reminders.ts

import { Client, TextChannel } from "discord.js";
import messages from "./data/messages.json" with { type: "json" };
import format from "./format.js";
import { getUncompletedTasks } from "./sheets.js";
import { CHANNEL_ID } from "./env.js";
import createTaskCheckEmbed from "./embeds/task-check.js";
import type { Task } from "./types/types.js";

export async function checkAndSendReminders(client: Client) {
    const tasks = await getUncompletedTasks();
    const now = new Date();

    for (const task of tasks) {
        const deadline = new Date(task.deadline);
        const timeDiff = deadline.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // Send reminder if deadline is between 23-24 hours away
        if (hoursDiff <= 24 && hoursDiff > 23) {
            await sendReminder(client, task);
        }
    }

    console.log("リマインダーをチェックしました。");
}

async function sendReminder(client: Client, task: Task & { assignee: string }) {
    const channel = await client.channels.fetch(CHANNEL_ID());

    if (channel instanceof TextChannel) {
        // `表示名 (ユーザーID)`の形式からユーザーIDを抽出
        const userId = task.assignee.match(/.*\(([^)]+)\)\s*$/)?.[1] || "";
        const message = format(messages.guild.task.reTitle, `<@${userId}>`);

        const embed = createTaskCheckEmbed(task);

        await channel.send({
            content: message,
            embeds: [embed]
        });
        console.log(
            `リマインダーを送信しました。ユーザー: ${task.assignee}, タスク内容: ${task.taskContent}, 締め切り: ${task.deadline}`
        );
    } else {
        console.error(messages.log.messageSendFail);
    }
}
