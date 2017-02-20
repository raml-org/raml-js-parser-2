/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")

//import fs = require("fs")
//import path = require("path")
//import _=require("underscore")
//
//import def = require("raml-definition-system")
//
import ll=require("../lowLevelAST")
import linter=require("../ast.core/linter")

import yll=require("../jsyaml/jsyaml2lowLevel")

////import high = require("../highLevelImpl")
import hl=require("../highLevelAST")
//
//import t3 = require("../artifacts/raml10parser")
//
import util = require("./test-utils")
import tools = require("./testTools")

//describe('Low level model', function() {
describe('Parser integration tests',function(){

    it ("Instagram",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/Instagram/api.raml"),["Example does not conform to schema: Content is not valid according to schema: Expected type \\w+ but found type null \\w+,null", "Example does not conform to schema: Content is not valid according to schema: Expected type \\w+ but found type null \\w+,null", "Example does not conform to schema: Content is not valid according to schema: Expected type \\w+ but found type null \\w+,null, Expected type \\w+ but found type null \\w+,null"]);
    });
    it ("Omni",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/omni/api.raml"));
    });
    it ("Omni 0.8",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/omni08/api.raml"));
    });

    it ("Cosmetics Overlay",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/cosmetics/hypermedia.raml"));
    });
    it ("Cosmetics Extension",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/cosmetics/hypermedia1.raml"));
    });
    it ("Instagram 1.0",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/Instagram1.0/api.raml"));
    });
    it ("Exchange",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/exchange/api.raml"));
    });
    it ("core services",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/core-services/api.raml"),["Can not parse JSON: Unexpected token {", "Can not parse JSON: Unexpected token \\w+", "Can not parse JSON: Unexpected token \\w+"]);
    });
    it ("cloudhub new logging",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/cloudhub-new-logging/api.raml"),["Can not parse JSON: Unexpected token }"]);
    });
    it ("audit logging",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/audit-logging-query/api.raml"));
    });
    it ("application monitoring",function(){
        this.timeout(15000)
        testErrors(util.data("../example-ramls/application-monitoring/api.raml"),["Unrecognized schema: 'appmonitor-rule.schema'", "Example does not conform to schema: Content is not valid according to schema: Reference has not been resolved during compilation: appmonitor-rule appmonitor-rule", "Unrecognized schema: 'appmonitor-rule.schema'", "Example does not conform to schema: Content is not valid according to schema: Reference has not been resolved during compilation: appmonitor-action appmonitor-action", "Example does not conform to schema: Content is not valid according to schema: Reference has not been resolved during compilation: appmonitor-action appmonitor-action", "Unrecognized schema: 'appmonitor'"]);
    });
    //it ("api platform",function(){
    //    testErrors(util.data("../../../../example-ramls/api-platform/api.raml"));
    //});
    it ("lib1",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/blog-users1/blog-users.raml"));
    });
    it ("lib2",function(){
        this.timeout(15000);
        testErrorsByNumber(util.data("../example-ramls/blog-users2/blog-users.raml"),2,1);
    });
    it ("lib3",function(){
        this.timeout(15000);
        testErrorsByNumber(util.data("../example-ramls/blog-users2/blog-users.raml"),2,1);
    });
    it ("platform2",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/platform2/api.raml"),[],true);

    });
});

describe('https connection tests',function(){
    it ("https 0.8",function(){
        this.timeout(15000);
        testErrors(util.data("parser/https/tr1.raml"));
    });

    it ("https 1.0",function(){
        this.timeout(15000);
        testErrors(util.data("parser/https/tr2.raml"));
    });
});

describe('Id tests',function(){
    it ("Instagram",function(){
        this.timeout(15000);
        testIds(util.data("../example-ramls/Instagram/api.raml"));
    });

});

describe('Transformers tests',function(){
    it ("All transformer from spec should be valid.",function(){
        testErrors(util.data("parser/transformers/t1.raml"), ["Unknown function applied to parameter: \'!\\w+\'"]);
    });
});

