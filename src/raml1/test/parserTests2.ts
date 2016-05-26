/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")

//import fs = require("fs")
//import path = require("path")
//import _=require("underscore")
//
//import def = require("raml-definition-system")
//
//import ll=require("../lowLevelAST")
import yll=require("../jsyaml/jsyaml2lowLevel")

////import high = require("../highLevelImpl")
import hl=require("../highLevelAST")
//
//import t3 = require("../artifacts/raml10parser")
//
import util = require("./test-utils")
import tools = require("./testTools")
describe('API parsing', function() {
    it('Should parse title', function(){
        testErrors(util.data('parser/api/api01.raml'));
    });
    
    it('Should parse baseUri', function(){
        testErrors(util.data('parser/api/api02.raml'));
    });

    it('Should parse protocols', function(){
        testErrors(util.data('parser/api/api03.raml'));
    });

    it('Should parse baseUriParameters', function(){
        testErrors(util.data('parser/api/api04.raml'));
    });
    it('Should not allow using sequences in global map declarations', function(){
        testErrors(util.data('parser/api/api01-r.raml'),["resourceTypes should be a map in RAML 1.0"]);
    });
    it('Should parse mediaType', function(){
        testErrors(util.data('parser/api/api05.raml'));
    });

    it('Should fail without title', function(){
        testErrors(util.data('parser/api/api06.raml'),["Missing required property"]);
    });

    it('Should parse version', function(){
        testErrors(util.data('parser/api/api07.raml'));
    });

    it('Should fail if title is array', function(){
        testErrors(util.data('parser/api/api08.raml'),[ "property 'title' must be a string"]);
    });

    it('Should fail if title is map', function(){
        testErrors(util.data('parser/api/api09.raml'),["property 'title' must be a string"]);
    });

    it('Should succeed if title is longer than 48 chars', function(){
        testErrors(util.data('parser/api/api10.raml'));
    });

    it('Should allow number title', function(){
        testErrors(util.data('parser/api/api11.raml'));
    });

    it('Should fail if there is a root property with wrong displayName', function(){
        testErrors(util.data('parser/api/api12.raml'), ["Unknown node: \\w+"]);
    });

    it('Should fail if there is a root property with array', function(){
        testErrors(util.data('parser/api/api13.raml'),["Unknown node: \\[\\w+\\]"]);
    });

//  #2156.
   it('Should fail if include not found', function(){
       testErrors(util.data('parser/api/api14.raml'),["Can not resolve relative.md"]);
   });

//  #2030
   it('Should succeed when dealing with URI parameters with two types', function(){
       testErrors(util.data('parser/api/api15.raml'));
   });

    it('Should parse resource description', function(){
        testErrors(util.data('parser/api/api27.raml'));
    });

    it('Should parse resource description with markdown', function(){
        testErrors(util.data('parser/api/api28.raml'));
    });

    describe('URI', function(){
        it('Should fail when declaring a URI parameter not on the baseUri', function(){
            testErrors(util.data('parser/api/api16.raml'), ["Base uri parameter unused"]);
        });

        it('Should fail when declaring a property inside a URI parameter that is not valid', function(){
            testErrors(util.data('parser/api/api17.raml'), ["specifying unknown facet:wrongPropertyName"]);
        });

        it('Should fail when declaring an enum with duplicated values', function(){
            testErrors(util.data('parser/api/api18.raml'), ["enum facet can only contain unique items"]);
        });

        it('Should fail when declaring a URI parameter with an invalid type', function(){
            testErrors(util.data('parser/api/api19.raml'), ["inheriting from unknown type"]);
        });

        it('Should succeed when declaring a URI parameter with a string type', function(){
            testErrors(util.data('parser/api/api20.raml'));
        });

        it('Should succeed when declaring a URI parameter with a number type', function(){
            testErrors(util.data('parser/api/api21.raml'));
        });

        it('Should succeed when declaring a URI parameter with a integer type', function(){
            testErrors(util.data('parser/api/api22.raml'));
        });

        it('Should succeed when declaring a URI parameter with a date type', function(){
            testErrors(util.data('parser/api/api23.raml'));
        });

        it('Should succeed when declaring a URI parameter with a file type', function(){
            testErrors(util.data('parser/api/api24.raml'));
        });

        it('Should succeed when declaring a URI parameter with a boolean type', function(){
            testErrors(util.data('parser/api/api25.raml'));
        });

        it('Should fail if baseUri value its not really a URI', function(){
            testErrors(util.data('parser/api/api26.raml'), ["Unmatched '{'"]);
        });
    });
});

