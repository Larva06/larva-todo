const logInfo = (...message: unknown[]): void => {
    const date = new Date();
    const timestamp = date.toISOString();
    // eslint-disable-next-line no-console
    console.log(`[${timestamp}] [larva-todo] [INFO]`, ...message);
};

const logError = (...message: unknown[]): void => {
    const date = new Date();
    const timestamp = date.toISOString();
    // eslint-disable-next-line no-console
    console.error(`[${timestamp}] [larva-todo] [ERROR]`, message);
};

export { logInfo, logError };
