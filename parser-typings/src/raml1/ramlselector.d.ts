declare var mod: {
    SyntaxError: (message: any, expected: any, found: any, offset: any, line: any, column: any) => void;
    parse: (input: any) => any;
};
export = mod;
