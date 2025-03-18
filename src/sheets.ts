import { GOOGLE_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL, SHEET_NAME, SPREADSHEET_ID } from "./env.js";
import type { TaskDataForDiscord, TaskDataForSheets } from "./types/types.js";
import { logError, logInfo } from "./log.js";
import messages from "./data/messages.json" with { type: "json" };
import sheets from "@googleapis/sheets";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new sheets.auth.JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // eslint-disable-next-line no-undefined
    undefined,
    GOOGLE_PRIVATE_KEY.replace(/\\n/gu, "\n"),
    SCOPES
);

const taskSheets = sheets.sheets({ auth, version: "v4" });

const writeToSheet = async (options: TaskDataForDiscord): Promise<void> => {
    const spreadsheetId = SPREADSHEET_ID;
    const sheetName = SHEET_NAME;

    const assigneeName = "displayName" in options.assignee ? options.assignee.displayName : options.assignee.name;

    try {
        await taskSheets.spreadsheets.values.append({
            range: `${sheetName}!A:H`,
            requestBody: {
                values: [
                    [
                        options.taskId,
                        options.taskContent,
                        options.deadline,
                        assigneeName,
                        options.assignee.toString(),
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
        const response = await taskSheets.spreadsheets.values.get({
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

        await taskSheets.spreadsheets.values.update({
            range: `${sheetName}!G${rowIndex.toString()}:H${rowIndex.toString()}`,
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
const getUncompletedTasks = async (): Promise<TaskDataForSheets[]> => {
    const spreadsheetId = SPREADSHEET_ID;
    const sheetName = SHEET_NAME;

    try {
        const response = await taskSheets.spreadsheets.values.get({
            range: `${sheetName}!A:G`,
            spreadsheetId
        });

        const rows = response.data.values;
        if (!rows) {
            logError("スプレッドシートにデータが見つかりませんでした。");
            return [];
        }

        return rows
            .filter((row) => row[5] === "FALSE")
            .map(
                (row) =>
                    ({
                        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
                        assigneeId: row[4],
                        assigneeName: row[3],
                        deadline: row[2],
                        notes: row[5],
                        taskContent: row[1],
                        taskId: row[0],
                        type: "sheets"
                        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
                    }) as const satisfies TaskDataForSheets
            );
    } catch (error) {
        logError("未完了タスクの取得中にエラーが発生しました：", error);
        return [];
    }
};

export { writeToSheet, updateTask, updateTaskCompletion, resetTaskCompletion, getUncompletedTasks };