describe('Security Schemes tests', function () {
    it ("should fail if not all required settings specified" ,function(){
        testErrors(util.data("parser/securitySchemes/ss1/securityScheme.raml"), ["Missing required property \'\\w+\'"]);
    })
    it ("should pass when extra non-required settings specified" ,function(){
        testErrors(util.data("parser/securitySchemes/ss2/securityScheme.raml"));
    })

    it ("should pass when settings contains array property(0.8)" ,function(){
        testErrors(util.data("parser/securitySchemes/ss3/securityScheme.raml"));
    })
    it ("should fail when settings contains duplicate required properties(0.8)" ,function(){
        testErrors(util.data("parser/securitySchemes/ss4/securityScheme.raml"),["property already used: 'accessTokenUri'", "property already used: 'accessTokenUri'"]);
    })
    it ("should fail when settings contains duplicate required array properties(0.8)" ,function(){
        testErrors(util.data("parser/securitySchemes/ss5/securityScheme.raml"), ["property already used: 'authorizationGrants'", "property already used: 'authorizationGrants'", "property already used: 'authorizationGrants'"]);
    })
    it ("should fail when settings contains duplicate non-required properties(0.8)" ,function(){
        testErrors(util.data("parser/securitySchemes/ss6/securityScheme.raml"), ["property already used: 'aaa'", "property already used: 'aaa'"]);
    })

    it ("should pass when settings contains required array property(1.0)" ,function(){
        testErrors(util.data("parser/securitySchemes/ss7/securityScheme.raml"));
    })
    it ("should fail when settings contains duplicate required properties(1.0)" ,function(){
        testErrors(util.data("parser/securitySchemes/ss8/securityScheme.raml"), ["property already used: 'accessTokenUri'", "property already used: 'accessTokenUri'"]);
    })
    it ("should fail when settings contains duplicate required array properties(1.0)" ,function(){
        testErrors(util.data("parser/securitySchemes/ss9/securityScheme.raml"), ["property already used: 'authorizationGrants'",  "property already used: 'authorizationGrants'"]);
    })
    it ("null-value security schema should be allowed for Api(0.8)" ,function(){
        testErrors(util.data("parser/securitySchemes/ss10/securityScheme.raml"));
    })
    it ("grant type validation" ,function(){
        testErrors(util.data("parser/custom/oath2.raml"),["'authorizationGrants' value should be one of 'authorization_code', 'implicit', 'password', 'client_credentials' or to be an abolute URI"]);
    })
    it ("security scheme should be a seq in 0.8" ,function(){
        testErrorsByNumber(util.data("parser/custom/shemeShouldBeASeq.raml"),1);
    })
});
describe('Parser regression tests', function () {
    it ("basic type expression cases should pass validation" ,function(){
        testErrors(util.data("parser/typexpressions/basic.raml"));
    })
    it ("inplace types" ,function(){
        testErrors(util.data("parser/typexpressions/inplace.raml"));
    })
    it ("template vars0" ,function(){
        testErrors(util.data("parser/templates/unknown.raml"));
    })
    //it ("multi dimension and signatures" ,function(){
    //    testErrors(util.data("parser/typexpressions/multiDimAndSig.raml"));
    //})
    it ("example validation" ,function(){
        testErrors(util.data("parser/examples/ex1.raml"), ["Can not parse JSON example: Unexpected token d"]);
    })
    it ("example validation json against schema" ,function(){
        testErrors(util.data("parser/examples/ex2.raml"), ["Content is not valid according to schema"]);
    })
    it ("example validation yaml against schema" ,function(){
        testErrors(util.data("parser/examples/ex3.raml"), ["Example does not conform to schema: Content is not valid according to schema: Additional properties not allowed: \\w+ \\w+"]);
    })
    it ("example validation yaml against basic type" ,function(){
        testErrors(util.data("parser/examples/ex4.raml"),["Required property 'c' is missing"]);
    })
    it ("example validation yaml against inherited type" ,function(){
        testErrors(util.data("parser/examples/ex5.raml"), ["Required property 'c' is missing"]);
    })
    it ("example validation yaml against array" ,function(){
        testErrors(util.data("parser/examples/ex6.raml"),["Required property 'c' is missing"]);
    })
    it ("example in model" ,function(){
        testErrors(util.data("parser/examples/ex7.raml"), ["string is expected","string is expected","Required property 'c' is missing"]);
    })
    it ("another kind of examples" ,function(){
        testErrors(util.data("parser/examples/ex13.raml"), ["boolean is expected"]);
    })
    it ("example in parameter" ,function(){
        testErrors(util.data("parser/examples/ex8.raml"), ["boolean is expected"]);
    })

    it('Should correctly serialize multiple examples to JSON',function(){
        var api=util.loadApi(util.data('parser/examples/ex45.raml'));
        api = util.expandHighIfNeeded(api);

        var topLevelApi : any = api.wrapperNode();

        var json = topLevelApi.toJSON();
        var serializedJSON = JSON.stringify(json);

        assert.equal(serializedJSON.indexOf("One") > 0, true)
        assert.equal(serializedJSON.indexOf("Two") > 0, true)
    })

    it ("checking that node is actually primitive" ,function(){
        testErrors(util.data("parser/examples/ex9.raml"), ["string is expected"]);
    })
    it ("map" ,function(){
        testErrors(util.data("parser/examples/ex10.raml"));
    })
    it ("map1" ,function(){
        testErrors(util.data("parser/examples/ex11.raml"), ["number is expected"]);
    })
    it ("map2" ,function(){
        testErrors(util.data("parser/examples/ex12.raml"),["number is expected"]);
    })
    it ("objects are closed" ,function(){
        testErrors(util.data("parser/examples/ex14.raml"), ["Unknown property: 'z'"]);
    })
    it ("enums restriction" ,function(){
        testErrors(util.data("parser/examples/ex15.raml"),["value should be one of: 'val1', 'val2', '3'"]);
    })
    it ("array facets" ,function(){
        testErrors(util.data("parser/examples/ex16.raml"), ["'Person.items.minItems=5' i.e. array items count should not be less than 5", "'Person.items2.maxItems=3' i.e. array items count should not be more than 3", "items should be unique"]);
    })
    it ("array facets2" ,function(){
        testErrors(util.data("parser/examples/ex17.raml"));
    })
    it ("array facets3" ,function(){
        testErrors(util.data("parser/examples/ex18.raml"), ["'SmallArray.minItems=5' i.e. array items count should not be less than 5"]);
    })
    it ("array facets4" ,function(){
        testErrors(util.data("parser/examples/ex19.raml"),["'SmallArray.minItems=5' i.e. array items count should not be less than 5"]);
    })
    it ("object facets1" ,function(){
        testErrors(util.data("parser/examples/ex20.raml"), ["'MyType.minProperties=2' i.e. object properties count should not be less than 2"]);
    })
    it ("object facets2" ,function(){
        testErrors(util.data("parser/examples/ex21.raml"), ["'MyType1.minProperties=2' i.e. object properties count should not be less than 2"]);
    })
    it ("object facets3" ,function(){
        testErrors(util.data("parser/examples/ex22.raml"), ["'MyType1.maxProperties=1' i.e. object properties count should not be more than 1"]);
    })
    it ("object facets4" ,function(){
        testErrors(util.data("parser/examples/ex23.raml"));
    })
    it ("object facets5" ,function(){
        testErrors(util.data("parser/examples/ex24.raml"), ["'MyType1.minProperties=3' i.e. object properties count should not be less than 3"]);
    })
    it ("string facets1" ,function(){
        testErrors(util.data("parser/examples/ex25.raml"), ["'MyType1.minLength=5' i.e. string length should not be less than 5", "'MyType2.maxLength=3' i.e. string length should not be more than 3"]);
    })
    it ("string facets2" ,function(){
        testErrors(util.data("parser/examples/ex26.raml"));
    })
    it ("string facets3" ,function(){
        testErrors(util.data("parser/examples/ex27.raml"), ["'MyType1.minLength=5' i.e. string length should not be less than 5"]);
    })
    it ("string facets4" ,function(){
        testErrors(util.data("parser/examples/ex28.raml"), ["string should match to '\\.5'"]);
    })
    it ("number facets1" ,function(){
        testErrors(util.data("parser/examples/ex29.raml"),["'MyType1.minimum=5' i.e. value should not be less than 5", "'MyType1.minimum=5' i.e. value should not be less than 5"]);
    })

    it ("number facets2" ,function(){
        testErrors(util.data("parser/examples/ex30.raml"));
    })
    it ("self rec types" ,function(){
        testErrors(util.data("parser/examples/ex31.raml"));
    })
    it ("media type" ,function(){
        testErrors(util.data("parser/examples/ex32.raml"),["Can not parse JSON example: Unexpected token p"]);
    })
    it ("number 0" ,function(){
        testErrors(util.data("parser/examples/ex33.raml"));
    })
    it ("example inside of inplace type" ,function(){
        testErrors(util.data("parser/examples/ex34.raml"), ["Required property 'x' is missing","Unknown property: 'x2'"]);
    })
    it ("aws example" ,function(){
        testErrors(util.data("parser/examples/ex35.raml"));
    })
    it ("multi unions" ,function(){
        testErrors(util.data("parser/examples/ex36.raml"));
    })
    it ("seq and normal mix" ,function(){
        testErrors(util.data("parser/custom/seqMix.raml"));
    })
    it ("scalars in examples are parsed correctly" ,function(){
        testErrors(util.data("parser/examples/ex42.raml"));
    })
    it ("low level transform understands anchors" ,function(){
        testErrors(util.data("parser/examples/ex43.raml"));
    })
    it ("0.8 style of absolute path resolving" ,function(){
        testErrors(util.data("parser/custom/res08.raml"));
    })
    it ("example is string 0.8" ,function(){
        testErrors(util.data("parser/examples/ex44.raml"),["'example' value should be a string"]);
    })
    it ("enums values restriction" ,function(){
        testErrors(util.data("parser/examples/ex37.raml"));
    })
    it ("anonymous type examples validation test 1" ,function(){
        testErrors(util.data("parser/examples/ex38.raml"));
    })
    
    it ("anonymous type examples validation test 2" ,function(){
        testErrors(util.data("parser/examples/ex39.raml"));
    })
    it ("example's property validation" ,function(){
        testErrorsByNumber(util.data("parser/examples/ex40.raml"),1);
    })
    it ("example's union type property validation" ,function(){
        testErrorsByNumber(util.data("parser/examples/ex41.raml"),0);
    })
    it ("union type in schema" ,function(){
        testErrors(util.data("parser/typexpressions/unions/api.raml"));
    })
    it ("uri parameters1" ,function(){
        testErrors(util.data("parser/uris/u1.raml"), ["Base uri parameter unused"]);
    })
    it ("uri parameters2" ,function(){
        testErrors(util.data("parser/uris/u2.raml"), ["Uri parameter unused"]);
    })
    it ("uri parameters3" ,function(){
        testErrors(util.data("parser/uris/u3.raml"), ["Unmatched '{'"]);
    })
    it ("uri parameters4" ,function(){
        testErrors(util.data("parser/uris/u4.raml"), ["Unmatched '{'"]);
    })
    // No more signatures support
    //it ("basic signatures" ,function(){
    //    testErrors(util.data("parser/signatures/basic.raml"), ["aoeu"]);
    //})
    //it ("basic signatures2" ,function(){
    //    testErrors(util.data("parser/signatures/basic2.raml"), ["aoeu"]);
    //})
    //it ("ok signature" ,function(){
    //    testErrors(util.data("parser/signatures/ok.raml"));
    //})
    //it ("ok signature2" ,function(){
    //    testErrors(util.data("parser/signatures/ok2.raml"));
    //})
    //it ("ok signature3" ,function(){
    //    testErrors(util.data("parser/signatures/ok3.raml"));
    //})
    //it ("ok not signature3" ,function(){
    //    testErrors(util.data("parser/signatures/ok4.raml"));
    //})
    //it ("ok not signature4" ,function(){
    //    testErrors(util.data("parser/signatures/ok5.raml"));
    //})
    //it ("fail signature" ,function(){
    //    testErrors(util.data("parser/signatures/fail1.raml"), ["aoeu"]);
    //})
    //it ("fail signature2" ,function(){
    //    testErrors(util.data("parser/signatures/fail2.raml"), ["aoeu"]);
    //})
    it ("mediaType1" ,function(){
        testErrors(util.data("parser/media/m1.raml"), ["invalid media type"]);
    })
    it ("mediaType2" ,function(){
        testErrors(util.data("parser/media/m2.raml"), ["invalid media type"]);
    })
    it ("mediaType3" ,function(){
        testErrors(util.data("parser/media/m3.raml"), ["Form related media types can not be used in responses"]);
    })
    it ("annotations1" ,function(){
        testErrors(util.data("parser/annotations/a.raml"), ["value should be one of: 'W', 'A'"]);
    })
    it ("annotations2" ,function(){
        testErrors(util.data("parser/annotations/a2.raml"), ["boolean is expected"]);
    })
    it ("annotations3" ,function(){
        testErrors(util.data("parser/annotations/a3.raml"), ["Required property 'items' is missing"]);
    })
    it ("annotations4" ,function(){
        testErrors(util.data("parser/annotations/a4.raml"));
    })
    it ("annotations5" ,function(){
        testErrors(util.data("parser/annotations/a5.raml"), ["Required property 'y' is missing"]);
    })
    it ("annotations6" ,function(){
        testErrors(util.data("parser/annotations/a6.raml"));
    })
    it ("annotations7" ,function(){
        testErrors(util.data("parser/annotations/a7.raml"), ["boolean is expected"]);
    })
    it ("annotations8" ,function(){
        testErrors(util.data("parser/annotations/a8.raml"));
    })
    it ("annotations9" ,function(){
        testErrors(util.data("parser/annotations/a9.raml"), ["Required property 'ee' is missing"]);
    })
    it ("annotations10" ,function(){
        testErrors(util.data("parser/annotations/a10.raml"));
    })
    it ("annotations11" ,function(){
        testErrors(util.data("parser/annotations/a11.raml"), ["object is expected"]);
    })
    it ("annotations12" ,function(){
        testErrors(util.data("parser/annotations/a12.raml"), ["number is expected"]);
    })
    it ("annotations13" ,function(){
        testErrors(util.data("parser/annotations/a13.raml"));
    })
    it ("annotations14" ,function(){
        testErrors(util.data("parser/annotations/a14.raml"));
    })
    it ("annotations15" ,function(){
        testErrors(util.data("parser/annotations/a15.raml"), ["Resource property already used: '(meta)'", "Resource property already used: '(meta)'"]);
    })
    it ("annotations16" ,function(){
        testErrors(util.data("parser/annotations/a16.raml"));
    })
    it ("annotations17" ,function(){
        testErrors(util.data("parser/annotations/a17.raml"), ["Null or undefined value is not allowed","Header 'header1' already exists","Header 'header1' already exists"]);
    })
    it ("annotations18" ,function(){
        testErrors(util.data("parser/annotations/a18.raml"));
    })
    it ("annotations19" ,function(){
        testErrors(util.data("parser/annotations/a19.raml"), ["inheriting from unknown type"]);
    })
    it ("annotations21" ,function(){
        testErrors(util.data("parser/annotations/a21.raml"));
    })
    it ("annotations22" ,function(){
        testErrors(util.data("parser/annotations/a22.raml"));
    })
    it ("annotations23" ,function(){
        testErrors(util.data("parser/annotations/a23.raml"));
    })
    it ("annotations24" ,function(){
        testErrors(util.data("parser/annotations/a24.raml"));
    })
    it ("annotations25" ,function(){
        testErrors(util.data("parser/annotations/a25.raml"));
    })
    it ("annotations26 (annotated scalar)" ,function(){
        testErrors(util.data("parser/annotations/a26.raml"));
    })
    it ("annotations27 (annotated scalar (validation))" ,function(){
        testErrors(util.data("parser/annotations/a27.raml"),["number is expected"]);
    })
    it ("annotations28 (annotated scalar (unknown))" ,function(){
        testErrors(util.data("parser/annotations/a28.raml"),["unknown annotation: 'z2'"]);
    })
    it ("properties shortcut" ,function(){
        testErrors(util.data("parser/typexpressions/p.raml"));
    })
    it ("status" ,function(){
        testErrors(util.data("parser/status/s1.raml"),["Status code should be 3 digits number."]);
    })
    it ("node names" ,function(){
        testErrors(util.data("parser/nodenames/n1.raml"), ["Resource type 'x' already exists","Resource property already used: 'description'","Resource type 'x' already exists","Resource property already used: 'description'"]);
    })
    it ("node names2" ,function(){
        testErrors(util.data("parser/nodenames/n2.raml"),["Resource '/frfr' already exists","Api property already used: 'resourceTypes'","Resource '/frfr' already exists","Api property already used: 'resourceTypes'"]);
    })

    //TODO correct test after bug fix
    it ("recurrent errors" ,function(){
        testErrors(util.data("parser/typexpressions/tr.raml"), ["recurrent array type definition","recurrent array type definition"]);
    })
    it ("recurrent errors1" ,function(){
        testErrors(util.data("parser/typexpressions/tr1.raml"),["recurrent type definition"] );
    })
    it ("recurrent errors2" ,function(){
        //TODO REVIEW IT
        testErrorsByNumber(util.data("parser/typexpressions/tr2.raml"),2,1);//Ok for now lets improve later
    })

    //TODO correct test after bug fix
    it ("recurrent errors3 " ,function(){
        testErrors(util.data("parser/typexpressions/tr3.raml"),["recurrent type as an option of union type", "recurrent type as an option of union type", "recurrent type definition"]);
    })

    //TODO correct test after bug fix
    it ("recurrent errors4" ,function(){
        testErrors(util.data("parser/typexpressions/tr4.raml"),["recurrent array type definition", "recurrent array type definition"]);
    })
    it ("recurrent errors5" ,function(){
        testErrors(util.data("parser/typexpressions/tr14/test.raml"));
    })
    it ("schema types 1" ,function(){
        testErrors(util.data("parser/typexpressions/tr5.raml"));//Ok for now lets improve later
    })
    it ("inheritance rules1" ,function(){
        testErrors(util.data("parser/typexpressions/ri1.raml"));//Ok for now lets improve later
    })
    it ("inheritance rules2" ,function(){
        testErrors(util.data("parser/typexpressions/ri2.raml"));//Ok for now lets improve later
    })
    it ("multiple default media types" ,function(){
        testErrors(util.data("parser/media/m4.raml"));
    })

    //TODO correct test after bug fix
    it ("inheritance rules3" ,function(){
        testErrors(util.data("parser/typexpressions/ri3.raml"), ["Restrictions conflict","Restrictions conflict"]);
    })
    it ("inheritance rules4" ,function(){
        testErrors(util.data("parser/typexpressions/ri4.raml"));//Ok for now lets improve later
    })

    //TODO correct test after bug fix
    it ("inheritance rules5" ,function(){
        testErrors(util.data("parser/typexpressions/ri5.raml"),["Restrictions conflict"]);
    })

    //TODO correct test after bug fix
    it ("inheritance rules6" ,function(){
        testErrors(util.data("parser/typexpressions/ri6.raml"), ["Restrictions conflict"]);
    })

    //TODO correct test after bug fix
    it ("inheritance rules7" ,function(){
        testErrors(util.data("parser/typexpressions/ri7.raml"),["Restrictions conflict"]);
    })
    it ("schemas are types 1" ,function(){
        testErrors(util.data("parser/typexpressions/tr6.raml"), ["inheriting from unknown type"]);
    })
    it ("type deps" ,function(){
        testErrors(util.data("parser/typexpressions/tr7.raml"),["Required property 'element' is missing"]);
    })
    it ("inplace types 00" ,function(){
        testErrors(util.data("parser/typexpressions/tr8.raml"),["Null or undefined value is not allowed"]);//Ok for now lets improve later
    })
    it ("unique keys" ,function(){
        testErrors(util.data("parser/typexpressions/tr9.raml"),["Keys should be unique"]);//Ok for now lets improve later
    })
    it ("runtime types value" ,function(){
        testErrors(util.data("parser/typexpressions/tr10.raml"),["Required property 'y' is missing"]);//Ok for now lets improve later
    })
    it ("runtime types value1" ,function(){
        testErrors(util.data("parser/typexpressions/tr11.raml"),["object is expected"]);//Ok for now lets improve later
    })
    it ("runtime types value2" ,function(){
        testErrors(util.data("parser/typexpressions/tr12.raml"));//Ok for now lets improve later
    })
    it ("union can be object at same moment sometimes" ,function(){
        testErrors(util.data("parser/typexpressions/tr14.raml"));//Ok for now lets improve later
    })
    it ("no unknown facets in union type are allowed" ,function(){
        testErrorsByNumber(util.data("parser/typexpressions/tr15.raml"),1);//Ok for now lets improve later
    })
    it ("sequence composition works in 0.8" ,function(){
        testErrors(util.data("parser/custom/seq.raml"));//Ok for now lets improve later
    })
    it ("sequence composition does not works in 1.0" ,function(){
        testErrors(util.data("parser/custom/seq1.raml"),["Unknown node: 'a'","Unknown node: 'b'","'traits' should be a map in RAML 1.0"]);
    })
    it ("empty 'traits' array is prohibited in 1.0" ,function(){
        testErrors(util.data("parser/custom/seq2.raml"),["'traits' should be a map in RAML 1.0"]);
    })
    it ("authorization grant is any absolute uri" ,function(){
        testErrorsByNumber(util.data("parser/custom/grantIsAnyAbsoluteUri.raml"),0);//Ok for now lets improve later
    })
    it ("empty schema is ok in 0.8" ,function(){
        testErrorsByNumber(util.data("parser/custom/emptySchema.raml"),0);//Ok for now lets improve later
    })
    it ("properties are map in 1.0" ,function(){
        testErrorsByNumber(util.data("parser/custom/propMap.raml"),1);//Ok for now lets improve later
    })
    it ("schema is yml" ,function(){
        testErrorsByNumber(util.data("parser/custom/schemaIsyml.raml"),0);//Ok for now lets improve later
    })

    it ("null tag support" ,function(){
        testErrorsByNumber(util.data("parser/custom/nullTag.raml"),0);//Ok for now lets improve later
    })
    it ("r2untime types value2" ,function(){
        testErrorsByNumber(util.data("parser/typexpressions/tr13.raml"),1,1);//Ok for now lets improve later
    })
    it ("date time format is checked in super types" ,function(){
        testErrorsByNumber(util.data("parser/annotations/a31.raml"),0);//Ok for now lets improve later
    })
    it ("date time format is checked in super types (negative)" ,function(){
        testErrorsByNumber(util.data("parser/annotations/a32.raml"),1);//Ok for now lets improve later
    })
    it ("unknown annotation in example" ,function(){
        testErrors(util.data("parser/annotations/a35.raml"),["using unknown annotation type"]);
    })
    //No more signatures
    //it ("signatures with inherited classes" ,function(){
    //    testErrors(util.data("parser/typexpressions/ct1.raml"));//Ok for now lets improve later
    //})
    it ("custom api" ,function(){
        testErrors(util.data("parser/custom/api.raml"), ["Missing required property 'title'"]);//Ok for now lets improve later
    })
    it ("discriminator can only be used at top level" ,function(){
        testErrorsByNumber(util.data("parser/custom/discTop.raml"), 1);//Ok for now lets improve later
    })
    it ("schemas and types are mutually exclusive" ,function(){
        testErrorsByNumber(util.data("parser/custom/schemasAndTypes.raml"), 1);//Ok for now lets improve later
    })
    it ("halt" ,function(){
        testErrorsByNumber(util.data("parser/custom/halt.raml"),2,1);//Ok for now lets improve later
    })
    it ("naming rules" ,function(){
        testErrors(util.data("parser/custom/naming1.raml"),["object is expected","Type 'Person' already exists", "Trait 'qq' already exists", "Resource '/ee' already exists","Type 'Person' already exists", "Trait 'qq' already exists", "Resource '/ee' already exists"]);
    })
    it ("resource types test with types" ,function(){
        testErrors(util.data("parser/custom/rtypes.raml"));//Ok for now lets improve later
    })

    it ("resource path name uses rightmost segment" ,function(){
        testErrors(util.data("parser/resourceType/resType023.raml"));//Ok for now lets improve later
    })
    it ("form parameters are properties" ,function(){
        testErrors(util.data("parser/custom/noForm.raml"));//Ok for now lets improve later
    })
    it ("endless loop" ,function(){
        testErrorsByNumber(util.data("parser/custom/el.raml"),2,1);//Ok for now lets improve later
    })
    it ("forms can not be in responses" ,function(){
        testErrors(util.data("parser/custom/noForm2.raml"),["Form related media types can not be used in responses"]);//Ok for now lets improve later
    })
    it ("APIKey" ,function(){
        testErrors(util.data("parser/custom/apiKey.raml"));//Ok for now lets improve later
    })
    it ("Oath1Sig" ,function(){
        testErrors(util.data("parser/custom/oath1sig.raml"));//Ok for now lets improve later
    })
    it ("regexp validation" ,function(){
        testErrors(util.data("parser/custom/regexp.raml"),["Unterminated group"]);
    })
    it ("regexp validation 2" ,function(){
        testErrors(util.data("parser/custom/regexp2.raml"), ["Unterminated group"]);
    })
    it ("regexp validation 3" ,function(){
        testErrors(util.data("parser/custom/regexp3.raml"), ["Unterminated group"]);
    })
    it ("spaces in keys" ,function(){
        testErrors(util.data("parser/custom/keysSpace.raml"),["Keys should not have spaces '\\w+  '"]);//Ok for now lets improve later
    })
    it ("facets11" ,function(){
        testErrors(util.data("parser/facets/f1.raml"));
    })
    it ("facets1" ,function(){
        testErrors(util.data("parser/facets/f2.raml"), ["string is expected"]);
    })
    it ("redeclare buildin" ,function(){
        testErrors(util.data("parser/facets/f3.raml"),["redefining a built in type: datetime"]);
    })
    //it ("recursive includes" ,function(){
    //    testErrors(util.data("parser/recursive/r1.raml"));
    //})
    it ("custom facets validator" ,function(){
        testErrors(util.data("commonLibrary/api.raml"), ["string is expected","string is expected","object is expected"]);
    })
    it ("custom facets validator2" ,function(){
        testErrors(util.data("commonLibrary/api2.raml"),["object is expected"]);
    })
    //it ("custom facets validator3" ,function(){
    //    testErrors(util.data("commonLibrary/api3.raml"), ["object is expected ../../../src/raml1/test/data/commonLibrary/common.raml"]);
    //})
    it ("overloading1" ,function(){
        testErrors(util.data("parser/overloading/o1.raml"),["Method 'get' already exists","Method 'get' already exists"]);
    })
    it ("overloading2" ,function(){
        testErrors(util.data("parser/overloading/o2.raml"),[]);
    })
    it ("overloading3" ,function(){
        testErrors(util.data("parser/overloading/o3.raml"),["Resource '/{id}' already exists","Resource '/{id}' already exists"]);
    })
    it ("overloading4" ,function(){
        testErrors(util.data("parser/overloading/o4.raml"),[]);
    })

    // it ("overloading6" ,function(){
    //     testErrors(util.data("parser/overloading/o6.raml"), ["Resources share same URI","Resources share same URI"]);
    // })
    it ("overloading7" ,function(){
        testErrors(util.data("parser/overloading/o7.raml"),[]);
    })

    //TODO fix test after bug fix.
    it ("override1" ,function(){
        testErrors(util.data("parser/inheritance/i1.raml"), ["Restrictions conflict"]);
    })
    it ("override2" ,function(){
        testErrors(util.data("parser/inheritance/i2.raml"),["Facet 'q' can not be overriden"]);
    })
    it ("override3" ,function(){
        testErrors(util.data("parser/inheritance/i3.raml"));
    })
    it ("overlay1" ,function(){
        testErrors(util.data("parser/overlay/o1/NewOverlay.raml"));
    })
    it ("overlay2" ,function(){
        testErrors(util.data("parser/overlay/o2/NewOverlay.raml"),["The '.env-org-pair2' node does not match any node of the master api."]);
    })
    it ("Overlay: title" ,function(){
        testErrors(util.data("parser/overlay/o3/NewOverlay.raml"));
    })
    it ("Overlay: displayName" ,function(){
        testErrors(util.data("parser/overlay/o4/NewOverlay.raml"));
    })
    it ("Overlay: annotation types" ,function(){
        testErrors(util.data("parser/overlay/o5/NewOverlay.raml"));
    })
    it ("Overlay: types" ,function(){
        testErrors(util.data("parser/overlay/o6/NewOverlay.raml"));
    })
    it ("Overlay: schema" ,function(){
        testErrors(util.data("parser/overlay/o7/NewOverlay.raml"));
    })
    it ("Overlay: annotations" ,function(){
        testErrors(util.data("parser/overlay/o8/NewOverlay.raml"));
    })
    it ("Overlay: usage" ,function(){
        testErrors(util.data("parser/overlay/o9/NewOverlay.raml"));
    })
    it ("Overlay: documentation1" ,function(){
        testErrors(util.data("parser/overlay/o10/NewOverlay.raml"));
    })
    it ("Overlay: documentation2" ,function(){
        testErrors(util.data("parser/overlay/o11/NewOverlay.raml"));
    })
    it ("Overlay: documentation3" ,function(){
        testErrors(util.data("parser/overlay/o12/NewOverlay.raml"));
    })
    it ("Overlay: examples1" ,function(){
        testErrors(util.data("parser/overlay/o13/NewOverlay.raml"));
    })
    it ("Overlay: examples2" ,function(){
        testErrors(util.data("parser/overlay/o14/NewOverlay.raml"));
    })
    it ("Overlay: examples3" ,function(){
        testErrors(util.data("parser/overlay/o15/NewOverlay.raml"));
    })
    it ("Overlay: example1" ,function(){
        testErrors(util.data("parser/overlay/o16/NewOverlay.raml"));
    })
    it ("Overlay: example2" ,function(){
        testErrors(util.data("parser/overlay/o17/NewOverlay.raml"));
    })
    it ("Overlay: top-level illegal property" ,function(){
        testErrors(util.data("parser/overlay/o18/NewOverlay.raml"), ["Property 'version' is not allowed to be overriden or added in overlays"]);
    })
    it ("Overlay: sub-level illegal property" ,function(){
        testErrors(util.data("parser/overlay/o19/NewOverlay.raml"), ["Property 'default' is not allowed to be overriden or added in overlays"]);
    })
    it ("Overlay: top-level illegal node" ,function(){
        testErrors(util.data("parser/overlay/o20/NewOverlay.raml"),["The './resource2' node does not match any node of the master api."]);
    })
    it ("Overlay: sub-level illegal node 1" ,function(){
        testErrors(util.data("parser/overlay/o21/NewOverlay.raml"),["The './resource./resource2' node does not match any node of the master api."]);
    })
    it ("Overlay: sub-level illegal node 2" ,function(){
        testErrors(util.data("parser/overlay/o22/NewOverlay.raml"),["The './resource.post' node does not match any node of the master api."]);
    })

    it ("Security Scheme Fragment: new security scheme" ,function(){
        testErrors(util.data("parser/securityschemefragments/ss1/securitySchemeFragment.raml"));
    })

    it ("library is not user class" ,function(){
        testErrors(util.data("parser/raml/raml.raml"),["It is only allowed to use scalar properties as discriminators"]);
    })
    it ("library from christian" ,function(){
        testErrors(util.data("parser/libraries/christian/api.raml"));
    })
    it ("library in resource type fragment" ,function(){
        testErrors(util.data("parser/libraries/fragment/api.raml"));
    })
    it ("library in resource type fragment" ,function(){
        testErrors(util.data("parser/libraries/fragment/api.raml"));
    })
    it ("nested uses" ,function(){
        testErrors(util.data("parser/libraries/nestedUses/index.raml"));
    })
    it ("library require 1" ,function(){
        testErrors(util.data("parser/libraries/require/a.raml"));
    })
    it ("library require 2" ,function(){
        testErrors(util.data("parser/libraries/require/b.raml"));
    })
    it ("more complex union types1",function(){
            testErrors(util.data("parser/union/apigateway-aws-overlay.raml"));

    })
    it ("more complex union types2",function(){
        testErrors(util.data("parser/union/unionSample.raml"));

    })
    it ("external 1" ,function(){
        testErrors(util.data("parser/external/e1.raml"),["Example does not conform to schema: Content is not valid according to schema: Missing required property: \\w+ \\w+"]);
    })
    it ("external 2" ,function(){
        testErrors(util.data("parser/external/e2.raml"));
    })

    it ("strange names in parameters" ,function(){
        testErrors(util.data("parser/custom/strangeParamNames.raml"));
    })
    // it ("external 3" ,function(){
    //     testErrors(util.data("parser/external/e3.raml"),["Example does not conform to schema:Content is not valid according to schema:Expected type \\w+ but found type \\w+ \\w+,\\w+"]);
    // })
    // it ("external 4" ,function(){
    //     testErrors(util.data("parser/external/e4.raml"),["Example does not conform to schema:Content is not valid according to schema:Missing required property: \\w+ \\w+"]);
    // })
    // it ("external 5" ,function(){
    //     testErrors(util.data("parser/external/e5.raml"));
    // })
    it ("should pass without exceptions 1" ,function(){
        testErrorsByNumber(util.data("parser/api/api29.raml"), 1);
    })
    it ("should pass without exceptions 2" ,function(){
        testErrorsByNumber(util.data("parser/api/api30/api.raml"), 2);
    })

    it ("empty type include should produce no error" ,function(){
        testErrors(util.data("parser/type/t30.raml"));
    })
});

