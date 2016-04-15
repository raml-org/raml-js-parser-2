/// <reference path="../../../typings/main.d.ts" />
import assert = require("assert")

//import fs = require("fs")
//import path = require("path")
//import _=require("underscore")
//
//import def = require("raml-definition-system")
//
import ll=require("../lowLevelAST")
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
        testErrors(util.data("../example-ramls/Instagram/api.raml"),["Example does not conform to schema:Content is not valid according to schema:Expected type \\w+ but found type null \\w+,null", "Example does not conform to schema:Content is not valid according to schema:Expected type \\w+ but found type null \\w+,null", "Example does not conform to schema:Content is not valid according to schema:Expected type \\w+ but found type null \\w+,null, Expected type \\w+ but found type null \\w+,null"]);
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
        testErrors(util.data("../example-ramls/core-services/api.raml"),["Can not parse JSON:Unexpected token {", "Can not parse JSON:Unexpected token \\w+", "Can not parse JSON:Unexpected token \\w+"]);
    });
    it ("cloudhub new logging",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/cloudhub-new-logging/api.raml"),["Can not parse JSON:Unexpected token }"]);
    });
    it ("audit logging",function(){
        this.timeout(15000);
        testErrors(util.data("../example-ramls/audit-logging-query/api.raml"));
    });
    it ("application monitoring",function(){
        this.timeout(15000)
        testErrors(util.data("../example-ramls/application-monitoring/api.raml"),["Unrecognized schema 'appmonitor-rule.schema'", "Example does not conform to schema:Content is not valid according to schema:Reference could not be resolved: http://appmonitor-action http://appmonitor-action", "Unrecognized schema 'appmonitor-rule.schema'", "Example does not conform to schema:Content is not valid according to schema:Reference could not be resolved: http://appmonitor-action http://appmonitor-action", "Example does not conform to schema:Content is not valid according to schema:Reference could not be resolved: http://appmonitor-rule http://appmonitor-rule", "Unrecognized schema 'appmonitor'"]);
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
        testErrors(util.data("parser/transformers/t1.raml"), ["Unknown function applied to parameter: !\\w+"]);
    });
});

