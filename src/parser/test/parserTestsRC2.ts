import assert = require("assert")
import ll=require("../lowLevelAST")
import yll=require("../jsyaml/jsyaml2lowLevel")
import hl=require("../highLevelAST")
import util = require("./test-utils")
import tools = require("./testTools")
import parserTests = require("./parserTests")

import apiLoader = require("../apiLoader")


//describe('Low level model', function() {
describe('Resource type parameters tests',function(){
    this.timeout(15000);
    it ("Resource type parameters test 1",function(){
        parserTests.testErrors(util.data("../data/rc2/resourceTypeParamsPositive.raml"));
    });

    it ("Resource type parameters test 1",function(){
        parserTests.testErrors(util.data("../data/rc2/resourceTypeParamsNegative.raml"),
            ["Value is not provided for parameter: 'TextAbout'"]);
    });

    it ("Resource type parameters test 3",function(){
        parserTests.testErrors(util.data("../data/rc2/resourceTypeParamsPositive2.raml"));
    });

    // it ("Resource type parameters test 4",function(){
    //     parserTests.testErrors(util.data("../data/rc2/resourceTypeParamsNegative2.raml"),
    //         ["value was not provided for parameter: TextAbout"]);
    // });

    it ("Resource type parameters test 5",function(){
        parserTests.testErrors(util.data("../data/rc2/resourceTypeParamsPositive3.raml"));
    });

    it ("Resource type parameters test 6",function(){
        parserTests.testErrors(util.data("../data/rc2/resourceTypeParamsNegative3.raml"),
            ["Value is not provided for parameter: 'Param1'"]);
    });
});

