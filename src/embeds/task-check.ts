import { EmbedBuilder, User } from "discord.js";
import { THEME_COLOR } from "../env.js";
import type { Task } from "../types/types.js";
import messages from "../data/messages.json" with { type: "json" };

const createTaskCheckEmbed = (options: Task): EmbedBuilder => {
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

    return options.assignee instanceof User
        ? baseEmbed.setAuthor({
              iconURL: options.assignee.displayAvatarURL(),
              name: options.assignee.displayName
          })
        : baseEmbed;
};

export { createTaskCheckEmbed };
