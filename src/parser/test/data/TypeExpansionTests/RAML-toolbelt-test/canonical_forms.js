'use strict'

/*
 Contains map of type names to their canonical forms. Types taken from
 "./types.js"

 Forms were produced by the original Clojure lib (raml-parser-toolbelt)
 node example as of commit eaf25cccd7991fe8d6f700aa615bdfbe91a6ced2
 */

module.exports = {
    Song: {
        properties: {
            title: {
                type: 'string',
                example: 'Great',
                required: true
            },
            length: {
                type: 'string',
                required: true
            }
        },
        additionalProperties: true,
        type: 'object'
    },
    Album: {
        properties: {
            title: {
                type: 'string',
                required: true
            },
            songs: {
                description: 'A list of songs inside an album.',
                type: 'array',
                items: {
                    name: "Song",
                    properties: {
                        title: {
                            type: 'string',
                            example: 'Great',
                            required: true
                        },
                        length: {
                            type: 'string',
                            required: true
                        }
                    },
                    additionalProperties: true,
                    type: 'object'
                },
                required: true
            }
        },
        additionalProperties: true,
        type: 'object',
        examples: {
            Album1: {
                title: 'Test 1',
                songs: [
                    {
                        title: 'Great',
                        length: '2'
                    },
                    {
                        title: 'Awesome',
                        length: '3'
                    }
                ]
            },
            Album2: {
                title: 'Test 2',
                songs: [
                    {
                        title: 'Great',
                        length: '2'
                    },
                    {
                        title: 'Awesome',
                        length: '3'
                    }
                ]
            }
        }
    },
    Phone: {
        properties: {
            manufacturer: {
                type: 'string',
                required: true
            },
            numberOfSIMCards: {
                type: 'number',
                required: true
            },
            kind: {
                type: 'string',
                required: true
            }
        },
        additionalProperties: true,
        type: 'object'
    },
    Notebook: {
        properties: {
            manufacturer: {
                type: 'string',
                required: true
            },
            numberOfUSBPorts: {
                type: 'number',
                required: true
            },
            kind: {
                type: 'string',
                required: true
            }
        },
        additionalProperties: true,
        type: 'object'
    },
    Device: {
        anyOf: [
            {
                properties: {
                    manufacturer: {
                        type: 'string',
                        required: true
                    },
                    numberOfSIMCards: {
                        type: 'number',
                        required: true
                    },
                    kind: {
                        type: 'string',
                        required: true
                    }
                },
                additionalProperties: true,
                type: 'object'
            },
            {
                properties: {
                    manufacturer: {
                        type: 'string',
                        required: true
                    },
                    numberOfUSBPorts: {
                        type: 'number',
                        required: true
                    },
                    kind: {
                        type: 'string',
                        required: true
                    }
                },
                additionalProperties: true,
                type: 'object'
            }
        ],
        type: 'union'
    },
    Deprecation: {
        anyOf: [
            {
                type: 'nil'
            },
            {
                type: 'string'
            }
        ],
        type: 'union'
    },
    SimpleUnion: {
        additionalProperties: true,
        type: 'union',
        anyOf: [
            {
                properties: {
                    a: {
                        type: 'string',
                        required: true
                    },
                    b: {
                        type: 'number',
                        required: true
                    }
                },
                additionalProperties: true,
                type: 'object'
            },
            {
                properties: {
                    a: {
                        type: 'string',
                        required: true
                    },
                    b: {
                        type: 'string',
                        required: true
                    }
                },
                additionalProperties: true,
                type: 'object'
            }
        ]
    },
    WithInheritance: null,
    InlinedDeclaration: {
        additionalProperties: true,
        type: 'object',
        properties: {
            stringProperty: {
                type: 'string',
                required: true
            },
            numberProperty: {
                type: 'number',
                required: true
            }
        }
    },
    ValidConstraintsInheritance: null,
    DataEntry: {
        description: 'A single data entry(row) with any number of field-name, field-value pairs',
        type: 'union',
        example: '{\n "temp": 20.5,\n "time": 12565\n}\n',
        additionalProperties: true,
        anyOf: [
            {
                description: 'A single data entry(row) with any number of field-name, field-value pairs',
                type: 'object',
                properties: {
                    '//': {
                        description: '8-byte signed integer',
                        type: 'integer',
                        format: 'int64',
                        required: true
                    }
                },
                example: '{\n "temp": 20.5,\n "time": 12565\n}\n',
                additionalProperties: true
            },
            {
                description: 'A single data entry(row) with any number of field-name, field-value pairs',
                type: 'object',
                properties: {
                    '//': {
                        description: '8-byte double precision floating-point',
                        type: 'number',
                        format: 'double',
                        required: true
                    }
                },
                example: '{\n "temp": 20.5,\n "time": 12565\n}\n',
                additionalProperties: true
            },
            {
                description: 'A single data entry(row) with any number of field-name, field-value pairs',
                type: 'object',
                properties: {
                    '//': {
                        description: 'Signed degrees format Signed degrees format (DDD.dddd)\nA latitude or longitude with 8 decimal places pinpoints a location to within 1 millimeter,( 1/16 inch).\nPrecede South latitudes and West longitudes with a minus sign. Latitudes range from -90 to 90. Longitudes range from -180 to 180.\n41.25,-120.9762 -31.96,115.84 90,0 (North Pole)',
                        type: 'string',
                        pattern: '^[-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?),\\s*[-+]?(180(\\.0+)?|((1[0-7]\\d)|([1-9]?\\d))(\\.\\d+)?)$',
                        required: true
                    }
                },
                example: '{\n "temp": 20.5,\n "time": 12565\n}\n',
                additionalProperties: true
            },
            {
                description: 'A single data entry(row) with any number of field-name, field-value pairs',
                type: 'object',
                properties: {
                    '//': {
                        description: 'UNIX timestamp in milliseconds since 1970. (8 bytes)',
                        type: 'integer',
                        format: 'int64',
                        required: true
                    }
                },
                example: '{\n "temp": 20.5,\n "time": 12565\n}\n',
                additionalProperties: true
            },
            {
                description: 'A single data entry(row) with any number of field-name, field-value pairs',
                type: 'object',
                properties: {
                    '//': {
                        description: 'At least one and up to 160 characters',
                        type: 'string',
                        minLength: 1,
                        maxLength: 160,
                        required: true
                    }
                },
                example: '{\n "temp": 20.5,\n "time": 12565\n}\n',
                additionalProperties: true
            }
        ]
    },
    Integer: {
        description: '8-byte signed integer',
        type: 'integer',
        format: 'int64'
    },
    Float: {
        description: '8-byte double precision floating-point',
        type: 'number',
        format: 'double'
    },
    Location: {
        description: 'Signed degrees format Signed degrees format (DDD.dddd)\nA latitude or longitude with 8 decimal places pinpoints a location to within 1 millimeter,( 1/16 inch).\nPrecede South latitudes and West longitudes with a minus sign. Latitudes range from -90 to 90. Longitudes range from -180 to 180.\n41.25,-120.9762 -31.96,115.84 90,0 (North Pole)',
        type: 'string',
        pattern: '^[-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?),\\s*[-+]?(180(\\.0+)?|((1[0-7]\\d)|([1-9]?\\d))(\\.\\d+)?)$'
    },
    Timestamp: {
        description: 'UNIX timestamp in milliseconds since 1970. (8 bytes)',
        type: 'integer',
        format: 'int64'
    },
    String: {
        description: 'At least one and up to 160 characters',
        type: 'string',
        minLength: 1,
        maxLength: 160
    },
    Pet: {
        properties: {
            id: {
                type: 'integer',
                format: 'int64',
                required: false
            },
            name: {
                type: 'string',
                example: 'doggie',
                required: true
            },
            photoUrls: {
                type: 'array',
                items: {
                    type: 'string'
                },
                required: true
            },
            tags: {
                type: 'array',
                items: {
                    properties: {
                        id: {
                            type: 'integer',
                            format: 'int64',
                            required: false
                        },
                        name: {
                            type: 'string',
                            required: false
                        }
                    },
                    type: 'object',
                    additionalProperties: true
                },
                required: false
            },
            status: {
                type: 'string',
                description: 'pet status in the store',
                required: false
            }
        },
        type: 'object',
        additionalProperties: true
    },
    Tag: {
        properties: {
            id: {
                type: 'integer',
                format: 'int64',
                required: false
            },
            name: {
                type: 'string',
                required: false
            }
        },
        type: 'object',
        additionalProperties: true
    },
    Org: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                required: true
            },
            address: {
                type: 'string',
                required: false
            },
            value: {
                type: 'string',
                required: false
            }
        },
        additionalProperties: true
    },
    'Songs.Song': {
        properties: {
            title: {
                type: 'string',
                required: true
            },
            length: {
                type: 'number',
                required: true
            }
        },
        type: 'object',
        additionalProperties: true
    },
    'Songs.Album': {
        properties: {
            title: {
                type: 'string',
                required: true
            },
            songs: {
                type: 'array',
                items: {
                    properties: {
                        title: {
                            type: 'string',
                            required: true
                        },
                        length: {
                            type: 'number',
                            required: true
                        }
                    },
                    type: 'object',
                    additionalProperties: true
                },
                required: true
            }
        },
        type: 'object',
        additionalProperties: true
    },
    'Songs.LP': {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                required: true
            },
            length: {
                type: 'number',
                required: true
            },
            duration: {
                type: 'string',
                required: true
            }
        },
        additionalProperties: true
    },
    'Songs.Publication': {
        type: 'object',
        properties: {
            other: {
                type: 'integer',
                required: true
            },
            title: {
                type: 'string',
                required: true
            },
            length: {
                type: 'number',
                required: true
            },
            duration: {
                type: 'string',
                required: true
            },
            songs: {
                type: 'array',
                items: {
                    properties: {
                        title: {
                            type: 'string',
                            required: true
                        },
                        length: {
                            type: 'number',
                            required: true
                        }
                    },
                    type: 'object',
                    additionalProperties: true
                },
                required: true
            },
            date: {
                type: 'string',
                required: true
            }
        },
        additionalProperties: true
    },
    'Songs.Musician': {
        type: 'union',
        additionalProperties: true,
        anyOf: [
            {
                properties: {
                    name: {
                        type: 'string',
                        required: true
                    },
                    discography: {
                        type: 'array',
                        items: {
                            properties: {
                                title: {
                                    type: 'string',
                                    required: true
                                },
                                length: {
                                    type: 'number',
                                    required: true
                                }
                            },
                            type: 'object',
                            additionalProperties: true
                        },
                        required: true
                    }
                },
                type: 'object',
                additionalProperties: true
            },
            {
                properties: {
                    name: {
                        type: 'string',
                        required: true
                    },
                    discography: {
                        type: 'array',
                        items: {
                            properties: {
                                title: {
                                    type: 'string',
                                    required: true
                                },
                                songs: {
                                    type: 'array',
                                    items: {
                                        properties: {
                                            title: {
                                                type: 'string',
                                                required: true
                                            },
                                            length: {
                                                type: 'number',
                                                required: true
                                            }
                                        },
                                        type: 'object',
                                        additionalProperties: true
                                    },
                                    required: true
                                }
                            },
                            type: 'object',
                            additionalProperties: true
                        },
                        required: true
                    }
                },
                type: 'object',
                additionalProperties: true
            }
        ]
    },
    'Songs.C': {
        type: 'object',
        properties: {
            other: {
                type: 'integer',
                required: true
            }
        },
        additionalProperties: true
    },
    'Songs.Constrained': {
        type: 'array',
        items: {
            type: 'string'
        },
        minItems: 10
    },
    'Songs.ExemplarSong': {
        properties: {
            title: {
                type: 'string',
                example: 'Great',
                required: true
            },
            length: {
                type: 'string',
                required: true
            }
        },
        type: 'object',
        additionalProperties: true
    },
    'Songs.ExemplarAlbum': {
        properties: {
            title: {
                type: 'string',
                required: true
            },
            songs: {
                type: 'array',
                items: {
                    properties: {
                        title: {
                            type: 'string',
                            example: 'Great',
                            required: true
                        },
                        length: {
                            type: 'string',
                            required: true
                        }
                    },
                    type: 'object',
                    additionalProperties: true
                },
                required: true
            }
        },
        examples: {
            Album1: {
                title: 'Test 1',
                songs: [
                    {
                        title: 'Great',
                        length: '2'
                    }
                ]
            }
        },
        type: 'object',
        additionalProperties: true
    },
    'Songs.Cell': {
        type: 'union',
        additionalProperties: true,
        anyOf: [
            {
                properties: {
                    car: {
                        type: 'any',
                        required: true
                    },
                    cdr: {
                        properties: {
                            cell: {
                                type: '$recur',
                                required: true
                            }
                        },
                        type: 'object',
                        additionalProperties: true,
                        required: true
                    }
                },
                type: 'object',
                additionalProperties: true
            },
            {
                properties: {
                    car: {
                        type: 'any',
                        required: true
                    },
                    cdr: {
                        type: 'nil',
                        required: true
                    }
                },
                type: 'object',
                additionalProperties: true
            }
        ]
    },
    'Songs.List': {
        type: 'union',
        additionalProperties: true,
        anyOf: [
            {
                properties: {
                    cell: {
                        properties: {
                            car: {
                                type: 'any',
                                required: true
                            },
                            cdr: {
                                type: '$recur',
                                required: true
                            }
                        },
                        type: 'object',
                        additionalProperties: true,
                        required: true
                    }
                },
                type: 'object',
                additionalProperties: true
            },
            {
                properties: {
                    cell: {
                        properties: {
                            car: {
                                type: 'any',
                                required: true
                            },
                            cdr: {
                                type: 'nil',
                                required: true
                            }
                        },
                        type: 'object',
                        additionalProperties: true,
                        required: true
                    }
                },
                type: 'object',
                additionalProperties: true
            }
        ]
    },
    missingFacets: {
        type: 'object',
        additionalProperties: true,
        properties: {
            name: {
                description: 'Cat name',
                displayName: 'name',
                type: 'string',
                facets: {
                    amazing: {
                        type: 'boolean'
                    }
                },
                required: true,
                amazing: true
            }
        }
    },
    defaultPropertyType: {
        properties: {
            city: {
                type: 'any',
                required: true
            }
        },
        type: 'object',
        additionalProperties: true
    },
    atomic: {
        type: 'string'
    },
    constraints: {
        type: 'array',
        minItems: 15,
        maxItems: 20,
        items: {
            type: 'string'
        }
    },
    Cat: {
        type: 'union',
        additionalProperties: true,
        anyOf: [
            {
                type: 'object',
                properties: {
                    address: {
                        type: 'string',
                        required: true
                    },
                    age: {
                        type: 'integer',
                        required: true
                    }
                },
                additionalProperties: true
            },
            {
                type: 'object',
                properties: {
                    address: {
                        type: 'string',
                        required: true
                    },
                    age: {
                        type: 'number',
                        required: true
                    }
                },
                additionalProperties: true
            }
        ]
    },
    AnimalWithAddress: {
        properties: {
            address: {
                type: 'string',
                required: true
            }
        },
        type: 'object',
        additionalProperties: true
    },
    Entry: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    required: true
                },
                artist: {
                    type: 'string',
                    required: true
                }
            },
            additionalProperties: true
        }
    },
    AnotherEntry: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    required: true
                },
                artist: {
                    type: 'string',
                    required: true
                }
            },
            additionalProperties: true
        },
        description: 'This is just another entry to simulate that you can add facets also on JSON schema defined types. Although you can only add documentation-based facets.'
    },
    MinTypeTest: {
        type: 'object',
        properties: {
            a: {
                type: 'string',
                pattern: '^test1*$',
                enumValues: [
                    'test1'
                ],
                required: true
            },
            f: {
                type: 'integer',
                minimum: 2,
                maximum: 3,
                format: 'int64',
                required: true
            },
            k: {
                type: 'array',
                items: {
                    type: 'number'
                },
                required: true,
                uniqueItems: true
            }
        },
        minProperties: 2,
        maxProperties: 3,
        minLength: 2,
        maxLength: 3,
        minItems: 2,
        maxItems: 3,
        additionalProperties: true
    }
}
