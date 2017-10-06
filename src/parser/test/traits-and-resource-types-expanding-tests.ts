import assert = require("assert")
import util = require("./test-utils")
import expander = require("../ast.core/expander")
import RamlWrapper = require("../artifacts/raml10parser")
import json = require("../jsyaml/json2lowLevel")

var expandingTest = function (ind) {
    it('Expansion test ' + ind, function () {

        var apiPath = 'expander/expander_test_api' + ind + '.raml';
        var apiExpPath = 'expander/expander_test_api' + ind + '_exp.raml';

        var apiHLNode = util.loadApi(util.data(apiPath));
        var api_exp = expander.expandTraitsAndResourceTypes(new RamlWrapper.ApiImpl(apiHLNode));
        var api_exp_standard = util.loadApi(util.data(apiExpPath));

        var obj_exp = json.serialize(api_exp.highLevel().lowLevel());
        var obj_exp_standard = json.serialize(api_exp_standard.lowLevel());
        var diffs = util.compare(obj_exp, obj_exp_standard).filter(x=>x.path != '/title');
        var msg = `Traits and resource types expansion success for ${apiPath} and ${apiExpPath}}`;
        if (diffs.length > 0) {
            console.log(diffs.length);
            msg = `Traits and resource types expansion fail for ${apiPath} and ${apiExpPath}}`
                + diffs.map(x=>'\n' + x.message("actual","expected")).join('');
        }
        assert(diffs.length == 0, msg);
    });
};
describe('Traits and resoure types expansion', function () {
    this.timeout(0);
    for (var i = 0; i <= 19; i++) {

        if(i==11||i==12){
            //tests for signatures
            continue;
        }

        var ind = '' + i;
        if (ind.length < 2) {
            ind = '' + 0 + ind;
        }
        expandingTest(ind);
    }
});