describe('XSD schemes tests', function () {
    it("XSD Scheme test 1" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test1/apiValid.raml"), 0);
    })
    it("XSD Scheme test 2" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test1/apiInvalid.raml"), 1);
    })
    it("XSD Scheme test 3" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test2/apiValid.raml"), 0);
    })
    it("XSD Scheme test 4" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test2/apiInvalid.raml"), 1);
    })
    it("XSD Scheme test 5" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test3/apiValid.raml"), 0);
    })
    it("XSD Scheme test 6" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test3/apiInvalid.raml"), 1);
    })
    it("XSD Scheme test 7" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test4/apiValid.raml"), 0);
    })
    it("XSD Scheme test 8" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test4/apiInvalid.raml"), 1);
    })
    it("XSD Scheme test 9" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test5/apiValid.raml"), 0);
    })
    it("XSD Scheme test 10" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test5/apiInvalid.raml"), 1);
    })
    it("XSD Scheme test 11" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test6/apiValid.raml"), 0);
    })
    it("XSD Scheme test 12" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test6/apiInvalid.raml"), 1);
    })
    it("XSD Scheme test 13" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test7/apiValid.raml"), 0);
    })
    it("XSD Scheme test 14" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test7/apiInvalid.raml"), 1);
    })
    it("XSD Scheme test 15" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test8/apiValid.raml"), 0);
    })
    it("XSD Scheme test 16" ,function() {
        testErrorsByNumber(util.data("parser/xsdscheme/test8/apiInvalid.raml"), 1);
    })
    it("Empty schemas must not be reported as unresolved" ,function() {
        testErrors(util.data("parser/schemas/emptySchemaTest/api.raml"));
    })
    it("Inlining schemas in JSON for RAML 0.8" ,function() {
        var api=util.loadApi(util.data("parser/schemas/RAML08SchemasInlining/api.raml"));
        var json = api.wrapperNode().toJSON({ rootNodeDetails: true, dumpSchemaContents: true, serializeMetadata: true });
        util.compareToFileObject(json,util.data("parser/schemas/RAML08SchemasInlining/api-tck.json"));
    })
});

