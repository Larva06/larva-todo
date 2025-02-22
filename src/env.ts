// env.ts

import dotenv from 'dotenv';

dotenv.config();

export function TOKEN(): string {
  if (process.env["TOKEN"]) {
    return process.env["TOKEN"];
  } else {
    throw new Error('TOKEN is undefined.');
  }
}

export function APPLICATION_ID(): string {
  if (process.env["APPLICATION_ID"]) {
    return process.env["APPLICATION_ID"];
  } else {
    throw new Error('APPLICATION_ID is undefined.');
  }
}

export function GUILD_ID(): string {
  if (process.env["GUILD_ID"]) {
    return process.env["GUILD_ID"];
  } else {
    throw new Error('GUILD_ID is undefined.');
  }
}

export function CHANNEL_ID(): string {
  if (process.env["CHANNEL_ID"]) {
    return process.env["CHANNEL_ID"];
  } else {
    throw new Error('CHANNEL_ID is undefined.');
  }
}

export function GOOGLE_CLIENT_ID(): string {
  if (process.env["GOOGLE_CLIENT_ID"]) {
    return process.env["GOOGLE_CLIENT_ID"];
  } else {
    throw new Error('GOOGLE_CLIENT_ID is undefined.');
  }
}

export function GOOGLE_CLIENT_SECRET(): string {
  if (process.env["GOOGLE_CLIENT_SECRET"]) {
    return process.env["GOOGLE_CLIENT_SECRET"];
  } else {
    throw new Error('GOOGLE_CLIENT_SECRET is undefined.');
  }
}

export function GOOGLE_SERVICE_ACCOUNT_EMAIL(): string {
  if (process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"]) {
    return process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"];
  } else {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL is undefined.');
  }
}

export function GOOGLE_PRIVATE_KEY(): string {
  if (process.env["GOOGLE_PRIVATE_KEY"]) {
    return process.env["GOOGLE_PRIVATE_KEY"];
  } else {
    throw new Error('GOOGLE_PRIVATE_KEY is undefined.');
  }
}

export function SPREADSHEET_ID(): string {
  if (process.env["SPREADSHEET_ID"]) {
    return process.env["SPREADSHEET_ID"];
  } else {
    throw new Error('SPREADSHEET_ID is undefined.');
  }
}

export function SHEET_NAME(): string {
  if (process.env["SHEET_NAME"]) {
    return process.env["SHEET_NAME"];
  } else {
    throw new Error('SHEET_NAME is undefined.');
  }
}