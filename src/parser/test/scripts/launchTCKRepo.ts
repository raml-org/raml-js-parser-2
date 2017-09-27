import path = require("path");
import fs = require("fs");
import tckUtil = require("./tckUtil");
import fsutil = require("../../../util/fsutil");

var spawnSync = require('child_process').spawnSync;

var TCK_REPOSITORY_PATH = 'https://github.com/mulesoft-labs/raml-tck';

var projectFolder = tckUtil.projectFolder();
var TCKFolder = path.resolve(projectFolder,"TCK");
if(fs.existsSync(TCKFolder)){
    console.log(`Removing '${TCKFolder}'...`);
    fsutil.removeDirSyncRecursive(TCKFolder);
}

var cloneStatus = spawnSync('git', [
    'clone', '-b', 'master', '--depth', '1',
    TCK_REPOSITORY_PATH,
    TCKFolder ], {stdio: [0, 1, 2]});

if(cloneStatus.status == 0){
    var reportPath = path.resolve(TCKFolder, "report.json");
    tckUtil.launchTests(path.resolve(TCKFolder, "tests"), reportPath, false, true);
}