describe('Security Schemes tests', function () {
    it ("should fail if not all required settings specified" ,function(){
        testErrors(util.data("parser/securitySchemes/ss1/securityScheme.raml"), ["Missing required property \\w+"]);
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
        testErrors(util.data("parser/securitySchemes/ss9/securityScheme.raml"), ["property already used: 'authorizationGrants'", "property already used: 'authorizationGrants'", "property already used: 'authorizationGrants'"]);
    })
    it ("null-value security schema should be allowed for Api(0.8)" ,function(){
        testErrors(util.data("parser/securitySchemes/ss10/securityScheme.raml"));
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
        testErrors(util.data("parser/examples/ex1.raml"), ["Can not parse JSON example:Unexpected token d"]);
    })
    it ("example validation json against schema" ,function(){
        testErrors(util.data("parser/examples/ex2.raml"), ["Content is not valid according to schema"]);
    })
    it ("example validation yaml against schema" ,function(){
        testErrors(util.data("parser/examples/ex3.raml"), ["Example does not conform to schema:Content is not valid according to schema:Additional properties not allowed: \\w+ \\w+"]);
    })
    it ("example validation yaml against basic type" ,function(){
        testErrors(util.data("parser/examples/ex4.raml"),["Required property: c is missed"]);
    })
    it ("example validation yaml against inherited type" ,function(){
        testErrors(util.data("parser/examples/ex5.raml"), ["Required property: c is missed"]);
    })
    it ("example validation yaml against array" ,function(){
        testErrors(util.data("parser/examples/ex6.raml"),["Required property: c is missed"]);
    })
    it ("example in model" ,function(){
        testErrors(util.data("parser/examples/ex7.raml"), ["string is expected","string is expected","Required property: c is missed"]);
    })
    it ("another kind of examples" ,function(){
        testErrors(util.data("parser/examples/ex13.raml"), ["boolean is expected"]);
    })
    it ("example in parameter" ,function(){
        testErrors(util.data("parser/examples/ex8.raml"), ["boolean is expected"]);
    })

    //TODO uncomment it
    // it ("checking that node is actually primitive" ,function(){
    //     testErrors(util.data("parser/examples/ex9.raml"), ["should be string"]);
    // })
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
        testErrors(util.data("parser/examples/ex14.raml"), ["Unknown property:z"]);
    })
    it ("enums restriction" ,function(){
        testErrors(util.data("parser/examples/ex15.raml"),["value should be one of:aaa,bbb,3"]);
    })
    it ("array facets" ,function(){
        testErrors(util.data("parser/examples/ex16.raml"), ["array should have not less then 5 items", "array should have not more then 3 items", "items should be unique"]);
    })
    it ("array facets2" ,function(){
        testErrors(util.data("parser/examples/ex17.raml"));
    })
    it ("array facets3" ,function(){
        testErrors(util.data("parser/examples/ex18.raml"), ["array should have not less then 5 items"]);
    })
    it ("array facets4" ,function(){
        testErrors(util.data("parser/examples/ex19.raml"),["array should have not less then 5 items"]);
    })
    it ("object facets1" ,function(){
        testErrors(util.data("parser/examples/ex20.raml"), ["object should have not less then 2 properties"]);
    })
    it ("object facets2" ,function(){
        testErrors(util.data("parser/examples/ex21.raml"), ["object should have not less then 2 properties"]);
    })
    it ("object facets3" ,function(){
        testErrors(util.data("parser/examples/ex22.raml"), ["object should have not more then 1 properties"]);
    })
    it ("object facets4" ,function(){
        testErrors(util.data("parser/examples/ex23.raml"));
    })
    it ("object facets5" ,function(){
        testErrors(util.data("parser/examples/ex24.raml"), ["object should have not less then 3 properties"]);
    })
    it ("string facets1" ,function(){
        testErrors(util.data("parser/examples/ex25.raml"), ["string length should be not less then 5", "string length should be not more then 3"]);
    })
    it ("string facets2" ,function(){
        testErrors(util.data("parser/examples/ex26.raml"));
    })
    it ("string facets3" ,function(){
        testErrors(util.data("parser/examples/ex27.raml"), ["string length should be not less then 5"]);
    })
    it ("string facets4" ,function(){
        testErrors(util.data("parser/examples/ex28.raml"), ["string should match to \\.5"]);
    })
    it ("number facets1" ,function(){
        testErrors(util.data("parser/examples/ex29.raml"),["value should be not less then \\w+", "value should be not less then \\w+"]);
    })

    it ("number facets2" ,function(){
        testErrors(util.data("parser/examples/ex30.raml"));
    })
    it ("self rec types" ,function(){
        testErrors(util.data("parser/examples/ex31.raml"));
    })
    it ("media type" ,function(){
        testErrors(util.data("parser/examples/ex32.raml"),["Can not parse JSON example:Unexpected token p"]);
    })
    it ("number 0" ,function(){
        testErrors(util.data("parser/examples/ex33.raml"));
    })
    it ("example inside of inplace type" ,function(){
        testErrors(util.data("parser/examples/ex34.raml"), ["Required property: x is missed"]);
    })
    it ("aws example" ,function(){
        testErrors(util.data("parser/examples/ex35.raml"), ["enum facet can only contain unique items"]);
    })
    it ("multi unions" ,function(){
        testErrors(util.data("parser/examples/ex36.raml"));
    })
    it ("enums values restriction" ,function(){
        testErrors(util.data("parser/examples/ex37.raml"),["enum facet can only contain unique items"]);
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
        testErrors(util.data("parser/annotations/a.raml"), ["value should be one of:W,A"]);
    })
    it ("annotations2" ,function(){
        testErrors(util.data("parser/annotations/a2.raml"), ["boolean is expected"]);
    })
    it ("annotations3" ,function(){
        testErrors(util.data("parser/annotations/a3.raml"), ["Required property: items is missed"]);
    })
    it ("annotations4" ,function(){
        testErrors(util.data("parser/annotations/a4.raml"));
    })
    it ("annotations5" ,function(){
        testErrors(util.data("parser/annotations/a5.raml"), ["Required property: y is missed"]);
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
        testErrors(util.data("parser/annotations/a9.raml"), ["Required property: ee is missed"]);
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
        testErrors(util.data("parser/annotations/a17.raml"), ["object is expected","Header 'header1' already exists","Header 'header1' already exists"]);
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
    it ("properties shortcut" ,function(){
        testErrors(util.data("parser/typexpressions/p.raml"));
    })
    it ("status" ,function(){
        testErrors(util.data("parser/status/s1.raml"),["Status code should be \\w+ digits number with optional '\\w+' as wildcards"]);
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
        testErrors(util.data("parser/typexpressions/tr3.raml"),["recurrent type as an option of union type", "recurrent type as an option of union type"]);
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
        testErrors(util.data("parser/typexpressions/tr7.raml"),["Required property: element is missed"]);
    })
    it ("inplace types 00" ,function(){
        testErrors(util.data("parser/typexpressions/tr8.raml"),["object is expected"]);//Ok for now lets improve later
    })
    it ("unique keys" ,function(){
        testErrors(util.data("parser/typexpressions/tr9.raml"),["Keys should be unique"]);//Ok for now lets improve later
    })
    it ("runtime types value" ,function(){
        testErrors(util.data("parser/typexpressions/tr10.raml"),["Required property: y is missed"]);//Ok for now lets improve later
    })
    it ("runtime types value1" ,function(){
        testErrors(util.data("parser/typexpressions/tr11.raml"),["object is expected"]);//Ok for now lets improve later
    })
    it ("runtime types value2" ,function(){
        testErrors(util.data("parser/typexpressions/tr12.raml"));//Ok for now lets improve later
    })
    it ("r2untime types value2" ,function(){
        testErrorsByNumber(util.data("parser/typexpressions/tr13.raml"),1,1);//Ok for now lets improve later
    })
    //No more signatures
    //it ("signatures with inherited classes" ,function(){
    //    testErrors(util.data("parser/typexpressions/ct1.raml"));//Ok for now lets improve later
    //})
    it ("custom api" ,function(){
        testErrors(util.data("parser/custom/api.raml"), ["Missing required property title"]);//Ok for now lets improve later
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
        testErrors(util.data("parser/facets/f3.raml"),["redefining a built in type:date"]);
    })
    //it ("recursive includes" ,function(){
    //    testErrors(util.data("parser/recursive/r1.raml"));
    //})
    it ("custom facets validator" ,function(){
        testErrors(util.data("commonLibrary/api.raml"), ["string is expected","string is expected","Issues in the used library:./common.raml"]);
    })
    it ("custom facets validator2" ,function(){
        testErrors(util.data("commonLibrary/api2.raml"),["issues in the used library:./common.raml"]);
    })
    //it ("custom facets validator3" ,function(){
    //    testErrors(util.data("commonLibrary/api3.raml"), ["object is expected ../../../src/raml1/test/data/commonLibrary/common.raml"]);
    //})
    it ("overloading1" ,function(){
        testErrors(util.data("parser/overloading/o1.raml"),["Method 'get' already exists","Method 'get' already exists"]);
    })
    it ("overloading2" ,function(){
        testErrors(util.data("parser/overloading/o2.raml"),["Resources share same URI","Resources share same URI"]);
    })
    it ("overloading3" ,function(){
        testErrors(util.data("parser/overloading/o3.raml"),["Resources share same URI","Resources share same URI"]);
    })
    it ("overloading4" ,function(){
        testErrors(util.data("parser/overloading/o4.raml"),["Resources share same URI","Resources share same URI"]);
    })
    it ("overloading5" ,function(){
        testErrors(util.data("parser/overloading/o5.raml"),["Resources share same URI","Resources share same URI"]);
    })
    it ("overloading6" ,function(){
        testErrors(util.data("parser/overloading/o6.raml"), ["Resources share same URI","Resources share same URI"]);
    })
    it ("overloading7" ,function(){
        testErrors(util.data("parser/overloading/o7.raml"),["Resources share same URI","Resources share same URI"]);
    })

    //TODO fix test after bug fix.
    it ("override1" ,function(){
        testErrors(util.data("parser/inheritance/i1.raml"), ["Restrictions conflict"]);
    })
    it ("override2" ,function(){
        testErrors(util.data("parser/inheritance/i2.raml"),["facet :q can not be overriden"]);
    })
    it ("override3" ,function(){
        testErrors(util.data("parser/inheritance/i3.raml"));
    })
    it ("overlay1" ,function(){
        testErrors(util.data("parser/overlay/o1/NewOverlay.raml"));
    })
    it ("overlay2" ,function(){
        testErrors(util.data("parser/overlay/o2/NewOverlay.raml"),["This node does not override any node from master api:\\.env-org-pair2"]);
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
        testErrors(util.data("parser/overlay/o18/NewOverlay.raml"), ["Property version is not allowed to be overriden or added in overlays"]);
    })
    it ("Overlay: sub-level illegal property" ,function(){
        testErrors(util.data("parser/overlay/o19/NewOverlay.raml"), ["Property default is not allowed to be overriden or added in overlays"]);
    })
    it ("Overlay: top-level illegal node" ,function(){
        testErrors(util.data("parser/overlay/o20/NewOverlay.raml"),["This node does not override any node from master api:\\./resource2"]);
    })
    it ("Overlay: sub-level illegal node 1" ,function(){
        testErrors(util.data("parser/overlay/o21/NewOverlay.raml"),["This node does not override any node from master api:\\./resource\\./resource2"]);
    })
    it ("Overlay: sub-level illegal node 2" ,function(){
        testErrors(util.data("parser/overlay/o22/NewOverlay.raml"),["This node does not override any node from master api:\\./resource\\.post"]);
    })

    it ("Security Scheme Fragment: new security scheme" ,function(){
        testErrors(util.data("parser/securityschemefragments/ss1/securitySchemeFragment.raml"));
    })

    it ("library is not user class" ,function(){
        testErrors(util.data("parser/raml/raml.raml"),["Issues in the used library:../sds/sds.raml"]);
    })
    it ("library from christian" ,function(){
        testErrors(util.data("parser/libraries/christian/api.raml"));
    })
    it ("library in resource type fragment" ,function(){
        testErrors(util.data("parser/libraries/fragment/api.raml"));
    })
    it ("more complex union types1",function(){
            testErrors(util.data("parser/union/apigateway-aws-overlay.raml"));

    })
    it ("more complex union types2",function(){
        testErrors(util.data("parser/union/unionSample.raml"));

    })
    it ("external 1" ,function(){
        testErrors(util.data("parser/external/e1.raml"),["Example does not conform to schema:Content is not valid according to schema:Missing required property: \\w+ \\w+"]);
    })
    it ("external 2" ,function(){
        testErrors(util.data("parser/external/e2.raml"));
    })

    it ("external 3" ,function(){
        testErrors(util.data("parser/external/e3.raml"),["Example does not conform to schema:Content is not valid according to schema:Expected type \\w+ but found type \\w+ \\w+,\\w+"]);
    })
    it ("external 4" ,function(){
        testErrors(util.data("parser/external/e4.raml"),["Example does not conform to schema:Content is not valid according to schema:Missing required property: \\w+ \\w+"]);
    })
    it ("external 5" ,function(){
        testErrors(util.data("parser/external/e5.raml"));
    })
});

