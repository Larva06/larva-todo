import type { ColorResolvable } from "discord.js";

const loadEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is undefined.`);
    return value;
};

const DISCORD_TOKEN = loadEnv("DISCORD_TOKEN");

const APPLICATION_ID = loadEnv("APPLICATION_ID");

const GUILD_ID = loadEnv("GUILD_ID");

const CHANNEL_ID = loadEnv("CHANNEL_ID");

const GOOGLE_SERVICE_ACCOUNT_EMAIL = loadEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");

const GOOGLE_PRIVATE_KEY = loadEnv("GOOGLE_PRIVATE_KEY");

const SPREADSHEET_ID = loadEnv("SPREADSHEET_ID");

const SHEET_NAME = loadEnv("SHEET_NAME");

const THEME_COLOR = loadEnv("THEME_COLOR") as ColorResolvable;

const TIMEZONE_OFFSET = loadEnv("TIMEZONE_OFFSET");

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
