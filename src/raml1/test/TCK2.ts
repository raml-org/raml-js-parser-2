/**
 * ATTENTION !!! The file is generated. Manual changes will be overridden by the nearest build.
 */
/// <reference path="../../../typings/main.d.ts" />
import tckUtil = require("./scripts/tckUtil")

describe('Complete TCK Test Set',function(){

describe('RAML08',function(){
    
    it("Instagram", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Instagram/api.raml");
    });
    
});

describe('RAML08/Bodies',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Bodies/test001/api.raml");
    });
    
});

describe('RAML08/Examples',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Examples/test001/api.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Examples/test002/api.raml");
    });
    
});

describe('RAML08/Form Parameters',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Form Parameters/test001/api.raml");
    });
    
});

describe('RAML08/MediaTypes',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/MediaTypes/test001/api.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/MediaTypes/test002/api.raml");
    });
    
});

describe('RAML08/MethodResponses',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/MethodResponses/test001/methResp06.raml");
    });
    
});

describe('RAML08/ResourceTypes',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/ResourceTypes/test001/apiInvalid.raml");
    });

    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/ResourceTypes/test001/apiValid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/ResourceTypes/test002/apiInvalid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/ResourceTypes/test002/apiValid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/ResourceTypes/test003/apiInvalid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/ResourceTypes/test003/apiValid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/ResourceTypes/test004/apiInvalid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/ResourceTypes/test004/apiValid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/ResourceTypes/test005/apiInvalid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/ResourceTypes/test005/apiValid.raml");
    });
    
});

describe('RAML08/SecuritySchemes',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/SecuritySchemes/test001/apiInvalid.raml");
    });

    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/SecuritySchemes/test001/apiValid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/SecuritySchemes/test002/apiInvalid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/SecuritySchemes/test002/apiValid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/SecuritySchemes/test003/apiInvalid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/SecuritySchemes/test003/apiValid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/SecuritySchemes/test004/apiInvalid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/SecuritySchemes/test004/apiValid.raml");
    });
    
});

describe('RAML08/Traits',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Traits/test001/apiInvalid.raml");
    });

    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Traits/test001/apiValid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Traits/test002/apiInvalid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Traits/test002/apiValid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Traits/test003/apiInvalid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Traits/test003/apiValid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Traits/test004/apiInvalid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/Traits/test004/apiValid.raml");
    });
    
});

describe('RAML08/https',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML08/https/test001/api.raml");
    });
    
});

describe('RAML10',function(){
    
    it("Instagram1.0", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Instagram1.0/api.raml");
    });
    
});

describe('RAML10/Annotations',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test001/apiInvalid.raml");
    });

    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test001/apiValid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test002/apiInvalid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test002/apiValid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test003/apiInvalid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test003/apiValid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test004/apiInvalid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test004/apiValid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test005/apiInvalid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test005/apiValid.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test006/apiInvalid.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test006/apiValid.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test007/apiInvalid.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test007/apiValid.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test008/apiInvalid.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test008/apiValid.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test009/apiInvalid.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test009/apiValid.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test010/apiInvalid.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test010/apiValid.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test011/apiInvalid.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test011/apiValid.raml");
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test012/apiInvalid.raml");
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test012/apiValid.raml");
    });

    it("test013", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test013/apiInvalid.raml");
    });

    it("test013", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test013/apiValid.raml");
    });

    it("test014", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test014/apiInvalid.raml");
    });

    it("test014", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test014/apiValid.raml");
    });

    it("test015", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test015/apiInvalid.raml");
    });

    it("test015", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test015/apiValid.raml");
    });

    it("test016", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test016/apiInvalid.raml");
    });

    it("test016", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test016/apiValid.raml");
    });

    it("test017", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test017/apiInvalid.raml");
    });

    it("test017", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test017/apiValid.raml");
    });

    it("test018", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test018/apiInvalid.raml");
    });

    it("test018", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test018/apiValid.raml");
    });

    it("test019", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test019/apiInvalid.raml");
    });

    it("test019", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test019/apiValid.raml");
    });

    it("test020", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test020/apiInvalid.raml");
    });

    it("test020", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test020/apiValid.raml");
    });

    it("test021", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test021/apiInvalid.raml");
    });

    it("test021", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test021/apiValid.raml");
    });

    it("test022", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test022/apiInvalid.raml");
    });

    it("test022", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test022/apiValid.raml");
    });

    it("test023", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test023/apiInvalid.raml");
    });

    it("test023", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test023/apiValid.raml");
    });

    it("test024", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test024/apiInvalid.raml");
    });

    it("test024", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test024/apiValid.raml");
    });

    it("test025", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test025/apiInvalid.raml");
    });

    it("test025", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test025/apiValid.raml");
    });

    it("test026", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test026/apiInvalid.raml");
    });

    it("test026", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test026/apiValid.raml");
    });

    it("test027", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test027/api.raml");
    });

    it("test028", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test028/api.raml");
    });

    it("test029", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Annotations/test029/api.raml");
    });
    
});