describe('Resource parsing', function() {
    it('Should parse simple resource with response body', function(){
        testErrors(util.data('parser/resource/res01.raml'));
    });

    it('Should parse simple resource with request body', function(){
        testErrors(util.data('parser/resource/res02.raml'));
    });

    it('Should parse resource with response body inherited from user defined type', function(){
        testErrors(util.data('parser/resource/res03.raml'));
    });

    it('Should parse simple resource with request body inherited from user defined type', function(){
        testErrors(util.data('parser/resource/res04.raml'));
    });

    it('Should parse simple resource with uri parameter', function(){
        testErrors(util.data('parser/resource/res05.raml'));
    });

    it('Should parse complex resource with nested resources with several uri parameters', function(){
        testErrors(util.data('parser/resource/res06.raml'));
    });

    it('Should parse resource with uri parameter inherited from user defined type', function(){
        testErrors(util.data('parser/resource/res07.raml'));
    });

    it('All parameters declared in uriParameters section should match with any of parameters specified in segment', function(){
        testErrors(util.data('parser/resource/res08.raml'), ["Uri parameter unused"]);
    });

    it('Should fail when declaring a URI parameter not on the resource URI', function(){
        testErrors(util.data('parser/resource/res13.raml'), ["Uri parameter unused"]);
    });

    it('New methods test 0.8.', function(){
        testErrors(util.data('parser/resource/res09.raml'));
    });

    // it('New methods test 1.0.', function(){
    //     testErrors(util.data('parser/resource/res10.raml'));
    // });

    it('Disabled body test 0.8.', function(){
        testErrors(util.data('parser/resource/res12.raml'), ["Request body is disabled for \"trace\" method"]);
    });

    // it('Disabled body test 1.0.', function(){
    //     testErrors(util.data('parser/resource/res11.raml'), ["Request body is disabled for \"trace\" method"]);
    // });
});

describe('Resource type', function(){
    it('Should parse simple resource type with request body', function(){
        testErrors(util.data('parser/resourceType/resType01.raml'));
    });

    it('Should parse simple resource type with response body', function(){
        testErrors(util.data('parser/resourceType/resType02.raml'));
    });

    it('Should parse resource type with response body inherited from user defined type', function(){
        testErrors(util.data('parser/resourceType/resType03.raml'));
    });

    it('Should parse resource type with request body inherited from user defined type', function(){
        testErrors(util.data('parser/resourceType/resType04.raml'));
    });

    it('Should parse resource type with uri parameters', function(){
        testErrors(util.data('parser/resourceType/resType05.raml'));
    });

    it('Should parse applying resource type with uri parameters', function(){
        testErrors(util.data('parser/resourceType/resType06.raml'));
    });

    it('Should parse resource inherited from simple resource type with request body', function(){
        testErrors(util.data('parser/resourceType/resType07.raml'));
    });

    it('Should parse resource inherited from simple resource type with response body', function(){
        testErrors(util.data('parser/resourceType/resType08.raml'));
    });

    it('Should parse resource inherited from resource type with response body inherited from user defined type', function(){
        testErrors(util.data('parser/resourceType/resType09.raml'));
    });

    it('Should parse resource inherited from resource type with request body inherited from user defined type', function(){
        testErrors(util.data('parser/resourceType/resType10.raml'));
    });

    it('Should parse schema item as parameter', function(){
        testErrors(util.data('parser/resourceType/resType17.raml'));
    });

    it('Should parse type item as parameter', function(){
        testErrors(util.data('parser/resourceType/resType18.raml'));
    });

// #1925
//    it('Should fail on parameter non exist value', function(){
//        testErrors(util.data('parser/resourceType/resType19.raml'));
//    });

    it('Should parse all resource types methods defined in the HTTP version 1.1 specification [RFC2616] and its extension, RFC5789 [RFC5789]', function(){
        testErrors(util.data('parser/resourceType/resType20.raml'));
    });

    it('Should parse resource type method with response body', function(){
        testErrors(util.data('parser/resourceType/resType15.raml'));
    });

    it('Should parse resource type method with request body.', function(){
        testErrors(util.data('parser/resourceType/resType16.raml'));
    });

    it('New methods test 0.8.', function(){
        testErrors(util.data('parser/resourceType/resType11.raml'));
    });

    // it('New methods test 1.0.', function(){
    //     testErrors(util.data('parser/resourceType/resType12.raml'));
    // });

    it('Disabled body test 0.8.', function(){
        testErrors(util.data('parser/resourceType/resType13.raml'), ["Request body is disabled for \"trace\" method"]);
    });

    // it('Disabled body test 1.0.', function(){
    //     testErrors(util.data('parser/resourceType/resType14.raml'), ["Request body is disabled for \"trace\" method"]);
    // });
});

