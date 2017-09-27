import tckUtil = require("./scripts/tckUtil")

describe('TCK tests',function() {
    this.timeout(15000);
    it("Fragments 001", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Fragments/test001/fragment.raml');
    });

    it("Types 001", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Types/test024/api.raml');
    });


    it("Types 002", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Types/test025/api.raml');
    });

    it("Types 003", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Types/test026/api.raml');
    });

    it("Trait 001", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Traits/test005/api.raml');
    });

    it("Trait 002", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Traits/test006/api.raml');
    });

    it("Annotations 001", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Annotations/test027/api.raml');
    });

    it("Annotations 002", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Annotations/test028/api.raml');
    });

    it("Annotations 003", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Annotations/test029/api.raml');
    });

    it("Bodies 001", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-0.8/Bodies/test001/api.raml');
    });

    it("Instagram 1.0", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Others/Instagram1.0/api.raml');
    });

    it("Instagram 0.8", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-0.8/Instagram/api.raml');
    });

    it("Libraries 001", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-1.0/Libraries/test004/api.raml');
    });

    it("Form Parameters", function () {
        this.timeout(15000);
        tckUtil.testAPI('TCK/raml-0.8/Form Parameters/test001/api.raml');
    });


    it("Overlays 001", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/raml-1.0/Overlays/test026/apigateway.raml", [
            "TCK/raml-1.0/Overlays/test026/apigateway-aws-overlay.raml"
        ]);
    });

    it("Overlays 002", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/raml-1.0/Overlays/test027/api.raml", [
            "TCK/raml-1.0/Overlays/test027/overlay.raml"
        ]);
    });

    it("Overlays 003", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/raml-1.0/Overlays/test028/api.raml", [
            "TCK/raml-1.0/Overlays/test028/overlay.raml"
        ]);
    });

    it("Extension example", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/raml-1.0/Others/overlays&extensions/extension/master.raml", [
            "TCK/raml-1.0/Others/overlays&extensions/extension/extension.raml"
        ],"TCK/raml-1.0/Others/overlays&extensions/extension/master-tck.json");
    });

    it("Overlay example", function () {
        this.timeout(15000);
        tckUtil.testAPI("TCK/raml-1.0/Others/overlays&extensions/overlay/master.raml", [
            "TCK/raml-1.0/Others/overlays&extensions/overlay/slave.raml"
        ],"TCK/raml-1.0/Others/overlays&extensions/overlay/master-tck.json");
    })
});
