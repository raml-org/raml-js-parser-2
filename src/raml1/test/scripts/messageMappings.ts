var mappings = [
    {
        messagePatterns: [
            {
                "parser": "JS",
                "pattern": "Required property: (.+) is missed"
            },
            {
                "parser": "Java",
                "pattern": "Missing required field \"(.+)\""
            }
        ]
    }
];

export = mappings;