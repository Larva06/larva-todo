import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, TextChannel, Message, User } from 'discord.js';
import messages from '../data/messages.json';
import taskCheck from '../embeds/task-check';
import task from '../embeds/task';
import format from '../format';
import { writeToSheet } from '../sheets'; 
import { CHANNEL_ID } from '../env';

export default {
    data: new SlashCommandBuilder()
      .setName(messages.commands.task.name)
      .setDescription(messages.commands.task.description)
      .addStringOption(option => 
        option.setName("task-content")
              .setDescription(messages.commands.task.stringOption[1].description)
              .setRequired(true))
      .addStringOption(option => 
        option.setName("dead-line")
              .setDescription(messages.commands.task.stringOption[2].description)
              .setRequired(true))
      .addUserOption(option => 
        option.setName("user")
              .setDescription(messages.commands.task.stringOption[3].description)
              .setRequired(true))
      .addStringOption(option => 
        option.setName("notes")
              .setDescription(messages.commands.task.stringOption[4].description)
              .setRequired(false)),
              
    execute: async function (interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;

        const taskContent = options.getString("task-content", true);
        const deadLine = options.getString("dead-line", true);
        const user = options.getUser("user", true);
        const notes = options.getString("notes") || 'なし';

        const taskCheckEmbed = taskCheck(taskContent, deadLine, notes);
        const taskEmbed = task(interaction.user.username, taskContent, deadLine, notes);

        // 依頼主に確認で送る用
        const reply = await interaction.reply({
            content: format(messages.guild.taskCheck.title, user.username),
            embeds: [taskCheckEmbed],
            fetchReply: true
        });

        await writeToSheet(taskContent, deadLine, user.username, notes);

        // 依頼された人に送る用
        const channel = await interaction.client.channels.fetch(CHANNEL_ID());
        
        if (channel instanceof TextChannel) { 
            const taskMessage = await channel.send({
                content: format(messages.guild.task.title, user.id),
                embeds: [taskEmbed]
            });

            // リアクションを追加
            await reply.react('✅');
        } else {
            console.error(messages.log.messageSendFail);
        }
    }
};

// リアクションの常時監視
export const monitorReactions = (client: any) => {
    client.on('messageReactionAdd', async (reaction: any, user: User) => {
        // リアクションが追加されたメッセージがタスクメッセージか確認
        if (reaction.emoji.name === '✅' && !user.bot) {
            const taskMessage = reaction.message;
            
            // ここでタスクメッセージのIDを比較するか、あるいは別の条件で判定
            if (taskMessage.content.includes('Task assigned to')) {  // 例: メッセージの内容で判定
                const timestamp = new Date().toISOString();
                console.log(`リアクションが追加されました。タイムスタンプ: ${timestamp}`);
                
                // スプレッドシートにタイムスタンプを記入
                await writeToSheet(taskMessage.content, 'deadline_here', user.username, 'notes_here', timestamp);
            }
        }
    });
};