describe('External type facets tests',function(){
    this.timeout(15000);
    //json schema tests

    it ("JSON External type facets test 1",function(){
        parserTests.testErrors(util.data("../data/rc2/jsonSchemaPositive1.raml"));
    });

    it ("JSON External type facets test 2",function(){
        parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative1.raml"),
        ["'properties' facet is prohibited for external types"]);
    });

    it ("JSON External type facets test 3",function(){
        parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative2.raml"),
            ["minLength facet can only be used with string and file types"]);
    });

    // it ("JSON External type facets test 4",function(){
    //     parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative3.raml"),
    //         ["specifying unknown facet:facets"]);
    // });

    it ("JSON External type facets test 5",function(){
        parserTests.testErrors(util.data("../data/rc2/jsonSchemaPositive2.raml"));
    });

    it ("JSON External type facets test 6",function(){
        parserTests.testErrors(util.data("../data/rc2/jsonSchemaPositive3.raml"));
    });

    // it ("JSON External type facets test 7",function(){
    //     parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative4.raml"),
    //         ["It is not allowed to mix RAML types with externals : TestType"]);
    // });

    it ("JSON External type facets test 8",function(){
        parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative5.raml"),
            ["It is not allowed to mix RAML types with externals"]);
    });

    it ("JSON External type facets test 9",function(){
        parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative6.raml"),
            ["It is not allowed to use external types in component type definitions"]);
    });

    // it ("JSON External type facets test 10",function(){
    //     parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative7.raml"),
    //         ["It is not allowed to mix RAML types with externals"]);
    // });

    it ("JSON External type facets test 11",function(){
        parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative8.raml"),
            ["It is not allowed to use external types in property definitions"]);
    });

    // it ("JSON External type facets test 12",function(){
    //     parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative9.raml"),
    //         ["It is not allowed to mix RAML types with externals"]);
    // });

    it ("JSON External type facets test 13",function(){
        parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative10.raml"),
            ["It is not allowed to use external types in property definitions"]);
    });

    it ("JSON External type facets test 14",function(){
        parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative11.raml"),
            ["It is not allowed to use external types in property definitions"]);
    });

    // it ("JSON External type facets test 15",function(){
    //     parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative12.raml"),
    //         ["It is not allowed to use external types in property definitions"]);
    // });

    // it ("JSON External type facets test 16",function(){
    //     parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative13.raml"),
    //         ["It is not allowed to use external types in property definitions"]);
    // });

    // it ("JSON External type facets test 17",function(){
    //     parserTests.testErrors(util.data("../data/rc2/jsonSchemaNegative14.raml"),
    //         ["It is not allowed to use external types in property definitions"]);
    // });

    ///////////////////
    //xsd schema tests
    ///////////////////

    it ("XSD External type facets test 1",function(){
        parserTests.testErrors(util.data("../data/rc2/xsdSchemaPositive1.raml"));
    });

    it ("XSD External type facets test 2",function(){
        parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative1.raml"),
            ["'properties' facet is prohibited for external types"]);
    });

    it ("XSD External type facets test 3",function(){
        parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative2.raml"),
            ["minLength facet can only be used with string and file types"]);
    });

    // it ("XSD External type facets test 4",function(){
    //     parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative3.raml"),
    //         ["specifying unknown facet:facets"]);
    // });

    it ("XSD External type facets test 5",function(){
        parserTests.testErrors(util.data("../data/rc2/xsdSchemaPositive2.raml"));
    });

    it ("XSD External type facets test 6",function(){
        parserTests.testErrors(util.data("../data/rc2/xsdSchemaPositive3.raml"));
    });

    // it ("XSD External type facets test 7",function(){
    //     parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative4.raml"),
    //         ["It is not allowed to mix RAML types with externals : TestType"]);
    // });

    it ("XSD External type facets test 8",function(){
        parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative5.raml"),
            ["It is not allowed to mix RAML types with externals"]);
    });

    it ("XSD External type facets test 9",function(){
        parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative6.raml"),
            ["It is not allowed to use external types in component type definitions"]);
    });

    // it ("XSD External type facets test 10",function(){
    //     parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative7.raml"),
    //         ["It is not allowed to mix RAML types with externals"]);
    // });

    it ("XSD External type facets test 11",function(){
        parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative8.raml"),
            ["It is not allowed to use external types in property definitions"]);
    });

    // it ("XSD External type facets test 12",function(){
    //     parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative9.raml"),
    //         ["It is not allowed to mix RAML types with externals"]);
    // });

    it ("XSD External type facets test 13",function(){
        parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative10.raml"),
            ["It is not allowed to use external types in property definitions"]);
    });

    it ("XSD External type facets test 14",function(){
        parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative11.raml"),
            ["It is not allowed to use external types in property definitions"]);
    });

    // it ("XSD External type facets test 15",function(){
    //     parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative12.raml"),
    //         ["It is not allowed to use external types in property definitions"]);
    // });
    //
    // it ("XSD External type facets test 16",function(){
    //     parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative13.raml"),
    //         ["It is not allowed to use external types in property definitions"]);
    // });
    //
    // it ("XSD External type facets test 17",function(){
    //     parserTests.testErrors(util.data("../data/rc2/xsdSchemaNegative14.raml"),
    //         ["It is not allowed to use external types in property definitions"]);
    // });
});

describe('Inplace types',function(){
    this.timeout(15000);
    it ("Inplace types 1",function(){
        parserTests.testErrors(util.data("../data/rc2/inplaceTypesPositive1.raml"));
    });

    it ("Inplace types 2",function(){
        parserTests.testErrors(util.data("../data/rc2/inplaceTypesPositive2.raml"));
    });

    it ("Inplace types 3",function(){
        parserTests.testErrors(util.data("../data/rc2/inplaceTypesPositive3.raml"));
    });

    it ("Inplace types 4",function(){
        parserTests.testErrors(util.data("../data/rc2/inplaceTypesPositive4.raml"));
    });

    it ("Inplace types 5",function(){
        parserTests.testErrors(util.data("../data/rc2/inplaceTypesPositive5.raml"));
    });

    it ("Inplace types 6",function(){
        parserTests.testErrors(util.data("../data/rc2/inplaceTypesNegative1.raml"),
            ["Required property 'name2' is missing"]);
    });
});