describe('RAML10/Api',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test001/api.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test002/api.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test003/api.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test004/api.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test005/api.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test006/api.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test007/api.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test008/api.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test009/api.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test010/api.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test011/api.raml");
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test012/api.raml");
    });

    it("test013", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test013/api.raml");
    });

    it("test014", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test014/api.raml");
    });

    it("test015", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test015/api.raml");
    });

    it("test016", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test016/api.raml");
    });

    it("test017", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test017/api.raml");
    });

    it("test018", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test018/api.raml");
    });

    it("test019", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test019/api.raml");
    });

    it("test020", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test020/api.raml");
    });

    it("test021", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test021/api.raml");
    });

    it("test022", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test022/api.raml");
    });

    it("test023", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test023/api.raml");
    });

    it("test024", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test024/api.raml");
    });

    it("test025", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test025/api.raml");
    });

    it("test026", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test026/api.raml");
    });

    it("test027", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test027/api.raml");
    });

    it("test028", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test028/api.raml");
    });

    it("test029", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Api/test029/api.raml");
    });
    
});

describe('RAML10/Examples',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test001/api.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test002/api.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test003/api.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test004/api.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test005/api.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test006/api.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test007/api.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test008/api.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test009/api.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test010/api.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test011/api.raml");
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test012/api.raml");
    });

    it("test013", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test013/api.raml");
    });

    it("test014", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test014/api.raml");
    });

    it("test015", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test015/api.raml");
    });

    it("test016", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test016/api.raml");
    });

    it("test017", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test017/api.raml");
    });

    it("test018", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test018/api.raml");
    });

    it("test019", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test019/api.raml");
    });

    it("test020", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test020/api.raml");
    });

    it("test021", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test021/api.raml");
    });

    it("test022", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test022/api.raml");
    });

    it("test023", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test023/api.raml");
    });

    it("test024", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test024/api.raml");
    });

    it("test025", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test025/api.raml");
    });

    it("test026", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test026/api.raml");
    });

    it("test027", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test027/api.raml");
    });

    it("test028", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test028/api.raml");
    });

    it("test029", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test029/api.raml");
    });

    it("test030", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test030/api.raml");
    });

    it("test031", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test031/api.raml");
    });

    it("test032", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test032/api.raml");
    });

    it("test033", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test033/api.raml");
    });

    it("test034", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test034/api.raml");
    });

    it("test035", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test035/api.raml");
    });

    it("test036", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test036/api.raml");
    });

    it("test037", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test037/api.raml");
    });

    it("test038", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test038/api.raml");
    });

    it("test039", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test039/api.raml");
    });

    it("test040", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test040/api.raml");
    });

    it("test041", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test041/api.raml");
    });

    it("test042", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test042/api.raml");
    });

    it("test043", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test043/api.raml");
    });

    it("test044", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test044/api.raml");
    });

    it("test045", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test045/api.raml");
    });

    it("test046", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test046/api.raml");
    });

    it("test047", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test047/api.raml");
    });

    it("test048", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test048/api.raml");
    });

    it("test049", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test049/api.raml");
    });

    it("test050", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test050/api.raml");
    });

    it("test051", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/test051/api.raml");
    });
    
});

describe('RAML10/Examples/raml1/overlays&extensions',function(){
    
    it("extension", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/raml1/overlays&extensions/extension/extension.raml", null, "TCK/RAML10/Examples/raml1/overlays&extensions/extension/master-tck.json");
    });

    it("overlay", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Examples/raml1/overlays&extensions/overlay/slave.raml", null, "TCK/RAML10/Examples/raml1/overlays&extensions/overlay/master-tck.json");
    });
    
});

