// sheets.ts

import { google } from "googleapis";
import messages from "./data/messages.json" with { type: "json" };
import { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID, SHEET_NAME } from "./env.js";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL(),
    undefined,
    GOOGLE_PRIVATE_KEY()?.replace(/\\n/g, "\n"),
    SCOPES
);

const sheets = google.sheets({ version: "v4", auth });

export async function writeToSheet(taskId: string, taskContent: string, deadLine: string, user: string, notes: string) {
    const spreadsheetId = SPREADSHEET_ID()!;
    const sheetName = SHEET_NAME()!;

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:G`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[taskId, taskContent, deadLine, user, notes, "false", ""]]
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
    return updateTask(taskId, ["true", completedAt], "完了に更新");
}

export async function resetTaskCompletion(taskId: string) {
    return updateTask(taskId, ["false", ""], "未完了状態にリセット");
}
