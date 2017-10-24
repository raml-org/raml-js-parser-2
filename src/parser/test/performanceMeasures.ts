import util = require("./performance/util");

var caseNames =[
    "FULL_LIFECYCLE",
    "LOADING",
    "EXPANDING_WITH_LIBS",
    "TO_JSON_WITH_ERRORS",
    "TO_JSON_WITHOUT_ERRORS",
    "TO_JSON_WITHOUT_ERRORS_TRAVERSED_LIGHTLY",
    "TO_JSON_WITH_ERRORS_TRAVERSED_LIGHTLY",
    "TO_JSON_WITHOUT_ERRORS_TRAVERSED_HEAVILY",
    "TO_JSON_WITH_ERRORS_TRAVERSED_HEAVILY",
    "ERRORS_UNEXPANDED",
    "ERRORS_EXPANDED_WITHOUT_LIBS",
    "ERRORS_EXPANDED_WITH_LIBS",
    "EXPANDING_WITHOUT_LIBS"
];

util.startCollectingData();

caseNames.forEach(caseName => {
    util.doMeasure("Jira-v2/api.raml", caseName);
    util.doMeasure("LinkedIn-v1/api.raml", caseName);
    util.doMeasure("MarketingCloudAPIServices-v1/api.raml", caseName);
    util.doMeasure("Z_System_API-v1.0.0.1/Z_System_API-v1.0.0/api.raml", caseName);
    util.doMeasure("Zendesk-v2/api.raml", caseName);
    util.doMeasure("huge_api/api.raml", caseName, "initial version");
    util.doMeasure("huge_api_0/api.raml", caseName, "refactored version(libraries instead of thouthands of includes)");
    util.doMeasure("huge_api_1/api.raml", caseName, "without resources");
    util.doMeasure("huge_api_2/api.raml", caseName, "without resources, without primitives");
    util.doMeasure("huge_api_3/api.raml", caseName, "without resources, without primitives, simplified elements");
    util.doMeasure("huge_api_4/api.raml", caseName, "without resources, without primitives, simplified elements, removed params in traits and resource types");
    util.doMeasure("huge_api_5/api.raml", caseName, "without resources, without primitives, simplified elements, removed params in traits and resource types, yaml removed");
    util.doMeasure("huge_api_6/api.raml", caseName, "without resources, without primitives, simplified elements, removed params in traits and resource types, yaml removed, dataTypes removed");
    util.doMeasure("huge_api_7/api.raml", caseName, "without resources, without primitives, simplified elements, dataTypes only");
    
    console.log();
});

util.printData();