// sheets.ts

import { google } from "googleapis";
import messages from "./data/messages.json" with { type: "json" };
import { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID, SHEET_NAME } from "./env.js";
import type { Task } from "./types/types.js";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL(),
    undefined,
    GOOGLE_PRIVATE_KEY()?.replace(/\\n/g, "\n"),
    SCOPES
);

const sheets = google.sheets({ version: "v4", auth });

export async function writeToSheet(options: Task) {
    const spreadsheetId = SPREADSHEET_ID()!;
    const sheetName = SHEET_NAME()!;

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:G`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    [
                        options.taskId,
                        options.taskContent,
                        options.deadline,
                        options.assignee,
                        options.notes,
                        "FALSE",
                        ""
                    ]
                ]
            }
        });
        console.log(messages.log.spreadSuc);
    } catch (error) {
        console.error(messages.log.spreadFail, error);
    }
}

async function updateTask(taskId: string, values: [string, string], action: string) {
    const spreadsheetId = SPREADSHEET_ID()!;
    const sheetName = SHEET_NAME()!;

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:A`
        });

        const rows = response.data.values;
        if (!rows) {
            console.error("スプレッドシートにデータが見つかりませんでした。");
            return;
        }

        const rowIndex = rows.findIndex((row) => row[0] === taskId) + 1;
        if (rowIndex === 0) {
            console.error(`タスク（${taskId}）が見つかりませんでした。`);
            return;
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!F${rowIndex}:G${rowIndex}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [values] }
        });

        console.log(`タスク（${taskId}）を${action}しました。`);
    } catch (error) {
        console.error(`タスクの${action}中にエラーが発生しました：`, error);
    }
}

export async function updateTaskCompletion(taskId: string, completedAt: string) {
    return updateTask(taskId, ["TRUE", completedAt], "完了に更新");
}

export async function resetTaskCompletion(taskId: string) {
    return updateTask(taskId, ["FALSE", ""], "未完了状態にリセット");
}

export async function getUncompletedTasks(): Promise<Array<Task & { assignee: string }>> {
    const spreadsheetId = SPREADSHEET_ID()!;
    const sheetName = SHEET_NAME()!;

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:F`
        });

        const rows = response.data.values;
        if (!rows) {
            console.error("スプレッドシートにデータが見つかりませんでした。");
            return [];
        }

        return rows
            .filter((row) => row[5] === "FALSE") // F列（completed）が FALSE のもの
            .map((row) => ({
                taskId: row[0],
                taskContent: row[1],
                deadline: row[2],
                assignee: row[3],
                notes: row[4]
            }));
    } catch (error) {
        console.error("未完了タスクの取得中にエラーが発生しました：", error);
        return [];
    }
}
