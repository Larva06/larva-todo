import { EmbedBuilder } from "discord.js";
import { THEME_COLOR } from "../env.js";
import type { TaskData } from "../types/types.js";
import messages from "../data/messages.json" with { type: "json" };

const createTaskCheckEmbed = (options: TaskData): EmbedBuilder => {
    const baseEmbed = new EmbedBuilder()
        .setColor(THEME_COLOR)
        .setDescription(`taskId: ${options.taskId}`)
        .addFields({
            inline: false,
            name: messages.guild.taskCheck.embeds.field1_name,
            value: options.taskContent
        })
        .addFields({
            inline: false,
            name: messages.guild.taskCheck.embeds.field2_name,
            value: options.deadline
        })
        .addFields({
            inline: false,
            name: messages.guild.taskCheck.embeds.field3_name,
            value: options.notes
        })
        .setFooter({
            text: messages.common.embeds.footer_text
        })
        .setTimestamp();

    if (options.type === "sheets") {
        return baseEmbed.setAuthor({
            name: options.assigneeName
        });
    }

    if ("displayAvatarURL" in options.assignee) {
        return baseEmbed.setAuthor({
            iconURL: options.assignee.displayAvatarURL(),
            name: options.assignee.displayName
        });
    }

    return baseEmbed.setAuthor({
        name: options.assignee.name
    });
};

export { createTaskCheckEmbed };
