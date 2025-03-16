// embeds/task-check.ts 依頼した人に送る埋め込み

import { EmbedBuilder, User } from "discord.js";
import messages from "../data/messages.json" with { type: "json" };
import { THEME_COLOR } from "../env.js";

export default function createTaskCheckEmbed(
    taskId: string,
    taskContent: string,
    deadLine: string,
    notes: string,
    requester: User
) {
    return new EmbedBuilder()
        .setAuthor({
            name: requester.displayName,
            iconURL: requester.displayAvatarURL()
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
        .setColor(THEME_COLOR())
        .setFooter({
            text: messages.common.embeds.footer_text
        })
        .setDescription(`taskId: ${taskId}`);
}
