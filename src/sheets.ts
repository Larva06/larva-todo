// sheets.ts 

import { google } from 'googleapis';
import messages from './data/messages.json';
import { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID, SHEET_NAME } from './env';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL(),
    undefined,
    GOOGLE_PRIVATE_KEY()?.replace(/\\n/g, '\n'),
    SCOPES
);

const sheets = google.sheets({ version: 'v4', auth });

export async function writeToSheet(
  taskContent: string, 
  deadLine: string, 
  user: string, 
  notes: string, 
  timestamp?: string 
) {
    const spreadsheetId = SPREADSHEET_ID()!;
    const sheetName = SHEET_NAME()!;
    
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:E`,  
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [taskContent, deadLine, user, notes, timestamp] 
                ],
            },
        });
        console.log(messages.log.spreadSuc);
    } catch (error) {
        console.error(messages.log.spreadFail, error);
    }
}