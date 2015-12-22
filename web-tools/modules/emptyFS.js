'use strict';

function readFileSync() {
    return null;
}
exports.readFileSync = readFileSync;

function writeFileSync() {
}
exports.writeFileSync = writeFileSync;

function existsSync() {
    return false;
}
exports.existsSync = existsSync;

function mkdirSync() {
}
exports.mkdirSync = mkdirSync;

function readdirSync() {
}
exports.readdirSync = readdirSync;

function statSync() {
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
    return statSync(filePath);
}
exports.lstatSync = lstatSync;

function list() {
    return [];
}
exports.list = list;

function onChange() {
}
exports.onChange = onChange;
