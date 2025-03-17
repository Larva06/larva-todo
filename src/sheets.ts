import { GOOGLE_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL, SHEET_NAME, SPREADSHEET_ID } from "./env.js";
import { logError, logInfo } from "./log.js";
import type { Task } from "./types/types.js";
import { google } from "googleapis";
import messages from "./data/messages.json" with { type: "json" };

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // eslint-disable-next-line no-undefined
    undefined,
    GOOGLE_PRIVATE_KEY.replace(/\\n/gu, "\n"),
    SCOPES
);

const sheets = google.sheets({ auth, version: "v4" });

const writeToSheet = async (options: Task): Promise<void> => {
    const spreadsheetId = SPREADSHEET_ID;
    const sheetName = SHEET_NAME;

    try {
        await sheets.spreadsheets.values.append({
            range: `${sheetName}!A:G`,
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
            },
            spreadsheetId,
            valueInputOption: "USER_ENTERED"
        });
        logInfo(messages.log.spreadSuc);
    } catch (error) {
        logError(messages.log.spreadFail, error);
    }
};

// eslint-disable-next-line max-statements
const updateTask = async (taskId: string, values: [string, string], action: string): Promise<void> => {
    const spreadsheetId = SPREADSHEET_ID;
    const sheetName = SHEET_NAME;

    try {
        const response = await sheets.spreadsheets.values.get({
            range: `${sheetName}!A:A`,
            spreadsheetId
        });

        const rows = response.data.values;
        if (!rows) {
            logError("スプレッドシートにデータが見つかりませんでした。");
            return;
        }

        // 0はじまりのインデックスを1はじまりの行番号に変換して取得
        // eslint-disable-next-line no-magic-numbers
        const rowIndex = rows.findIndex((row) => row[0] === taskId) + 1;
        if (!rowIndex) {
            logError(`タスク（${taskId}）が見つかりませんでした。`);
            return;
        }

        await sheets.spreadsheets.values.update({
            range: `${sheetName}!F${rowIndex.toString()}:G${rowIndex.toString()}`,
            requestBody: { values: [values] },
            spreadsheetId,
            valueInputOption: "USER_ENTERED"
        });

        logInfo(`タスク（${taskId}）を${action}しました。`);
    } catch (error) {
        logError(`タスクの${action}中にエラーが発生しました：`, error);
    }
};

const updateTaskCompletion = async (taskId: string): Promise<void> => {
    const timestamp = new Date().toISOString();
    await updateTask(taskId, ["TRUE", timestamp], "完了に更新");
};

const resetTaskCompletion = async (taskId: string): Promise<void> => {
    await updateTask(taskId, ["FALSE", ""], "未完了状態にリセット");
};

// eslint-disable-next-line max-statements
const getUncompletedTasks = async (): Promise<Array<Task & { assignee: string }>> => {
    const spreadsheetId = SPREADSHEET_ID;
    const sheetName = SHEET_NAME;

    try {
        const response = await sheets.spreadsheets.values.get({
            range: `${sheetName}!A:F`,
            spreadsheetId
        });

        const rows = response.data.values;
        if (!rows) {
            logError("スプレッドシートにデータが見つかりませんでした。");
            return [];
        }

        return rows
            .filter((row) => row[5] === "FALSE")
            .map((row) => ({
                /* eslint-disable @typescript-eslint/no-unsafe-assignment */
                assignee: row[3],
                deadline: row[2],
                notes: row[4],
                taskContent: row[1],
                taskId: row[0]
                /* eslint-enable @typescript-eslint/no-unsafe-assignment */
            }));
    } catch (error) {
        logError("未完了タスクの取得中にエラーが発生しました：", error);
        return [];
    }
};

export { writeToSheet, updateTask, updateTaskCompletion, resetTaskCompletion, getUncompletedTasks };
