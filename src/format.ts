const format = (str: string, ...args: string[]): string => {
    let result = str;

    for (const [index, arg] of args.entries()) {
        result = result.replaceAll(`{${index.toString()}}`, arg);
    }

    return result;
};

export { format };
