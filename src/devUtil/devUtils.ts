import modulesDetector = require("./linkedModuleDetector")
import cp = require('child_process')


export function execProcess(
    command:string,
    wrkDir:string,
    logEnabled:boolean = false,
    errLogEnabled:boolean = true,
    messageBefore:string = '',
    messageAfter:string = '',
    messageError:string = '',
    maxLogLength:number=-1,onError:(err)=>void=null)
{
    console.log("> "+wrkDir + " " + command)
    try {
        if (logEnabled) {
            console.log(messageBefore)
        }
        var logObj = cp.execSync(
            command,
            {
                cwd: wrkDir,
                encoding: 'utf8',
                stdio: [0,1,2]
            });

        if (logEnabled) {
            console.log(messageAfter);
            if (logObj) {
                var log = logObj.toString();
                if(log.trim().length>0) {
                    if (maxLogLength < 0) {
                        console.log(log)
                    }
                    else if (maxLogLength > 0) {
                        console.log(log.substring(0, Math.min(maxLogLength, log.length)))
                    }
                }
            }
        }
    }
    catch (err) {
        if (onError){
            onError(err);
        }
        if (errLogEnabled) {
            console.log(messageError)
            console.log(err.message)
        }
    }
}

function pullAll() {
    var modules = modulesDetector.getModules();

    var reversedModules = modules.reverse();

    reversedModules.forEach(module=>{
        var folder = module.fsLocation;
        if (folder) {
            execProcess("git pull", folder, true);
        }
    })
}

function buildAll() {
    var modules = modulesDetector.getModules();

    var reversedModules = modules.reverse();

    reversedModules.forEach(module=>{
        var folder = module.fsLocation;
        if (folder) {
            var buildCommand = module.buildCommand;
            if (buildCommand) execProcess(buildCommand, folder, true);
        }
    })
}

function testAll() {
    var modules = modulesDetector.getModules();

    var reversedModules = modules.reverse();

    reversedModules.forEach(module=>{
        var folder = module.fsLocation;
        if (folder) {
            var testCommand = module.testCommand;
            if (testCommand) execProcess(testCommand, folder, true);
        }
    })
}

var args:string[] = process.argv;

if (args[2]) {
    switch(args[2]) {
        case("pullall"):
            pullAll();
            break;
        case ("buildall"):
            buildAll();
            break;
        case ("testall"):
            testAll();
            break;
    }

}