describe('Method', function(){
    it('Should parse simple method with response body', function(){
        testErrors(util.data('parser/method/meth01.raml'));
    });

    it('Should parse simple method with request body', function(){
        testErrors(util.data('parser/method/meth02.raml'));
    });

    it('Only reserved method names are applicable', function(){
        testErrors(util.data('parser/method/meth03.raml'), ["Unknown node: set"]);
    });

    it('Should parse header and check that it validates correctly', function(){
        testErrors(util.data('parser/method/meth04.raml'));
    });

    it('Should validates query parameters correctly', function(){
        testErrors(util.data('parser/method/meth05.raml'));
    });

    it('Should allows to set single protocol value and validate it', function(){
        testErrors(util.data('parser/method/meth06.raml'));
    });

    it('Should allows to set array protocol value and validate it 2', function(){
        testErrors(util.data('parser/method/meth07.raml'));
    });

    it('Should check that allowed only \'HTTP\' and \'HTTPS\' values', function(){
        testErrors(util.data('parser/method/meth08.raml'), ["Invalid value:\\w+ allowed values are:HTTP,HTTPS","Invalid value:\\w+ allowed values are:HTTP,HTTPS"]);
    });

    it('Should parse body mimeType', function(){
        testErrors(util.data('parser/method/meth09.raml'));
    });

    it('Check that only reserved mimeTypes are applicable', function(){
        testErrors(util.data('parser/method/meth10.raml'), ["Unknown media type '\\w+'"]);
    });

    it('Should parse pair \'mimeType:type\'.', function(){
        testErrors(util.data('parser/method/meth11.raml'));
    });

    it('Should parse a body with \'mimeType\' and keywords \'type\', \'schema\', \'properties\', \'example\'', function(){
        testErrors(util.data('parser/method/meth12.raml'));
    });
});

describe('Trait', function(){
    it('Should parse trait with header and validate it', function(){
        testErrors(util.data('parser/trait/trait01.raml'));
    });

    it('Should parse trait with query parameter and validate it', function(){
        testErrors(util.data('parser/trait/trait02.raml'));
    });

    it('Should parse trait with body', function(){
        testErrors(util.data('parser/trait/trait03.raml'));
    });

    it('Should parse traits with parameters', function(){
        testErrors(util.data('parser/trait/trait04.raml'));
    });
});

describe('Method response', function(){
    it('Should parse  response code', function(){
        testErrors(util.data('parser/methodResponse/methResp01.raml'));
    });

    it('Should parse response body mimeType', function(){
        testErrors(util.data('parser/methodResponse/methResp02.raml'));
    });

    it('Only reserved reserved mimeTypes are applicable', function(){
        testErrors(util.data('parser/methodResponse/methResp03.raml'), ["Unknown media type '\\w+'"]);
    });

    it('Should allows to set response body with pair \'mimeType:type\'', function(){
        testErrors(util.data('parser/methodResponse/methResp04.raml'));
    });

    it('Should allows to set response body with \'mimeType\' and keywords \'type\', \'schema\', \'properties\', \'example\'', function(){
        testErrors(util.data('parser/methodResponse/methResp05.raml'));
    });

    it('Should allows to set response body with JSON schema', function(){
        testErrors(util.data('parser/methodResponse/methResp06.raml'));
    });
});

describe('Security scheme declaration', function(){
    it('Should parse security scheme type', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme01.raml'));
    });

    it('Should parse security scheme description', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme02.raml'));
    });

    it('Should parse security scheme describedBy', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme03.raml'));
    });

    it('Should parse security scheme settings', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme04.raml'));
    });
});