describe('JSON schemes tests', function () {
    it("JSON Scheme test 1" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test1/apiValid.raml"), 0);
    })
    it("JSON Scheme test 2" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test1/apiInvalid.raml"), 1);
    })
    it("JSON Scheme test 3" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test2/apiValid.raml"), 0);
    })
    it("JSON Scheme test 4" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test2/apiInvalid.raml"), 1);
    })
    it("JSON Scheme test 5" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test3/apiValid.raml"), 0);
    })
    it("JSON Scheme test 6" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test3/apiInvalid.raml"), 1);
    })
    it("JSON Scheme test 7" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test4/apiValid.raml"), 0);
    })
    it("JSON Scheme test 8" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test4/apiInvalid.raml"), 1);
    })
    it("JSON Scheme test 9" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test5/apiValid.raml"), 0);
    })
    it("JSON Scheme test 10" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test5/apiInvalid.raml"), 1);
    })
    it("JSON Scheme test 11" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test6/apiValid.raml"), 0);
    })
    it("JSON Scheme test 12" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test6/apiInvalid.raml"), 1);
    })
    it("JSON Scheme test 13" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test7/apiValid.raml"), 0);
    })
    it("JSON Scheme test 14" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test7/apiInvalid.raml"), 1);
    })
    it("JSON Scheme test 15" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test8/apiValid.raml"), 0);
    })
    it("JSON Scheme test 16" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test8/apiInvalid.raml"), 1);
    })
    it("JSON Scheme test 17" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test9/apiValid.raml"), 0);
    })
    it("JSON Scheme test 18" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test9/apiInvalid.raml"), 1);
    })
    it("JSON Scheme test 19" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test10/apiValid.raml"), 0);
    })
    it("JSON Scheme test 20" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test10/apiInvalid.raml"), 1);
    })
    it("JSON Scheme test 21" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test11/apiValid.raml"), 0);
    })
    it("JSON Scheme test 22" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/jsonscheme/test11/apiInvalid.raml"), 1);
    })
});