describe('XML parsing tests', function () {
    it("XML parsing tests 1" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test1/apiValid.raml"), 0);
    })
    it("XML parsing tests 2" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test1/apiInvalid1.raml"), 1);


    })
    it("XML parsing tests 3" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test1/apiInvalid2.raml"), 1);
    })
    it("XML parsing tests 4" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test1/apiInvalid3.raml"), 1);
    })
    it("XML parsing tests 5" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test1/apiInvalid4.raml"), 1);
    })


    it("XML parsing tests 6" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test2/apiValid.raml"), 0);
    })
    it("XML parsing tests 7" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test2/apiInvalid1.raml"), 1);
    })
    it("XML parsing tests 8" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test2/apiInvalid2.raml"), 1);
    })
    it("XML parsing tests 9" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test2/apiInvalid3.raml"), 1);
    })
    it("XML parsing tests 10" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test2/apiInvalid4.raml"), 1);
    })
    it("XML parsing tests 11" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test2/apiInvalid5.raml"), 1);
    })

    it("XML parsing tests 12" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test3/apiValid.raml"), 0);
    })
    it("XML parsing tests 13" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test3/apiInvalid1.raml"), 1);
    })
    it("XML parsing tests 14" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test3/apiInvalid2.raml"), 1);
    })
    it("XML parsing tests 15" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test3/apiInvalid3.raml"), 2);
    })
    it("XML parsing tests 16" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test3/apiInvalid4.raml"), 1);
    })
    it("XML parsing tests 17" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test3/apiInvalid5.raml"), 1);
    })
    it("XML parsing tests 18" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test3/apiInvalid6.raml"), 1);
    })
    it("XML parsing tests 19" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test3/apiInvalid7.raml"), 1);
    })

    it("XML parsing tests 20" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test4/apiValid.raml"), 0);
    })
    it("XML parsing tests 21" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test4/apiInvalid1.raml"), 1);
    })
    it("XML parsing tests 22" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test4/apiInvalid2.raml"), 1);
    })
    it("XML parsing tests 23" ,function() {
        testErrorsByNumber(util.data("parser/xmlfacets/test4/apiInvalid3.raml"), 1);
    })
});

