import testUtils = require("raml-1-parser-test-utils");
import path = require("path");

function operate(){

    let commitId = process.env.TRAVIS_COMMIT;
    if (!commitId) {
        return;
    }

    let rootDir = testUtils.rootDir(__dirname);
    let parserBranch = testUtils.pluginBranch("raml-1-parser",rootDir);
    if(!parserBranch){
        console.warn("No parser branch has been detected");
        return;
    }

    testUtils.setGitUser(rootDir);
    let homeDir = path.resolve(rootDir, "../../../");
    testUtils.configureSecurity(homeDir);

    let wsDir = path.resolve(rootDir, "../");

    testUtils.cloneRepository(
        wsDir,
        "https://github.com/KonstantinSviridov/PlatformComparisonScript",
        {"--depth": "=1"});

    let repoDir = path.resolve(wsDir, "PlatformComparisonScript");
    testUtils.setSSHUrl(repoDir);
    testUtils.insertDummyChanges(repoDir);

    testUtils.contributeTheStorage(repoDir, ["trigger.txt"], `TARGET_BRANCH=${parserBranch}`, false);
}

operate();