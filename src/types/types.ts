import type { Role, RoleMention, User, UserMention } from "discord.js";

interface TaskDataBase {
    taskId: string;
    taskContent: string;
    deadline: string;
    notes: string;
}

interface TaskDataForSheets extends TaskDataBase {
    type: "sheets";
    assigneeId: UserMention | RoleMention;
    assigneeName: string;
}

interface TaskDataForDiscord extends TaskDataBase {
    type: "discord";
    assignee: User | Role;
}

type TaskData = TaskDataForSheets | TaskDataForDiscord;

export type { TaskDataForSheets, TaskDataForDiscord, TaskData };