describe('Security Scheme types', function(){
    it('Should parse OAuth 1.0 security scheme type', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme05.raml'));
    });

    it('Should parse OAuth 1.0 security scheme type settings', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme06.raml'));
    });

    it('Should parse OAuth 2.0 security scheme type', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme07.raml'));
    });

    it('Should parse OAuth 2.0 security scheme type settings', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme08.raml'));
    });

    it('Should parse BasicSecurityScheme security scheme type', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme09.raml'));
    });

    //it('Should parse DigestSecurityScheme security scheme type', function(){
    //    testErrors(util.data('parser/securitySchemes/qa/securityScheme10.raml'));
    //});

    it('Should parse Pass Through security scheme type', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme11.raml'));
    });

    it('Should parse x- security scheme type', function(){
        testErrors(util.data('parser/securitySchemes/qa/securityScheme12.raml'));
    });
});

describe('Type', function(){
    it('Should parse type inherited from object declaration', function(){
        testErrors(util.data('parser/type/t01.raml'));
    });

    it('Should parse type inherited from object shortcut declaration', function(){
        testErrors(util.data('parser/type/t02.raml'));
    });

    it('Should parse scalar type inherited from built-in type declaration', function(){
        testErrors(util.data('parser/type/t03.raml'));
    });

    it('Should parse string type declaration', function(){
        testErrors(util.data('parser/type/t04.raml'));
    });

    it('Should parse number type declaration', function(){
        testErrors(util.data('parser/type/t05.raml'));
    });

    it('Should parse integer type declaration', function(){
        testErrors(util.data('parser/type/t06.raml'));
    });

    it('Should parse boolean type declaration', function(){
        testErrors(util.data('parser/type/t07.raml'));
    });

    it('Should parse array of scalar types declaration', function(){
        testErrors(util.data('parser/type/t08.raml'));
    });

    it('Should parse array of complex types declaration', function(){
        testErrors(util.data('parser/type/t09.raml'));
    });

    it('Should validate enum values type', function(){
        testErrors(util.data('parser/type/t10.raml'), ["integer is expected"]);
    });

    it('Should parse union type declaration', function(){
        testErrors(util.data('parser/type/t11.raml'));
    });

    it('Should parse union type shortcut declaration', function(){
        testErrors(util.data('parser/type/t12.raml'));
    });

    it('No properties allowed inside union types declaration', function(){
        testErrors(util.data('parser/type/t13.raml'));
    });

    // #1847
    //it('Should not allows to repeat using same type several times inside union declaration', function(){
    //    testErrors(util.data('parser/type/t14.raml'), 1);
    //});

    // #1851
    //it('Should not allow to specify current type or type that extends current while declaring union', function(){
    //    testErrors(util.data('parser/type/t15.raml'), 1);
    //});

    it('Should parse scalar type inherited from user defined type declaration', function(){
        testErrors(util.data('parser/type/t16.raml'));
    });

    it('Should parse scalar type inherited from user defined type shortcut declaration', function(){
        testErrors(util.data('parser/type/t17.raml'));
    });

    it('Parser should not allow additional properties after shortcut inheritance', function(){
        testErrors(util.data('parser/type/t18.raml'),["bad indentation of a mapping entry", "inheriting from unknown type"]);
    });

    it('Should parse type inherited from user defined type declaration', function(){
        testErrors(util.data('parser/type/t19.raml'));
    });

    it('Should parse type inherited from several user defined types declaration', function(){
        testErrors(util.data('parser/type/t20.raml'));
    });

// #2061
//    it('Should parse type inherited from several user defined types shortcut declaration', function(){
//        testErrors(util.data('parser/type/t21.raml'));
//    });

// #2157
//    it('Inheritance should works in the types and in the mimeTypes', function(){
//        testErrors(util.data('parser/type/t22.raml'));
//    });

// #2061
//    it('No additional properties allowed after shortcut inheritance', function(){
//        testErrors(util.data('parser/type/t23.raml'), 1);
//    });

// Looks like wrong test
//    it('Should not allow to specify type that contains property of current type or of type that extends current while property declaration', function(){
//        testErrors(util.data('parser/type/t24.raml'), 1);
//    });

// #1859
//    it('Should not allow to specify current type or type that extends current while declaring property of current type', function(){
//        testErrors(util.data('parser/type/t25.raml'), 1);
//    });

// #2082 #1983
//    it('Should validate enum values by property type', function(){
//        testErrors(util.data('parser/type/t26.raml'), 1);
//    });

// #1983
//    it('Should validate example fields by facets', function(){
//        testErrors(util.data('parser/type/t27.raml'), 1);
//    });
});

