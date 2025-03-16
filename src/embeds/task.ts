// embeds/task.ts 依頼者に送信する embed

import { EmbedBuilder } from "discord.js";
import messages from "../data/messages.json" with { type: "json" };
import { THEME_COLOR } from "../env.js";

export default function createTaskCheckEmbed(requester: string, taskContent: string, deadline: string, notes: string) {
    return new EmbedBuilder()
        .setAuthor({
            name: messages.common.embeds.author_name,
            iconURL: messages.common.embeds.author_icon
        })
        .addFields({
            name: messages.guild.task.embeds.field1_name,
            value: taskContent,
            inline: false
        })
        .addFields({
            name: messages.guild.task.embeds.field2_name,
            value: deadline,
            inline: false
        })
        .addFields({
            name: messages.guild.task.embeds.field3_name,
            value: requester,
            inline: false
        })
        .addFields({
            name: messages.guild.task.embeds.field4_name,
            value: notes,
            inline: false
        })
        .setColor(THEME_COLOR())
        .setFooter({
            text: messages.common.embeds.footer_text
        });
}
