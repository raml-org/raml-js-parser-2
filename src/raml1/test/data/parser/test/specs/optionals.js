/* Reject optional scalar parameters */

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

describe('Optional scalar parameters', function () {
  this.timeout(15000);

  //TESTFIX changed error message : 'property: \'' + property[0] + '\' is invalid in a resource type'=>
  //'Optional scalar properties are not allowed in resource types and their descendants: ''+property[0]
  //setting valid values for 'is', 'type' and 'securedBy' properties
  //inserting title
  //removing 'is' and 'securedBy' from the list
  (function(){
    [
      ['displayName?',': displayName'],
      ['description?',': description'],
//      ['is?',': [ trait1 ]'], we consider optional 'is' property as valid as only sclar properties are prohibited to be optional
      ['usage?',': usage'],
      ['type?',': rt1']
//      ['securedBy?',': securityScheme1'], we consider optional 'securedBy' property as valid as only sclar properties are prohibited to be optional
    ].forEach(function(property){
      it('should reject scalar optional parameters in an RT', function (done) {
        raml.load([
          '#%RAML 0.8',
          'title: Optional Parameters Test',
          'traits:',
          '  - trait1:',
          'securitySchemes:',
          '  - securityScheme1:',
          '      type: Basic Authentication',
          'resourceTypes:',
          '  - rt1:',
          '  - failType:',
          '      ' + property[0] + property[1]
        ].join('\n')).should.be.rejectedWith("Optional scalar properties are not allowed in resource types and their descendants: '"+property[0]+"'").and.notify(done);
      });
      });
  })();

  //FIXTEST changed message 'unknown property ' + property[0]=>
  //'Optional scalar properties are not allowed in resource types and their descendants: ''+property[0]
  //inserted type: number for testing 'minimum' and 'maximum'
  (function(){
    [
      ['displayName?',': displayName'],
      ['pattern?',': pattern'],
      ['default?',': default'],
      ['description?',': description'],
      ['example?',': example'],
      ['minLength?',': 12'],
      ['maxLength?',': 21'],
      ['minimum?',': 1\n          type: number'],
      ['maximum?',': 2\n          type: number'],
      ['type?',': string'],
      ['required?',': false'],
      ['repeat?',': true']
    ].forEach(function(property){
      it('should reject scalar optional parameters in a named paraemter', function (done) {
        raml.load([
          '#%RAML 0.8',
          'title: Title',
          'resourceTypes:',
          '  - failType:',
          '      uriParameters:',
          '        failParam:',
          '          ' + property[0] + property[1]
        ].join('\n')).should.be.rejectedWith("Optional scalar properties are not allowed in resource types and their descendants: '"+property[0]+"'").and.notify(done);
      });
    });
  })();

  //FIXTEST changed message 'property: \'description?\' is invalid in a response'=>
  //'Optional scalar properties are not allowed in resource types and their descendants: 'description?'
  it('should reject scalar optional description in a response', function (done) {
    raml.load([
      '#%RAML 0.8',
      'title: Title',
      'resourceTypes:',
      '  - failType:',
      '      get:',
      '        responses:',
      '          200:',
      '            description?: description'
    ].join('\n')).should.be.rejectedWith("Optional scalar properties are not allowed in resource types and their descendants: 'description?'").and.notify(done);
  });

  //FIXTEST changed message 'property: \'example?\' is invalid in a response'=>
  //'Optional scalar properties are not allowed in resource types and their descendants: 'description?'
  //added default media type
  //inserted 'body' tag between '200' and 'example?'
  it('should reject scalar optional example in a body', function (done) {
    raml.load([
      '#%RAML 0.8',
      'title: Title',
      'mediaType: application/json',
      'resourceTypes:',
      '  - failType:',
      '      get:',
      '        responses:',
      '          200:',
      '            body:',
      '              example?: example'
    ].join('\n')).should.be.rejectedWith("Optional scalar properties are not allowed in resource types and their descendants: 'example?'").and.notify(done);
  });

  //FIXTEST changed message 'property: \'schema?\' is invalid in a response'=>
  //'Optional scalar properties are not allowed in resource types and their descendants: 'description?'
  //added default media type
  //inserted 'body' tag between '200' and 'schema?'
  //inserted valid value for schema 'schema'
  it('should reject scalar optional schema in a body', function (done) {
    raml.load([
      '#%RAML 0.8',
      'title: Title',
      'mediaType: application/json',
      'schemas:',
      '  - schema: "{}"',
      'resourceTypes:',
      '  - failType:',
      '      get:',
      '        responses:',
      '          200:',
      '            body:',
      '              schema?: schema'
    ].join('\n')).should.be.rejectedWith("Optional scalar properties are not allowed in resource types and their descendants: 'schema?'").and.notify(done);
  });

  //TESTFIX changed error message : 'property: \'' + property[0] + '\' is invalid in a trait'=>
  //'Optional scalar properties are not allowed in traits and their descendants: ''+property[0]
  //setting valid value 'securedBy' propertiy
  //removed 'securedBy' from the list
  (function(){
    [
      ['displayName?',': displayName'],
      ['description?',': description'],
      ['usage?',': usage']
//      ['securedBy?',': securityScheme1']
    ].forEach(function(property){
      it('should reject scalar optional parameters in a trait', function (done) {
        raml.load([
          '#%RAML 0.8',
          'title: Title',
          'securitySchemes:',
          '  - securityScheme1:',
          '      type: Basic Authentication',
          'traits:',
          '  - failTrait:',
          '      ' + property[0] + property[1]
        ].join('\n')).should.be.rejectedWith("Optional scalar properties are not allowed in traits and their descendants: '"+property[0]+"'").and.notify(done);
      });
    });
  })();
});
