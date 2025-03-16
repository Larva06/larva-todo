// embeds/task-check.ts 依頼した人に送る埋め込み

import { EmbedBuilder } from "discord.js";
import messages from "../data/messages.json" with { type: "json" };

export default function createTaskCheckEmbed(taskId: string, taskContent: string, deadLine: string, notes: string) {
    return new EmbedBuilder()
        .setAuthor({
            name: messages.common.embeds.author_name,
            iconURL: messages.common.embeds.author_icon
        })
        .addFields({
            name: messages.guild.taskCheck.embeds.field1_name,
            value: taskContent,
            inline: false
        })
        .addFields({
            name: messages.guild.taskCheck.embeds.field2_name,
            value: deadLine,
            inline: false
        })
        .addFields({
            name: messages.guild.taskCheck.embeds.field3_name,
            value: notes,
            inline: false
        })
        .setColor("#EA64A9")
        .setFooter({
            text: messages.common.embeds.footer_text
        })
        .setDescription(`taskId: ${taskId}`);
}