describe('Annotations', function() {
    it('Should validate annotation parameters and scope', function () {
        testErrors(util.data('parser/annotations/a20.raml'));
    });
});

describe('Scalar types', function(){
    it('Should parse string type declaration',function(){
        testErrors(util.data('parser/scalarTypes/sType01.raml'));
    });

    it('Should parse number type declaration',function(){
        testErrorsByNumber(util.data('parser/scalarTypes/sType02.raml'),1);
    });

    it('Should parse integer type declaration',function(){
        testErrors(util.data('parser/scalarTypes/sType03.raml'));
    });

    it('Should parse boolean type declaration',function(){
        testErrors(util.data('parser/scalarTypes/sType04.raml'));
    });

    it('Should parse date type declaration:',function(){
        testErrors(util.data('parser/scalarTypes/sType05.raml'));
    });

    it('Should parse file type declaration',function(){
        testErrors(util.data('parser/scalarTypes/sType06.raml'));
    });
});

describe('Object types', function(){
    it('Should parse object properties',function(){
        testErrors(util.data('parser/objectTypes/oType01.raml'));
    });

    it('Should parse minimum number of properties',function(){
        testErrors(util.data('parser/objectTypes/oType02.raml'),["object should have not less then 2 properties"]);
    });

    it('Should parse maximum number of properties',function(){
        testErrors(util.data('parser/objectTypes/oType03.raml'), ["object should have not more then 4 properties"]);
    });

    it('Should parse property required option',function(){
        testErrors(util.data('parser/objectTypes/oType04.raml'),["Required property: comment_id is missed"]);
    });

    it('Should parse property repeat option',function(){
        testErrors(util.data('parser/objectTypes/oType05.raml'));
    });

    it('Should parse property default option',function(){
        testErrors(util.data('parser/objectTypes/oType06.raml'));
    });

    it('Should parse object types that inherit from other object types',function(){
        testErrors(util.data('parser/objectTypes/oType07.raml'));
    });

    it('Should parse object inherit from more than one type',function(){
        testErrors(util.data('parser/objectTypes/oType08.raml'));
    });

    it('Should parse shortcut scalar type property declaration',function(){
        testErrors(util.data('parser/objectTypes/oType09.raml'));
    });

    it('Should parse maps type declaration',function(){
        testErrors(util.data('parser/objectTypes/oType10.raml'));
    });

    it('Should parse restricting the set of valid keys by specifying a regular expression',function(){
        testErrors(util.data('parser/objectTypes/oType11.raml'));
    });

    it('Should parse alternatively use additionalProperties',function(){
        testErrors(util.data('parser/objectTypes/oType12.raml'));
    });

    it('Should parse alternatively use patternProperties',function(){
        testErrors(util.data('parser/objectTypes/oType13.raml'));
    });

    it('Should parse inline type expression gets expanded to a proper type declaration',function(){
        testErrors(util.data('parser/objectTypes/oType14.raml'));
    });

    it('Should parse string is default type when nothing else defined',function(){
        testErrors(util.data('parser/objectTypes/oType15.raml'));
    });

    it('Should parse object is default type when properties is defined',function(){
        testErrors(util.data('parser/objectTypes/oType16.raml'));
    });

    it('Should parse shorthand for optional property syntax ',function(){
        testErrors(util.data('parser/objectTypes/oType17.raml'));
    });

// #2135
//    it('Should parse inline map',function(){
//        testErrors(util.data('parser/objectTypes/oType18.raml'));
//    });

});

describe('Array types', function(){
    it('Should parse array of scalar types declaration',function(){
        testErrors(util.data('parser/arrayTypes/aType01.raml'));
    });

    it('Should parse array of complex types declaration',function(){
        testErrors(util.data('parser/arrayTypes/aType02.raml'));
    });
});

describe('Union types', function(){
    it('Should parse union type declaration',function(){
        testErrors(util.data('parser/unionTypes/uType01.raml'));
    });

    it('Should parse union type shortcut declaration',function(){
        testErrors(util.data('parser/unionTypes/uType02.raml'));
    })
});

