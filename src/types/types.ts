import type { User } from "discord.js";

interface Task {
    assignee: User | string;
    taskId: string;
    taskContent: string;
    deadline: string;
    notes: string;
}

export type { Task };
