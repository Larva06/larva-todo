// embeds/task.ts 依頼者に送信する embed

import { Embed, EmbedBuilder } from 'discord.js';
import messages from '../data/messages.json';

export default function createTaskCheckEmbed(
  requester: string, 
  taskContent: string,
  deadline: string,
  notes: string
) {
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
  .setColor('#EA64A9')
  .setFooter({
    text: messages.common.embeds.footer_text
  })
}