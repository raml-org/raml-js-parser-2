'use strict';

if (typeof window === 'undefined') {
    var raml           = require('../../raml-parser-2');
    var chai           = require('chai');
    var expect         = chai.expect;
    var should         = chai.should();
    var chaiAsPromised = require('chai-as-promised');
    var q              = require('q');
    var path = require('path');

    chai.use(chaiAsPromised);
} else {
    var raml           = RAML.Parser;
    chai.should();
}

describe('Parser', function() {
    it('should succeed when a overriding baseUriParams in a method', function(done) {
        var definition = [
            '#%RAML 0.8',
            '---',
            'baseUri: https://{domainName}.myapi.com',
            'title: Test',
            '/resource:',
            '  get:',
            '     baseUriParameters:',
            '       domainName:',
            '         example: your-bucket'
        ].join('\n');
        var expected = {
            baseUri: "https://{domainName}.myapi.com",
            protocols: [
                'HTTPS'
            ],
            title: "Test",
            resources: [
                {
                    relativeUriPathSegments: [ "resource" ],
                    "relativeUri": "/resource",
                    methods: [
                        {
                            baseUriParameters: {
                                "domainName": {
                                    example: "your-bucket",
                                    type: "string",
                                    required: true,
                                    displayName: "domainName"
                                }
                            },
                            method: "get",
                            protocols: [
                                'HTTPS'
                            ],
                        }
                    ],
                }
            ],
            baseUriParameters: {
                domainName: {
                    type: "string",
                    required: true,
                    displayName: "domainName"
                }
            }
        };
        raml.load(definition).should.become(expected).and.notify(done);
    });
});