describe("Include tests + typesystem",function (){
    it("Include test" ,function() {
        this.timeout(15000);
        testErrorsByNumber(util.data("parser/include/includeTypes.raml"), 0);
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
        testErrors(util.data("parser/propertyOverride/test1.raml"));
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
        testErrors(util.data("parser/propertyOverride/test7.raml"), ["Can not override required property:testProperty to be optional"]);
    });

    it ("Value type properties 4",function(){
        testErrors(util.data("parser/propertyOverride/test8.raml"));
    });

    it ("Facet override",function(){
        testErrors(util.data("parser/propertyOverride/test9.raml"), ["test can not be overriden","missing required facets"]);
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
});
describe('Line mapper tests',function() {
    it("Test that columns and line numbers start from 1", function () {
        testErrorsWithLineNumber(util.data("parser/lineNumbers/t1.raml"),3,0);
    });
    it("Test that columns and line numbers start from 1 another incarnation", function () {
        testErrorsWithLineNumber(util.data("parser/lineNumbers/t2.raml"),2,0);
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
    it('AnnotationTypeDeclaration loading', function () {
        testErrorsByNumber(util.data("parser/fragment/AnnotationTypeDeclaration.raml"), 0);
    });
});

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

        var unitContents = api.lowLevel().unit().contents();
        console.log("Actual errors:");

        errors.forEach(error=>console.log(error.message + " : " + unitContents.substr(error.start, error.end-error.start)));
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

