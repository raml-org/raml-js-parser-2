import index = require("../../../index");

var fs = require('fs');

require("console.table");

var path = require("path");

var cases: any = {};

var data;

var connection;

var srcPath = path.resolve(__dirname, '../../../../resources/performance/report.html');
var dstPath = path.resolve(__dirname, '../../../../performance_report/report.html');

var reportTemplate = fs.readFileSync(srcPath).toString();

var handleEnabled = true;

export function startCollectingData() {
    data = [];
}

function dump(api, errors = false) {
    var opts = { rootNodeDetails : errors};

    return api.toJSON(opts);

    // return tckDumperHL.dump(api, {
    //     rootNodeDetails: errors,
    //     attributeDefaults: true,
    //     serializeMetadata: true
    // });
}

function doExpand(api, expandLibraries = false) {
    return api.expand(expandLibraries);
    
    // if(expandLibraries) {
    //     return expanderHL.expandLibrariesHL(api) || api;
    // }
    //
    // return expanderHL.expandTraitsAndResourceTypesHL(api) || api;
}

export function printData() {
    var apis = {};

    var table = [];
    
    var messages = {};

    data.forEach(record => {
        var tableRecord = null;
        
        messages[record.api] = record.message;

        var apiNum = apis[record.api];

        if(!apiNum) {
            apiNum = Object.keys(apis).length + 1;

            apis[record.api] = apiNum;
        }

        for(var i = 0; i < table.length; i++) {
            var foundRecord = table[i];
            
            if(foundRecord['api/case'] === apiNum) {
                tableRecord = foundRecord;

                break;
            }
        }

        if(!tableRecord) {
            tableRecord = {
                'api/case': apiNum
            }

            table.push(tableRecord);
        }

        tableRecord[record.caseId] = record.total + "ms";
    });

    console.log("Apis:");

    Object.keys(apis).forEach(key => {
        var messageString = messages[key] ? (':\n\t' + messages[key]) : '';
        
        console.log(apis[key] + ". " + key + messageString);
    });

    console.log();
    
    var jsonData: any = {
        apis: apis,
        table: table,
        messages: messages
    };

    fs.writeFileSync(dstPath, reportTemplate.replace('__jsonData__', JSON.stringify(jsonData)));
    
    (<any>console).table(table);
}

class TimeTrackerEvent {
    eventName: string;
    message: string;
    timeSpend: number;
}

class TimeTracker {
    lastNoteTime: number;

    total: number = 0;

    constructor(private onEvent: (TimeTrackerEvent) => void) {

    }

    start(startMessage: string): void {
        this.onEvent({
            eventName: 'NOTE',
            message: startMessage,
            timeSpend: -1
        });

        this.lastNoteTime = this.time();
    }

    note(message: string): void {
        var timeSpend = this.diff();

        this.total+= timeSpend;

        this.onEvent({
            eventName: 'NOTE',
            message: message,
            timeSpend: timeSpend
        });

        this.lastNoteTime = this.time();
    }

    reset(): void {
        this.lastNoteTime = this.time();

        this.total = 0;
    }
    
    finish(message: string): void {
        this.onEvent({
            eventName: 'FINISH',
            message: message,
            timeSpend: this.total
        });
    }
    
    private diff(): number {
        return this.time() - this.lastNoteTime;
    }

    private time(): number {
        return new Date().getTime();
    }
}

export function doMeasure(apiPath, caseId, message?) {
    launchCase(cases[caseId], apiPath, caseId, message);
}

function fullPath(apiPath) {
    return path.resolve("../../../src/raml1/test/data/performance", apiPath);
}

function launchCase(callback, apiPath, caseId, testMessage?) {
    var tracker: TimeTracker = new TimeTracker((event: TimeTrackerEvent) => {
        if(!handleEnabled) {
            return;
        }

        var eventName = event.eventName;
        var message = event.message;
        var timeSpend = event.timeSpend;


        var indent = timeSpend === -1 ? "" : "\t";

        console.log(indent + (message || "total") + ": " + (timeSpend === -1 ? "" : (timeSpend + " ms")));
        
        
        if(eventName === 'FINISH') {
            data.push({
                api: apiPath,
                caseId: caseId,
                total: timeSpend,
                message: testMessage
            });

            return;
        }
    });
    
    var fullApiPath = fullPath(apiPath);

    //preload(fullApiPath);

    tracker.start("Start measures for '" + apiPath + "'");
    
    var api = index.loadApiSync(fullApiPath);

    //var api = index.loadRamlSyncHL(fullApiPath);

    callback(api, tracker);
}

var preloaded = [];

function preload(fullApiPath) {
    if(preloaded.indexOf(fullApiPath) > -1) {
        return;
    }

    var tracker: TimeTracker = new TimeTracker((event: TimeTrackerEvent) => {});

    tracker.start("Start measures");

    var api = index.loadApiSync(fullApiPath);

    //var api = index.loadRamlSyncHL(fullApiPath);

    fullTest(api, tracker);

    preloaded.push(fullApiPath);
}

