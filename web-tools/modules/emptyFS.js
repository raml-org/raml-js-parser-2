function readFileSync(filePath) {
    return null;
}
exports.readFileSync = readFileSync;
function writeFileSync(filePath, content) {
}
exports.writeFileSync = writeFileSync;
function existsSync(filePath) {
    return false;
}
exports.existsSync = existsSync;
function mkdirSync(dir) {
}
exports.mkdirSync = mkdirSync;
function readdirSync(filePath) {
}
exports.readdirSync = readdirSync;
function statSync(filePath) {
    return {
        isDirectory: function () {
            return false;
        },
        isSymbolicLink: function () {
            return false;
        },
        isFile: function () {
            return false;
        }
    };
}
exports.statSync = statSync;
function lstatSync(filePath) {
    return this.statSync(filePath);
}
exports.lstatSync = lstatSync;
function list(file, parent) {
    return [];
}
exports.list = list;
function onChange(callback) {
}
exports.onChange = onChange;
//# sourceMappingURL=emptyFS.js.map