describe('JSON schemes tests', function () {
    it("JSON Scheme test 1" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test1/apiValid.raml"));
    })
    it("JSON Scheme test 2" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test1/apiInvalid.raml"), ["Missing required property: name"]);
    })
    it("JSON Scheme test 3" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test2/apiValid.raml"));
    })
    it("JSON Scheme test 4" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test2/apiInvalid.raml"), ["Missing required property: name"]);
    })
    it("JSON Scheme test 5" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test3/apiValid.raml"));
    })
    it("JSON Scheme test 6" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test3/apiInvalid.raml"), ["Missing required property: name"]);
    })
    it("JSON Scheme test 7" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test4/apiValid.raml"));
    })
    it("JSON Scheme test 8" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test4/apiInvalid.raml"), ["Missing required property: name"]);
    })
    it("JSON Scheme test 9" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test5/apiValid.raml"));
    })
    it("JSON Scheme test 10" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test5/apiInvalid.raml"), ["Missing required property: innerTypeName"]);
    })
    it("JSON Scheme test 11" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test6/apiValid.raml"));
    })
    it("JSON Scheme test 12" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test6/apiInvalid.raml"), ["Missing required property: innerTypeName"]);
    })
    it("JSON Scheme test 13" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test7/apiValid.raml"));
    })
    it("JSON Scheme test 14" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test7/apiInvalid.raml"), ["Missing required property: innerTypeName"]);
    })
    it("JSON Scheme test 15" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test8/apiValid.raml"));
    })
    it("JSON Scheme test 16" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test8/apiInvalid.raml"), ["Missing required property: childName"]);
    })
    it("JSON Scheme test 17" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test9/apiValid.raml"));
    })
    it("JSON Scheme test 18" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test9/apiInvalid.raml"), ["Missing required property: childName"]);
    })
    it("JSON Scheme test 19" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test10/apiValid.raml"));
    })
    it("JSON Scheme test 20" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test10/apiInvalid.raml"), ["Missing required property: innerTypeName"]);
    })
    it("JSON Scheme test 21" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test11/apiValid.raml"));
    })
    it("JSON Scheme test 22" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test11/apiInvalid.raml"), ["Missing required property: innerTypeName"]);
    })
    it("JSON Scheme test 23" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test8/apiValid0.raml"));
    })
    it("JSON Scheme test 24" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/jsonscheme/test8/apiInvalid0.raml"), ["Missing required property: childName"]);
    })
});

