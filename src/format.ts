const format = (str: string, ...args: string[]): string => {
    let result = str;

    for (const [index, arg] of args.entries()) {
        const regExp = new RegExp(`\\{${index.toString()}\\}`, "gu");
        result = str.replace(regExp, arg);
    }

    return result;
};

export { format };
