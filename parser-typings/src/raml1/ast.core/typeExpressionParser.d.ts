declare var parser: {
    SyntaxError: (message: any, expected: any, found: any, location: any) => void;
    parse: (input: any) => any;
};
export = parser;
