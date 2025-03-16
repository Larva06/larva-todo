// reminders.ts

import { Client, TextChannel } from "discord.js";
import messages from "./data/messages.json" with { type: "json" };
import format from "./format.js";
import { getUncompletedTasks } from "./sheets.js";
import { CHANNEL_ID } from "./env.js";

export async function checkAndSendReminders(client: Client) {
    const tasks = await getUncompletedTasks();
    const now = new Date();

    for (const task of tasks) {
        const deadline = new Date(task.deadline);
        const timeDiff = deadline.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // Send reminder if deadline is between 23-24 hours away
        if (hoursDiff <= 24 && hoursDiff > 23) {
            await sendReminder(client, task.user, task.taskContent, task.deadline);
        }
    }
}

async function sendReminder(client: Client, user: string, taskContent: string, deadline: string) {
    const channel = await client.channels.fetch(CHANNEL_ID());

    if (channel instanceof TextChannel) {
        const message = format(messages.guild.task.reTitle, `<@${user}>`);
        await channel.send({
            content: message,
            embeds: [
                {
                    fields: [
                        {
                            name: messages.guild.task.embeds.field1_name,
                            value: taskContent
                        },
                        {
                            name: messages.guild.task.embeds.field2_name,
                            value: deadline
                        }
                    ]
                }
            ]
        });
    } else {
        console.error(messages.log.messageSendFail);
    }
}