describe("Include tests + typesystem",function (){
    it("Include test" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/include/includeTypes.raml"));
    })

    it("Combination of empty include with expansion" ,function() {
        this.timeout(15000);
        testErrors(util.data("parser/include/emptyInclude.raml"),["JS-YAML: !include without value", "Can not resolve null"]);
    })
})


describe('Parse strings', function () {
    it('scalar should include both start/end quotes #parse-str1', function () {
        var api = util.loadApi(util.data('parser/strings/str1.raml'));
        //console.log(api.lowLevel().unit().contents());
        //api.lowLevel().show('API');
        var elementsOfKind = api.elementsOfKind('resources');
        var resource = <hl.IHighLevelNode>tools.collectionItem(elementsOfKind,0);
        //console.log('is text: ' + (<jsyaml.ASTNode>resource.attr('description').lowLevel()).text());
        var attr = resource.attr('description');
        //attr.lowLevel().show('ATTR:');
        util.assertText(attr, 'description: "hello world"');
        util.assertValue(attr, 'hello world');
        util.assertValueText(attr, '"hello world"');
    });
    it('scalar should include both start/end quotes #parse-str2', function () {
        var api = util.loadApi(util.data('parser/strings/str2.raml'));
        //console.log(api.lowLevel().unit().contents());
        //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL API');
        var elementsOfKind = api.elementsOfKind('resources');
        var resource = <hl.IHighLevelNode>tools.collectionItem(elementsOfKind,0);
        //console.log('is text: ' + (<jsyaml.ASTNode>resource.attr('description').lowLevel()).text());
        var attr = resource.attr('description');
        util.assertText(attr, "description: 'hello world'");
        util.assertValue(attr, 'hello world');
        util.assertValueText(attr, "'hello world'");
    });
    it('scalar should include both start/end quotes #parse-str3', function () {
        var api = util.loadApi(util.data('parser/strings/str3.raml'));
        //console.log(api.lowLevel().unit().contents());
        //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL API');
        var elementsOfKind = api.elementsOfKind('resources');
        var resource = <hl.IHighLevelNode>tools.collectionItem(elementsOfKind,0);
        //console.log('is text: ' + (<jsyaml.ASTNode>resource.attr('description').lowLevel()).text());
        var attr = resource.attr('description');
        util.assertText(attr, 'description: ""');
        util.assertValue(attr, '');
        util.assertValueText(attr, '""');
    });
    it('scalar should include both start/end quotes #parse-str4', function () {
        var api = util.loadApi(util.data('parser/strings/str4.raml'));
        //console.log(api.lowLevel().unit().contents());
        //(<yll.ASTNode>api.lowLevel()).show('ORIGINAL API');
        var elementsOfKind = api.elementsOfKind('resources');
        var resource = <hl.IHighLevelNode>tools.collectionItem(elementsOfKind,0);
        //console.log('is text: ' + (<jsyaml.ASTNode>resource.attr('description').lowLevel()).text());
        var attr = resource.attr('description');
        util.assertText(attr, "description: ''");
        util.assertValue(attr, '');
        util.assertValueText(attr, "''");
    });

});