describe('Object type Inheritance', function(){
    it('Should parse type inherited from user defined type declaration',function(){
        testErrors(util.data('parser/objectTypeInheritance/oti01.raml'));
    });

    it('Should parse type inherited from several user defined types declaration',function(){
        testErrors(util.data('parser/objectTypeInheritance/oti02.raml'));
    });

// #2061
   it('Should parse type inherited from several user defined types shortcut declaration',function(){
       testErrors(util.data('parser/objectTypeInheritance/oti03.raml'));
   });

// #2157
   it('Should parse inheritance which should works in the types and in the mimeTypes',function(){
       testErrors(util.data('parser/objectTypeInheritance/oti04.raml'),["Required property: baseField is missed"]);
   });

// #2061
//    it('Should check that no additional properties allowed after shortcut inheritance',function(){
//        testErrors(util.data('parser/objectTypeInheritance/oti05.raml'),1);
//    });

    it('Should check that no scalar types allowed inside multiple inheritance declaration ',function(){
        testErrorsByNumber(util.data('parser/objectTypeInheritance/oti06.raml'),2);
    });

    it('Should check that does not allowed to specify current type or type that extends current while declaring property of current type',function(){
        testErrorsByNumber(util.data('parser/objectTypeInheritance/oti07.raml'),2);
    });
});

describe('External Types', function(){
    it('Should parse included json schema',function(){
        testErrors(util.data('parser/externalTypes/eType01.raml'));
    });

    it('Should parse included xsd schema',function(){
        testErrors(util.data('parser/externalTypes/eType02.raml'));
    });

    it('Should parse only xsd/json schemas',function(){
        testErrors(util.data('parser/externalTypes/eType03.raml'), ["inheriting from unknown type"]);
    });

    //TODO I do not like this test. Meaningless testing of how exactly we fail with completely invalid YAML syntax. @Denis.
    // it('Inheritance from external types is not allowed',function(){
    //     testErrors(util.data('parser/externalTypes/eType04.raml'), ["Unknown node: properties","You can not inherit both from types of different kind"]);
    // });

    it('Should validate json schemas',function(){
        testErrors(util.data('parser/externalTypes/eType05.raml'),["It is not JSON schema(can not parse JSON:Unexpected token p)"]);
    });

//  #400
//    it('Should validate xsd schemas',function(){
//        testErrors(util.data('parser/externalTypes/eType60.raml'), 2);
//    });

});

describe('Type expressions', function(){
    it('Should parse simplest type expression',function(){
        testErrors(util.data('parser/type/typeExpressions/te01.raml'));
    });

    it('Should parse an array of objects',function(){
        testErrors(util.data('parser/type/typeExpressions/te02.raml'));
    });

    it('Should parse an array of scalars types',function(){
        testErrors(util.data('parser/type/typeExpressions/te03.raml'));
    });

    it('Should parse a bidimensional array of scalars types',function(){
        testErrors(util.data('parser/type/typeExpressions/te04.raml'));
    });

    it('Should parse union type made of members of string OR object',function(){
        testErrors(util.data('parser/type/typeExpressions/te05.raml'));
    });

    it('Should parse an array of the above type',function(){
        testErrors(util.data('parser/type/typeExpressions/te06.raml'));
    });

    it('Should parse type expression with expected type',function(){
        testErrors(util.data('parser/type/typeExpressions/te07.raml'));
    });

    it('Should parse type extended from type expression',function(){
        testErrors(util.data('parser/type/typeExpressions/te08.raml'));
    });
});

describe('Modularization', function(){
    it('Should parse library and allows to use library items.',function(){
        testErrors(util.data('parser/modularization/m01.raml'));
    });

    it('Should parse overlay',function(){
        testErrors(util.data('parser/modularization/m02_overlay.raml'));
    });
});

describe("Individual errors",function(){
    it('Individial nodes should pass validation',function() {
        var api = util.loadApi(util.data('parser/modularization/m02_overlay.raml'));
        api.children().forEach(x=>{
            if (x.errors().length>0){
                assert.equal(true,false);
            }
        })
    })
})


describe('Object values for template parameters tests', function () {
    it("Parameter used in key must have scalar value", function () {
        this.timeout(15000);
        testErrors(util.data("parser/resourceType/resType21.raml"), ["property 'param' must be a string"]);
    })

    it("Parameter used inside string value must have scalar value", function () {
        this.timeout(15000);
        testErrors(util.data("parser/resourceType/resType22.raml"), ["property 'param' must be a string"]);
    })
});

