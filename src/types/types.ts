import type { User } from "discord.js";

export interface Task {
    assignee: User | string;
    taskId: string;
    taskContent: string;
    deadline: string;
    notes: string;
}