describe('RAML10/Fragments',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Fragments/test001/fragment.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Fragments/test002/securitySchemeFragment.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Fragments/test003/AnnotationTypeDeclaration.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Fragments/test004/DataType.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Fragments/test005/Trait.raml");
    });
    
});

describe('RAML10/Libraries',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Libraries/test001/api.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Libraries/test002/api.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Libraries/test003/index.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Libraries/test004/api.raml");
    });
    
});

describe('RAML10/MediaTypes',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/MediaTypes/test001/api.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/MediaTypes/test002/api.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/MediaTypes/test003/api.raml");
    });
    
});

describe('RAML10/MethodResponses',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/MethodResponses/test001/methResp01.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/MethodResponses/test002/methResp02.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/MethodResponses/test003/methResp03.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/MethodResponses/test004/methResp04.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/MethodResponses/test005/methResp05.raml");
    });
    
});

describe('RAML10/Methods',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test001/meth01.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test002/meth02.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test003/meth03.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test004/meth04.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test005/meth05.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test006/meth06.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test007/meth07.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test008/meth08.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test009/meth09.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test010/meth10.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test011/meth11.raml");
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Methods/test012/meth12.raml");
    });
    
});

describe('RAML10/OptionalTemplateParameters',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/OptionalTemplateParameters/test001/api01.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/OptionalTemplateParameters/test002/api02.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/OptionalTemplateParameters/test003/api03.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/OptionalTemplateParameters/test004/api04.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/OptionalTemplateParameters/test005/api05.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/OptionalTemplateParameters/test006/api06.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/OptionalTemplateParameters/test007/api07.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/OptionalTemplateParameters/test008/api08.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/OptionalTemplateParameters/test009/api09.raml");
    });
    
});

describe('RAML10/Overlays',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test001/NewOverlay.raml", null, "TCK/RAML10/Overlays/test001/api-tck.json");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test002/NewOverlay.raml", null, "TCK/RAML10/Overlays/test002/api-tck.json");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test003/NewOverlay.raml", null, "TCK/RAML10/Overlays/test003/api-tck.json");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test004/NewOverlay.raml", null, "TCK/RAML10/Overlays/test004/api-tck.json");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test005/NewOverlay.raml", null, "TCK/RAML10/Overlays/test005/api-tck.json");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test006/NewOverlay.raml", null, "TCK/RAML10/Overlays/test006/api-tck.json");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test007/NewOverlay.raml", null, "TCK/RAML10/Overlays/test007/api-tck.json");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test008/NewOverlay.raml", null, "TCK/RAML10/Overlays/test008/api-tck.json");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test009/api.raml", [ "TCK/RAML10/Overlays/test009/NewOverlay.raml", "TCK/RAML10/Overlays/test009/NewOverlay2.raml" ]);
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test010/api.raml", [ "TCK/RAML10/Overlays/test010/NewOverlay.raml", "TCK/RAML10/Overlays/test010/NewExtension2.raml" ]);
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test011/api.raml", [ "TCK/RAML10/Overlays/test011/NewOverlay.raml", "TCK/RAML10/Overlays/test011/NewExtension2.raml", "TCK/RAML10/Overlays/test011/NewExtension3.raml" ]);
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test012/NewOverlay.raml", null, "TCK/RAML10/Overlays/test012/api-tck.json");
    });

    it("test013", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test013/NewOverlay.raml", null, "TCK/RAML10/Overlays/test013/api-tck.json");
    });

    it("test014", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test014/NewOverlay.raml", null, "TCK/RAML10/Overlays/test014/api-tck.json");
    });

    it("test015", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test015/NewOverlay.raml", null, "TCK/RAML10/Overlays/test015/api-tck.json");
    });

    it("test016", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test016/NewOverlay.raml", null, "TCK/RAML10/Overlays/test016/api-tck.json");
    });

    it("test017", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test017/NewOverlay.raml", null, "TCK/RAML10/Overlays/test017/api-tck.json");
    });

    it("test018", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test018/NewOverlay.raml", null, "TCK/RAML10/Overlays/test018/api-tck.json");
    });

    it("test019", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test019/NewOverlay.raml", null, "TCK/RAML10/Overlays/test019/api-tck.json");
    });

    it("test020", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test020/NewOverlay.raml", null, "TCK/RAML10/Overlays/test020/api-tck.json");
    });

    it("test021", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test021/NewOverlay.raml", null, "TCK/RAML10/Overlays/test021/api-tck.json");
    });

    it("test022", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test022/NewOverlay.raml", null, "TCK/RAML10/Overlays/test022/api-tck.json");
    });

    it("test023", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test023/api.raml", [ "TCK/RAML10/Overlays/test023/NewOverlay.raml", "TCK/RAML10/Overlays/test023/NewOverlay2.raml" ]);
    });

    it("test024", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test024/api.raml", [ "TCK/RAML10/Overlays/test024/NewOverlay.raml", "TCK/RAML10/Overlays/test024/NewOverlay2.raml" ]);
    });

    it("test025", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test025/api.raml", [ "TCK/RAML10/Overlays/test025/NewOverlay.raml", "TCK/RAML10/Overlays/test025/NewOverlay2.raml" ]);
    });

    it("test026", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test026/apigateway-aws-overlay.raml", null, "TCK/RAML10/Overlays/test026/apigateway-tck.json");
    });

    it("test027", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test027/overlay.raml", null, "TCK/RAML10/Overlays/test027/api-tck.json");
    });

    it("test028", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Overlays/test028/overlay.raml", null, "TCK/RAML10/Overlays/test028/api-tck.json");
    });
    
});

