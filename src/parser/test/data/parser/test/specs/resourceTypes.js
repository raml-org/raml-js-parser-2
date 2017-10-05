/* global RAML, describe, it */

'use strict';

if (typeof window === 'undefined') {
  var raml           = require('../raml-parser-2');
  var chai           = require('chai');
  var chaiAsPromised = require('chai-as-promised');

  chai.should();
  chai.use(chaiAsPromised);
} else {
  var raml           = RAML.Parser;

  chai.should();
}

describe('Resource Types', function () {
  this.timeout(15000);
  //FIXTEST 'circular reference of "a" has been detected: a -> b -> c -> a' => 'Resource type definition contains cycle: a -> b -> c -> a'
  it('should report an error with better message when circular reference is detected', function (done) {
    var definition = [
      '#%RAML 0.8',
      '---',
      'title: Title',
      'resourceTypes:',
      '   - a:',
      '       description: Resource type A',
      '       type: b',
      '   - b:',
      '       description: Resource type B',
      '       type: c',
      '   - c:',
      '       description: Resource type C',
      '       type: a',
      '/:',
      '   type: a'
    ].join('\n');
    raml.load(definition).should.be.rejectedWith('Resource type definition contains cycle: a -> b -> c -> a').and.notify(done);
  });

  //FIXTEST changing raml.load rgument from '[definition]' to 'definition'
  it('should inherit properties when applied with parameters at at least second level (RT-295)', function (done) {
    var definition = [
      '#%RAML 0.8',
      '---',
      'title: Title',
      'resourceTypes:',
      '   - a:',
      '       get:',
      '           description: Hello, <<name>>',
      '   - b:',
      '       type:',
      '           a:',
      '               name: John Galt',
      '/:',
      '   type: b'
    ].join('\n');
    raml.load(definition).should.become({
      title: 'Title',
      resourceTypes: [
        {
          a: {
            get: {
              description: 'Hello, <<name>>'
            }
          }
        },

        {
          b: {
            type: {
              a: {
                name: 'John Galt'
              }
            }
          }
        }
      ],
      resources: [
        {
          type: 'b',
          relativeUri: '/',
          relativeUriPathSegments: [ ],
          methods: [
            {
              method: 'get',
              description: 'Hello, John Galt'
            }
          ]
        }
      ]
    }).and.notify(done);
  });

  //FIXTEST changing methods order in test JSON
  it('should allow injecting resource type name into another resource type', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: Title',
      'resourceTypes:',
      '   - resourceType1:',
      '       type: <<resourceTypeName>>',
      '       get:',
      '   - resourceType2:',
      '       post:',
      '/:',
      '   type:',
      '       resourceType1:',
      '           resourceTypeName: resourceType2',
      '   delete:'
    ].join('\n')).should.become({
      title: 'Title',
      resourceTypes: [
        {
          resourceType1: {
            type: '<<resourceTypeName>>',
            get: null
          }
        },

        {
          resourceType2: {
            post: null
          }
        }
      ],
      resources: [
        {
          relativeUriPathSegments: [ ],
          relativeUri: '/',
          type: {
            resourceType1: {
              resourceTypeName: 'resourceType2'
            }
          },
          methods: [
            {
              method: 'delete'
            },
            {
              method: 'get'
            },
            {
              method: 'post'
            }
          ]
        }
      ]
    }).and.notify(done);
  });

  //FIXTEST changed error message: "there is no resource type named type2"=>"Unrecognized resource type 'type2'."
  it('should not crash and report proper error if injected resource type does not exist', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: Title',
      'resourceTypes:',
      '   - type1:',
      '       type: <<typeName>>',
      '/:',
      '   type:',
      '       type1:',
      '           typeName: type2'
    ].join('\n')).should.be.rejectedWith("Unrecognized resource type: 'type2'.").and.notify(done);
  });

  //FIXTEST capitalized error message
  it('should not allow reserved parameters', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: Title',
      'resourceTypes:',
      '   - type1:',
      '       description: <<resourcePath>>',
      '/:',
      '   type:',
      '       type1:',
      '           resourcePath: does-not-matter'
    ].join('\n')).should.be.rejectedWith("Invalid parameter name: 'resourcePath' is reserved").and.notify(done);
  });

  it('should provide reserved <<resourcePathName>> parameter', function (done) {
    raml.load([
        '#%RAML 0.8',
        '---',
        'title: Title',
        'resourceTypes:',
        '   - type1:',
        '       description: <<resourcePathName>>',
        '/a/b/c:',
        '   type: type1'
    ].join('\n')).should.eventually.have.nested.property('resources[0].description', 'c').and.notify(done);
  });

  //it('should provide reserved <<resourcePathName>> parameter when there are variables in the URI', function (done) {
  //  raml.load([
  //      '#%RAML 0.8',
  //      '---',
  //      'title: Title',
  //      'resourceTypes:',
  //      '   - type1:',
  //      '       description: <<resourcePathName>>',
  //      '/a/b/{c}:',
  //      '   type: type1'
  //  ].join('\n')).should.eventually.to.have.deep.property('resources[0].description', 'b').and.notify(done);
  //});
  //
  //it('should provide reserved <<resourcePathName>> parameter when there are variables in the URI', function (done) {
  //  raml.load([
  //      '#%RAML 0.8',
  //      '---',
  //      'title: Title',
  //      'resourceTypes:',
  //      '   - type1:',
  //      '       description: <<resourcePathName>>',
  //      '/{a}/{b}/{c}:',
  //      '   type: type1'
  //  ].join('\n')).should.eventually.to.have.deep.property('resources[0].description', '').and.notify(done);
  //});

  //FIXTEST changed error message: "resource type name must be provided"=>"value was not provided for parameter: resourceTypeName"
  it('should check for empty resource type name provided as a parameter to another resource type', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: Title',
      'resourceTypes:',
      '  - resourceType1:',
      '      type: <<resourceTypeName>>',
      '/:',
      '  type:',
      '    resourceType1:',
      '      resourceTypeName:'
    ].join('\n')).should.be.rejectedWith("Value is not provided for parameter: 'resourceTypeName'").and.notify(done);
  });
});