describe('Property override tests',function(){
    it ("Planets",function(){
        testErrors(util.data("parser/propertyOverride/test1.raml"),["'enum' facet value must be defined by array"]);
    });

    it ("User type properties: correct",function(){
        testErrors(util.data("parser/propertyOverride/test2.raml"));
    });

    //TODO fix test after bug fix
    it ("User type properties: incorrect",function(){
        testErrors(util.data("parser/propertyOverride/test3.raml"), ["Restrictions conflict"]);
    });

    it ("Value type properties 1",function(){
        testErrors(util.data("parser/propertyOverride/test4.raml"));
    });

    it ("Value type properties 2",function(){
        testErrors(util.data("parser/propertyOverride/test5.raml"));
    });

    it ("Value type properties 3",function(){
        testErrors(util.data("parser/propertyOverride/test6.raml"));
    });

    it ("Required property overridden as optional",function(){
        testErrors(util.data("parser/propertyOverride/test7.raml"), ["Can not override required property 'testProperty' to be optional"]);
    });

    it ("Value type properties 4",function(){
        testErrors(util.data("parser/propertyOverride/test8.raml"));
    });

    it ("Facet override",function(){
        testErrors(util.data("parser/propertyOverride/test9.raml"), ["Facet 'test' can not be overriden","missing required facets"]);
    });

    it ("Optional property overridden as required",function(){
        testErrors(util.data("parser/propertyOverride/test10.raml"));
    });

    //TODO this test should be revised.
    //it ("Not existing include should not throw exception in java",function(){
    //    testErrors(util.data("parser/custom/includes1.raml"));
    //});
    it ("existing include should not report any errros",function(){
        testErrors(util.data("parser/custom/includes2.raml"));
    });
    it ("should parse types which are valid only after expansion",function(){
        testErrors(util.data("parser/templates/validAfterExpansion.raml"));
    });
    it ("should not accept resouces  which are not valid only after expansion",function(){
        testErrorsByNumber(util.data("parser/templates/invalidAfterExpansion.raml"),1);
    });
    it ("resource definition should be a map",function(){
        testErrors(util.data("parser/custom/resShouldBeMap.raml"),["Resource definition should be a map"]);
    });
    it ("documentation should be a sequence",function(){
        testErrors(util.data("parser/custom/docShouldBeSequence.raml"),["Property 'documentation' should be a sequence"]);
    });
    it ("missed title value should report only one message",function(){
        testErrors(util.data("parser/custom/missedTitle.raml"),["property 'title' must be a string"]);
    });
    it ("expander not halted by this sample any more",function(){
        testErrorsByNumber(util.data("parser/custom/expanderHalt.raml"),10);
    });
});
describe('Line mapper tests',function() {
    it("Test that columns and line numbers start from 1", function () {
        testErrorsWithLineNumber(util.data("parser/lineNumbers/t1.raml"),3,0);
    });
    it("Test that columns and line numbers start from 1 another incarnation", function () {
        testErrorsWithLineNumber(util.data("parser/lineNumbers/t2.raml"),2,0);
    });
    it("Test that end is not to big", function () {
        testErrorsEnd(util.data("parser/custom/positionFix.raml"));
    });

});

