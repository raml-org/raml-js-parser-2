/* global RAML, describe, it */

'use strict';

if (typeof window === 'undefined') {
  var raml           = require('../../parsers/raml-parser-2');
  var chai           = require('chai');
  var chaiAsPromised = require('chai-as-promised');

  chai.should();
  chai.use(chaiAsPromised);
} else {
  var raml           = RAML.Parser;

  chai.should();
}

// TODO: write the appropiate asserts for this errors
describe('Errors', function () {
  it('should be at right line/column when new document content started without special marker right after end marker', function (done) {
    raml.load([
      '#%RAML 0.8',
      '---',
      'title: API 1',
      '...',
      'title: API 2'
    ].join('\n'), 'foo.raml').then(function () {}, function (error) {
      setTimeout(function () {
        error.message.should.exist;
        error.start.should.be.equal(28);
        error.end.should.be.equal(29);
        error.line.should.be.equal(4);
        error.column.should.be.equal(0);
        done();
      }, 0);
    });
  });

  it('should error with non-printable characters and render index correctly', function (done) {
    raml.load([
      '#%RAML 0.8',
      // Note: There is a non-readable character after the second quote mark.
      '*Note:* You may provide an optional *scope* parameter to request additional permissions outside of the "basic" permissions scope. [Learn more about scope](http://instagram.com/developer/authentication/#scop'
    ].join('\n')).then(function () {}, function (error) {
      setTimeout(function () {
        error.message.should.exist;
        error.start.should.be.equal(28);
        error.end.should.be.equal(29);
        error.line.should.be.equal(4);
        error.column.should.be.equal(0);
        done();
      }, 0);
    });
  });

  it('should render error messages with the correct index', function (done) {
    raml.load([
      '#%RAML 0.8',
      'title: {]'
    ].join('\n')).then(null, function (error) {
      setTimeout(function () {
        error.message.should.exist;
        error.start.should.be.equal(28);
        error.end.should.be.equal(29);
        error.line.should.be.equal(4);
        error.column.should.be.equal(0);
        done();
      }, 0);
    })
  })
});