describe('RAML10/ResourceTypes',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test001/apiValid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test002/apiValid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test003/apiInvalid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test003/apiValid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test004/apiInvalid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test004/apiValid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test005/apiInvalid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test005/apiValid.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test006/apiInvalid.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test006/apiValid.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test007/apiInvalid.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test007/apiValid.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test008/apiInvalid.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test008/apiValid.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test009/apiInvalid.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test009/apiValid.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test010/apiInvalid.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test010/apiValid.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test011/apiInvalid.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/ResourceTypes/test011/apiValid.raml");
    });
    
});

describe('RAML10/Resources',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test001/apiInvalid.raml");
    });

    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test001/apiValid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test002/apiInvalid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test002/apiValid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test003/apiInvalid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test003/apiValid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test004/apiInvalid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test004/apiValid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test005/apiInvalid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test005/apiValid.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test006/apiInvalid.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test006/apiValid.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test007/apiInvalid.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test007/apiValid.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test008/apiInvalid.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test008/apiValid.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test009/apiInvalid.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test009/apiValid.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test010/apiInvalid.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test010/apiValid.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test011/apiInvalid.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test011/apiValid.raml");
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test012/apiInvalid.raml");
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test012/apiValid.raml");
    });

    it("test013", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test013/apiInvalid.raml");
    });

    it("test013", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test013/apiValid.raml");
    });

    it("test014", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test014/apiInvalid.raml");
    });

    it("test014", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test014/apiValid.raml");
    });

    it("test015", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test015/apiInvalid.raml");
    });

    it("test015", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test015/apiValid.raml");
    });

    it("test016", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Resources/test016/apiInValid.raml");
    });
    
});

describe('RAML10/Responses',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Responses/test001/api.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Responses/test002/api.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Responses/test003/api.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Responses/test004/api.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Responses/test005/api.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Responses/test006/api.raml");
    });
    
});

describe('RAML10/SecuritySchemes',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/SecuritySchemes/test001/apiInvalid.raml");
    });

    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/SecuritySchemes/test001/apiValid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/SecuritySchemes/test002/apiInvalid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/SecuritySchemes/test002/apiValid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/SecuritySchemes/test003/apiInvalid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/SecuritySchemes/test003/apiValid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/SecuritySchemes/test004/apiInvalid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/SecuritySchemes/test004/apiValid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/SecuritySchemes/test005/apiInvalid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/SecuritySchemes/test005/apiValid.raml");
    });
    
});

describe('RAML10/TemplateTransformers',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/TemplateTransformers/test001/t1.raml");
    });
    
});

describe('RAML10/Traits',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Traits/test001/apiInvalid.raml");
    });

    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Traits/test001/apiValid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Traits/test002/apiInvalid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Traits/test002/apiValid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Traits/test003/apiInvalid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Traits/test003/apiValid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Traits/test004/apiInvalid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Traits/test004/apiValid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Traits/test005/api.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Traits/test006/api.raml");
    });
    
});

