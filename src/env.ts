// env.ts

import dotenv from "dotenv";
import type { ColorResolvable } from "discord.js";

dotenv.config();

const DISCORD_TOKEN = (): string => {
    if (process.env["DISCORD_TOKEN"]) {
        return process.env["DISCORD_TOKEN"];
    } else {
        throw new Error("DISCORD_TOKEN is undefined.");
    }
};

const APPLICATION_ID = (): string => {
    if (process.env["APPLICATION_ID"]) {
        return process.env["APPLICATION_ID"];
    } else {
        throw new Error("APPLICATION_ID is undefined.");
    }
};

const GUILD_ID = (): string => {
    if (process.env["GUILD_ID"]) {
        return process.env["GUILD_ID"];
    } else {
        throw new Error("GUILD_ID is undefined.");
    }
};

const CHANNEL_ID = (): string => {
    if (process.env["CHANNEL_ID"]) {
        return process.env["CHANNEL_ID"];
    } else {
        throw new Error("CHANNEL_ID is undefined.");
    }
};

const GOOGLE_SERVICE_ACCOUNT_EMAIL = (): string => {
    if (process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"]) {
        return process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"];
    } else {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL is undefined.");
    }
};

const GOOGLE_PRIVATE_KEY = (): string => {
    if (process.env["GOOGLE_PRIVATE_KEY"]) {
        return process.env["GOOGLE_PRIVATE_KEY"];
    } else {
        throw new Error("GOOGLE_PRIVATE_KEY is undefined.");
    }
};

const SPREADSHEET_ID = (): string => {
    if (process.env["SPREADSHEET_ID"]) {
        return process.env["SPREADSHEET_ID"];
    } else {
        throw new Error("SPREADSHEET_ID is undefined.");
    }
};

const SHEET_NAME = (): string => {
    if (process.env["SHEET_NAME"]) {
        return process.env["SHEET_NAME"];
    } else {
        throw new Error("SHEET_NAME is undefined.");
    }
};

const THEME_COLOR = (): ColorResolvable => {
    if (process.env["THEME_COLOR"]) {
        return process.env["THEME_COLOR"] as ColorResolvable;
    } else {
        throw new Error("THEME_COLOR is undefined.");
    }
};

const TIMEZONE_OFFSET = (): string => {
    if (process.env["TIMEZONE_OFFSET"]) {
        return process.env["TIMEZONE_OFFSET"];
    } else {
        throw new Error("TIMEZONE_OFFSET is undefined.");
    }
};

export {
    DISCORD_TOKEN,
    APPLICATION_ID,
    GUILD_ID,
    CHANNEL_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY,
    SPREADSHEET_ID,
    SHEET_NAME,
    THEME_COLOR,
    TIMEZONE_OFFSET
};