function escapeRegexp(regexp: string) {
    return regexp.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function testErrors(p:string, expectedErrors=[]){
    var api=util.loadApi(p);
    api = util.expandHighIfNeeded(api);

    var errors:any=util.validateNode(api);
    var testErrors;
    var hasUnexpectedErr = false;
    if(expectedErrors.length>0){
        testErrors = validateErrors(errors, expectedErrors);
        hasUnexpectedErr = testErrors.unexpected.length > 0 || testErrors.lostExpected.length > 0;
    }

    var condition:boolean = false;
    condition = errors.length == expectedErrors.length;
    if(!condition) {
        if (errors.length > 0) {
            errors.forEach(error=>{
                if (typeof error.message == 'string') {
                    console.error(error.message);
                } else {
                    console.error(error);
                }
                console.error("\n");
            })
        }
    }

    var errorMsg = '';
    if (hasUnexpectedErr){
        if (testErrors.unexpected.length > 0) {
            errorMsg += "\nUnexpected errors: \n\n";
            testErrors.unexpected.forEach(unexpectedError=> {
                errorMsg += unexpectedError + "\n\n";
            });
        }
        if (testErrors.lostExpected.length > 0){
            errorMsg += "\nDisappeared expected errors: \n\n"
            testErrors.lostExpected.forEach(lostExpected=>{
                errorMsg += lostExpected + "\n\n";
            });
        }
    }

    if (hasUnexpectedErr || errors.length != expectedErrors.length) {
        console.log("Expected errors:");
        expectedErrors.forEach(expectedError=>console.log(expectedError));

        console.log("Actual errors:");
        errors.forEach(error=>console.log(error.message));
    }
    assert.equal(hasUnexpectedErr, false, "Unexpected errors found\n"+errorMsg);
    assert.equal(errors.length, expectedErrors.length, "Wrong number of errors\n"+errorMsg);
}
function testIds(p:string){
    var api=util.loadApi(p);
    testId(api);
}
function testId(n:hl.IParseResult){
    //console.log(n.id());
    if (n!=n.root()) {
        var nnn = n.root().findById(n.id());
        assert.equal(nnn != null, true)
    }
    var children = n.children();
    var l = tools.getLength(children);
    for(var i = 0 ; i < l ; i++){
        var item = tools.collectionItem(children,i);
        testId(item);
    }
}
function validateErrors(realErrors:any, expectedErrors:string[]){
    var errors = {'unexpected': [], 'lostExpected': []};
    if (realErrors.length > 0){
        realErrors.forEach(error=>{
            var realError: string;
            if (typeof error.message == 'string'){
                realError = error.message;
            }else{
                realError = error;
            }
            var isExpectedError:boolean = false;
            expectedErrors.forEach(expectedError=>{
                var index = realError.search(new RegExp(expectedError, "mi"));
                if (index>-1) {
                    isExpectedError = true;
                } else {
                    index = realError.search(new RegExp(escapeRegexp(expectedError), "mi"));
                    if (index>-1) isExpectedError = true;
                }
            });
            if (!isExpectedError)
                errors.unexpected.push(realError);
        });

        expectedErrors.forEach(expectedError=>{
            var isLostError = true;
            realErrors.forEach(error=>{
                var realError: string;
                if (typeof error.message == 'string'){
                    realError = error.message;
                }else{
                    realError = error;
                }
                var index = realError.search(new RegExp(expectedError, "i"))
                if (index > -1) {
                    isLostError = false;
                } else {
                    index = realError.search(new RegExp(escapeRegexp(expectedError), "i"));
                    if (index > -1) isLostError = false;
                }
            });
            if (isLostError)
                errors.lostExpected.push(expectedError);
        });
    }
    return errors;
}

function testErrorsByNumber(p:string,count:number=0,deviations:number=0){
    var api=util.loadApi(p);
    var errors:any=util.validateNode(api);

    var condition:boolean = false;
    if(deviations==0){
        condition = errors.length == count;
    }
    else if(deviations>0){
        condition = errors.length >= count;
    }
    else{
        condition = errors.length <= count;
    }
    if(!condition) {
        if (errors.length > 0) {
            errors.forEach(error=>{
                if (typeof error.message == 'string') {
                    console.error(error.message);
                } else {
                    console.error(error);
                }
                console.error("\n");
            })

        } else {
            //console.log(errors)
        }
    }
    if(deviations==0) {
        assert.equal(errors.length, count);
    }
    else if(deviations>0){
        assert.equal(errors.length>=count, true);
    }
    else{
        assert.equal(errors.length<=count, true);
    }
}