describe('Fragment loading', function () {
    it('DataType loading', function () {
        var fragment = util.loadRAML(util.data('parser/fragment/DataType.raml'));
        var fragmentName = fragment.definition().nameId();
        assert.equal(fragmentName, "ObjectTypeDeclaration")
    });
    it('Trait loading', function () {
        var fragment = util.loadRAML(util.data('parser/fragment/Trait.raml'));
        var fragmentName = fragment.definition().nameId();
        assert.equal(fragmentName, "Trait")
    });
    // it('AnnotationTypeDeclaration loading', function () {
    //     testErrorsByNumber(util.data("parser/fragment/AnnotationTypeDeclaration.raml"), 0);
    // });
});

describe('Optional template parameters tests', function () {
    it("Should not report error on unspecified parameter, which is not used after expansion #1.", function () {
        testErrors(util.data("parser/optionalTemplateParameters/api01.raml"));
    });
    it("Should report error on unspecified parameter, which is used after expansion #1.", function () {
        testErrors(util.data("parser/optionalTemplateParameters/api02.raml")
            ,["Value is not provided for parameter: 'param1'"]);
    });
    it("Should not report error on unspecified parameter, which is not used after expansion #2.", function () {
        testErrors(util.data("parser/optionalTemplateParameters/api03.raml"));
    });
    it("Should report error on unspecified parameter, which is used after expansion #2.", function () {
        testErrors(util.data("parser/optionalTemplateParameters/api04.raml")
            ,["Value is not provided for parameter: 'param1'"]);
    });
    it("Should not report error on unspecified parameter, which is not used after expansion #3.", function () {
        testErrors(util.data("parser/optionalTemplateParameters/api05.raml"));
    });
    it("Should not report error on unspecified parameter, which is not used after expansion #4.", function () {
        testErrors(util.data("parser/optionalTemplateParameters/api06.raml"));
    });
    it("Should not report error on unspecified parameter, which is not used after expansion #5.", function () {
        testErrors(util.data("parser/optionalTemplateParameters/api07.raml"));
    });
    it("Should not report error on unspecified parameter, which is not used after expansion #6.", function () {
        testErrors(util.data("parser/optionalTemplateParameters/api08.raml"));
    });
    it("Should not report error on unspecified parameter, which is not used after expansion #7.", function () {
        testErrors(util.data("parser/optionalTemplateParameters/api09.raml"));
    });
    it("Only methods are permitted to be optional in sense of templates expansion.", function () {
        testErrors(util.data("parser/illegalOptionalParameters/api01.raml")
            ,["Only method nodes can be optional"]);
    });
});

describe('RAML10/Dead Loop Tests/Includes',function(){

    it("test001", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/Includes/test001/api.raml"),["Recursive definition"]);
    });

    it("test002", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/Includes/test002/api.raml"),["Recursive definition"]);
    });

    it("test003", function () {
        this.timeout(15000);
        testErrorsByNumber(util.data("./parser/deadLoopTests/Includes/test003/file1.raml"),2);
    });

    it("test004", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/Includes/test002/api.raml"),["Recursive definition"]);
    });

});

describe('RAML10/Dead Loop Tests/JSONSchemas',function(){

    it("test001", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/JSONSchemas/test001/api.raml"),["JSON schema contains circular references"]);
    });

    it("test002", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/JSONSchemas/test002/api.raml"),["JSON schema contains circular references"]);
    });

    it("test003", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/JSONSchemas/test003/api.raml"),["Remote reference didn't compile successfully"]);
    });

});

describe('RAML10/Dead Loop Tests/Libraries',function(){

    it("test001", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/Libraries/test001/lib.raml"));
    });

    it("test002", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/Libraries/test002/lib.raml"));
    });

    it("test003", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/Libraries/test003/lib1.raml"));
    });

    it("test003", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/Libraries/test003/lib2.raml"));
    });

    it("test004", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/Libraries/test004/lib1.raml"));
    });

    it("test004", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/Libraries/test004/lib2.raml"));
    });

});

describe('RAML10/Dead Loop Tests/ResourceTypes',function(){

    it("test001", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/ResourceTypes/test001/api.raml"),["Resource type definition contains cycle"]);
    });

    it("test002", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/ResourceTypes/test002/lib1.raml"));
    });

    it("test002", function () {
        this.timeout(15000);
        testErrors(util.data("./parser/deadLoopTests/ResourceTypes/test002/lib2.raml"));
    });

});

describe('Dumps',function(){
    it("dump1", function () {
        testDump(util.data("dump/dump1/api.raml"), {dumpXMLRepresentationOfExamples: true});
    });
});

function testDump(apiPath: string, options: any) {
    var api = util.loadApi(apiPath);
    var dumpPath = util.dumpPath(apiPath);
    
    util.compareDump(api.wrapperNode().toJSON(options), dumpPath, apiPath);
}

function testErrorsWithLineNumber(p:string,lineNumber: number, column:number) {
    var api = util.loadApi(p);
    var errors:any = util.validateNode(api);
    var issue:hl.ValidationIssue =errors[0];
    var position:ll.TextPosition=null;
    if (typeof issue.node =="function"){
        var javaposition=(<any>issue).start();
        assert.equal(javaposition.column(),column);
        assert.equal(javaposition.line(),lineNumber);
    }
    else{
        position=issue.node.lowLevel().unit().lineMapper().position(issue.start);
        assert.equal(position.column,column);
        assert.equal(position.line,lineNumber);
    }


}
function testErrorsEnd(p:string) {
    var api = util.loadApi(p);
    var errors:any = util.validateNode(api);
    var issue:hl.ValidationIssue =errors[0];
    assert.equal(issue.end<api.lowLevel().unit().contents().length,true);

}

export function testErrors(p:string, expectedErrors=[],ignoreWarnings:boolean=false){
    console.log("Starting test errors for " + p)
    var api=util.loadApi(p);
    api = util.expandHighIfNeeded(api);

    var errors:any=util.validateNode(api);
    if (ignoreWarnings){
        errors=errors.filter(x=>!x.isWarning);
    }
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
        console.warn("Expected errors:");
        expectedErrors.forEach(expectedError=>console.warn(expectedError));

        var unitContents = api.lowLevel().unit().contents();
        console.warn("Actual errors:");

        errors.forEach(error=>console.warn(error.message + " : " + unitContents.substr(error.start, error.end-error.start)));
    }
    console.log("Before asserting test errors for " + p)
    assert.equal(hasUnexpectedErr, false, "Unexpected errors found\n"+errorMsg);
    assert.equal(errors.length, expectedErrors.length, "Wrong number of errors\n"+errorMsg);
    console.log("Finishing test errors for " + p)
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

function escapeRegexp(regexp: string) {
    return regexp.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
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
                    console.warn(error.message);
                } else {
                    console.warn(error);
                }
                console.warn("\n");
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