describe('RAML10/Types',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test001/apiValid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test002/apiInvalid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test002/apiValid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test003/apiInvalid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test003/apiValid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test004/apiInvalid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test004/apiValid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test005/apiInvalid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test005/apiValid.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test006/apiInvalid.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test006/apiValid.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test007/apiInvalid.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test007/apiValid.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test008/apiInvalid.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test008/apiValid.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test009/apiInvalid.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test009/apiValid.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test010/apiValid.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test011/apiValid.raml");
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test012/apiInvalid.raml");
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test012/apiValid.raml");
    });

    it("test013", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test013/apiInvalid.raml");
    });

    it("test013", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test013/apiValid.raml");
    });

    it("test014", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test014/apiInvalid.raml");
    });

    it("test015", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test015/apiInvalid.raml");
    });

    it("test016", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test016/apiInvalid.raml");
    });

    it("test017", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test017/apiInvalid.raml");
    });

    it("test018", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test018/api.raml");
    });

    it("test019", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test019/api.raml");
    });

    it("test020", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test020/api.raml");
    });

    it("test021", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test021/api.raml");
    });

    it("test022", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test022/api.raml");
    });

    it("test023", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test023/api.raml");
    });

    it("test024", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test024/api.raml");
    });

    it("test025", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test025/api.raml");
    });

    it("test026", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/test026/api.raml");
    });
    
});

describe('RAML10/Types/External Types',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/External Types/test001/api.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/External Types/test002/api.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/External Types/test003/api.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/External Types/test004/api.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/External Types/test005/api.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/External Types/test006/api.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/External Types/test007/api.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/External Types/test008/api.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/External Types/test009/api.raml");
    });
    
});

describe('RAML10/Types/Facets',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Facets/test001/api.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Facets/test002/api.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Facets/test003/api.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Facets/test004/api.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Facets/test005/api.raml");
    });
    
});

describe('RAML10/Types/ObjectTypes',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test001/oType01.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test002/oType02.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test003/oType03.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test004/oType04.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test005/oType05.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test006/oType06.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test007/oType07.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test008/oType08.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test009/oType09.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test010/oType10.raml");
    });

    it("test011", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test011/oType11.raml");
    });

    it("test012", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test012/oType12.raml");
    });

    it("test013", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test013/oType13.raml");
    });

    it("test014", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test014/oType14.raml");
    });

    it("test015", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test015/oType15.raml");
    });

    it("test016", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test016/oType16.raml");
    });

    it("test017", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/ObjectTypes/test017/oType17.raml");
    });
    
});

describe('RAML10/Types/PropertyOverride',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/PropertyOverride/test001/test1.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/PropertyOverride/test002/test2.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/PropertyOverride/test003/test3.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/PropertyOverride/test004/test4.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/PropertyOverride/test005/test5.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/PropertyOverride/test006/test6.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/PropertyOverride/test007/test7.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/PropertyOverride/test008/test8.raml");
    });

    it("test009", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/PropertyOverride/test009/test9.raml");
    });

    it("test010", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/PropertyOverride/test010/test10.raml");
    });
    
});

describe('RAML10/Types/Type Expressions',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Type Expressions/test001/api.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Type Expressions/test002/api.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Type Expressions/test003/api.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Type Expressions/test004/api.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Type Expressions/test005/api.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Type Expressions/test006/api.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Type Expressions/test007/api.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/Type Expressions/test008/api.raml");
    });
    
});

describe('RAML10/Types/xsdscheme',function(){
    
    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test001/apiInvalid.raml");
    });

    it("test001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test001/apiValid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test002/apiInvalid.raml");
    });

    it("test002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test002/apiValid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test003/apiInvalid.raml");
    });

    it("test003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test003/apiValid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test004/apiInvalid.raml");
    });

    it("test004", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test004/apiValid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test005/apiInvalid.raml");
    });

    it("test005", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test005/apiValid.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test006/apiInvalid.raml");
    });

    it("test006", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test006/apiValid.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test007/apiInvalid.raml");
    });

    it("test007", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test007/apiValid.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test008/apiInvalid.raml");
    });

    it("test008", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/Types/xsdscheme/test008/apiValid.raml");
    });
    
});

describe('RAML10/https',function(){
    
    it("api001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/RAML10/https/api001/api.raml");
    });
    
});

});

