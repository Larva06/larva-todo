import { EmbedBuilder, User } from "discord.js";
import messages from "../data/messages.json" with { type: "json" };
import { THEME_COLOR } from "../env.js";
import type { Task } from "../types/types.js";

const createTaskCheckEmbed = (options: Task) => {
    const baseEmbed = new EmbedBuilder()
        .setColor(THEME_COLOR())
        .setDescription(`taskId: ${options.taskId}`)
        .addFields({
            name: messages.guild.taskCheck.embeds.field1_name,
            value: options.taskContent,
            inline: false
        })
        .addFields({
            name: messages.guild.taskCheck.embeds.field2_name,
            value: options.deadline,
            inline: false
        })
        .addFields({
            name: messages.guild.taskCheck.embeds.field3_name,
            value: options.notes,
            inline: false
        })
        .setFooter({
            text: messages.common.embeds.footer_text
        })
        .setTimestamp();

    return options.assignee instanceof User
        ? baseEmbed.setAuthor({
              name: options.assignee.displayName,
              iconURL: options.assignee.displayAvatarURL()
          })
        : baseEmbed;
};

export { createTaskCheckEmbed };