function traverse(node: any, heavily: boolean) {
    if(node.isElement && node.isElement()) {
        if(heavily) {
            node.asElement().definition();

            node.asElement().localType();
        }

        node.asElement().children().forEach(x => traverse(x, heavily));
    } else if(node.isAttr && node.isAttr()) {
        node.asAttr().value();
    }
}

function traverseAST(node: any, heavily: boolean) {
    traverse(node.highLevel(), heavily);
}

function fullTest(api, tracker) {
    tracker.note("loading time");
    
    var apiExpand = doExpand(api, true);
    
    tracker.note("expand call");
    
    dump(apiExpand, true);
    
    tracker.note("expanded toJson call");

    tracker.finish("total");
}

function toJSONTest(api, tracker) {
    var errorsInJSON = false;

    var opts = {
        rootNodeDetails : errorsInJSON
    };

    var apiExpand = doExpand(api, true);

    tracker.reset();

    dump(apiExpand, errorsInJSON);
    tracker.note("toJson without errors");

    tracker.finish();
}

function toJSONWithErrosTest(api, tracker) {
    var errorsInJSON = true;

    var opts = {
        rootNodeDetails : errorsInJSON
    };

    var apiExpand = doExpand(api, true);

    tracker.reset();

    dump(apiExpand, errorsInJSON);
    tracker.note("toJson with errors");

    tracker.finish();
}

function toJSONTestTraversed(api, tracker) {
    var errorsInJSON = false;

    var opts = {
        rootNodeDetails : errorsInJSON
    };

    var apiExpand = doExpand(api, true);

    traverseAST(apiExpand, false);

    tracker.reset();

    dump(apiExpand, errorsInJSON);
    tracker.note("toJson without errors traversed");

    tracker.finish();
}

function toJSONWithErrosTestTraversed(api, tracker) {
    var errorsInJSON = true;

    var opts = {
        rootNodeDetails : errorsInJSON
    };

    var apiExpand = doExpand(api, true);

    traverseAST(apiExpand, false);

    tracker.reset();

    dump(apiExpand, errorsInJSON);
    tracker.note("toJson with errors traversed");

    tracker.finish();
}

function toJSONTestTraversedHeavily(api, tracker) {
    var errorsInJSON = false;

    var opts = {
        rootNodeDetails : errorsInJSON
    };

    var apiExpand = doExpand(api, true);

    traverseAST(apiExpand, true);

    tracker.reset();

    dump(apiExpand, errorsInJSON);
    tracker.note("toJson without errors traversed");

    tracker.finish();
}

function toJSONWithErrosTestTraversedHeavily(api, tracker) {
    var errorsInJSON = true;

    var opts = {
        rootNodeDetails : errorsInJSON
    };

    var apiExpand = doExpand(api, true);

    traverseAST(apiExpand, true);

    tracker.reset();

    dump(apiExpand, errorsInJSON);
    tracker.note("toJson with errors traversed");

    tracker.finish();
}




function errorsTest(api, tracker) {
    tracker.reset();

    api.errors();
    tracker.note("errors unexpanded call");

    tracker.finish();
}

function errorsTestExpanded(api, tracker) {
    var apiExpand = doExpand(api);

    tracker.reset();

    apiExpand.errors();
    tracker.note("errors expanded call");

    tracker.finish();
}

function errorsTestExpandedLibs(api, tracker) {
    var apiExpand = doExpand(api, true);

    tracker.reset();

    apiExpand.errors();
    tracker.note("errors expanded call");

    tracker.finish();
}

function expanding(api, tracker) {
    tracker.reset();

    var apiExpand = doExpand(api);    
    
    tracker.note("expanding");

    tracker.finish();
}

function expandingLibs(api, tracker) {
    tracker.reset();

    var apiExpand = doExpand(api, true);

    tracker.note("expanding with libs");

    tracker.finish();
}

function loadingTest(api, tracker) {
    tracker.note("loading API");

    tracker.finish();
}

cases['FULL_LIFECYCLE'] = fullTest;

cases['LOADING'] = loadingTest;

cases['TO_JSON_WITHOUT_ERRORS'] = toJSONTest;
cases['TO_JSON_WITH_ERRORS'] = toJSONWithErrosTest;

cases['TO_JSON_WITHOUT_ERRORS_TRAVERSED_LIGHTLY'] = toJSONTestTraversed;
cases['TO_JSON_WITH_ERRORS_TRAVERSED_LIGHTLY'] = toJSONWithErrosTestTraversed;

cases['TO_JSON_WITHOUT_ERRORS_TRAVERSED_HEAVILY'] = toJSONTestTraversedHeavily;
cases['TO_JSON_WITH_ERRORS_TRAVERSED_HEAVILY'] = toJSONWithErrosTestTraversedHeavily;

cases['ERRORS_UNEXPANDED'] = errorsTest;
cases['ERRORS_EXPANDED_WITHOUT_LIBS'] = errorsTestExpanded;
cases['ERRORS_EXPANDED_WITH_LIBS'] = errorsTestExpandedLibs;

cases['EXPANDING_WITHOUT_LIBS'] = expanding;
cases['EXPANDING_WITH_LIBS'] = expandingLibs;