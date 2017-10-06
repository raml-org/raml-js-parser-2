import assert = require("assert")
import util = require("../test-utils")

//import _=require("underscore")
//import fs = require("fs")
//import abnf = require('abnf');
//import path = require("path")

//import yll=require("../jsyaml/jsyaml2lowLevel")
//import yaml=require("../jsyaml/yamlAST")
//import hl=require("../highLevelAST")
//import tools = require("./testTools")
//import testgen = require("./testgen/testgen")
//import bnfgen = require("./testgen/bnfgen")
//import exgen = require("./testgen/exgen")
//import gu = require("./testgen/gen-util")
//import resgen = require("./testgen/resgen")
//import parser = require("../artifacts/raml10parser");
//import servergen = require("../tools/servergen/servergen")
//import mkdirp = require('mkdirp');

describe('Parser Tests',function() {

// bad 1
  it ("bad-1 #bad-1",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-1.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 2
  it ("bad-2 #bad-2",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-2.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 3
  it ("bad-3 #bad-3",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-3.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 4
  it ("bad-4 #bad-4",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-4.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 5
  it ("bad-5 #bad-5",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-5.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 6
  it ("bad-6 #bad-6",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-6.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 7
  it ("bad-7 #bad-7",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-7.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 8
  it ("bad-8 #bad-8",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-8.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 9
  it ("bad-9 #bad-9",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-9.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 10
  it ("bad-10 #bad-10",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-10.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 11
  it ("bad-11 #bad-11",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-11.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 12
  it ("bad-12 #bad-12",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-12.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 13
  it ("bad-13 #bad-13",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-13.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 14
  it ("bad-14 #bad-14",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-14.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 15
  it ("bad-15 #bad-15",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-15.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 16
  it ("bad-16 #bad-16",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-16.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 17
  it ("bad-17 #bad-17",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-17.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 18
  it ("bad-18 #bad-18",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-18.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 19
  it ("bad-19 #bad-19",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-19.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 20
  it ("bad-20 #bad-20",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-20.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 21
  it ("bad-21 #bad-21",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-21.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 22
  it ("bad-22 #bad-22",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-22.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 23
  it ("bad-23 #bad-23",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-23.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 24
  it ("bad-24 #bad-24",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-24.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 25
  it ("bad-25 #bad-25",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-25.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 26
  it ("bad-26 #bad-26",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-26.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 27
  it ("bad-27 #bad-27",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-27.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 28
  it ("bad-28 #bad-28",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-28.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 29
  it ("bad-29 #bad-29",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-29.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 30
  it ("bad-30 #bad-30",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-30.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 31
  it ("bad-31 #bad-31",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-31.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 32
  it ("bad-32 #bad-32",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-32.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 33
  it ("bad-33 #bad-33",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-33.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 34
  it ("bad-34 #bad-34",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-34.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 35
  it ("bad-35 #bad-35",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-35.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 36
  it ("bad-36 #bad-36",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-36.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 37
  it ("bad-37 #bad-37",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-37.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 38
  it ("bad-38 #bad-38",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-38.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 39
  it ("bad-39 #bad-39",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-39.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 40
  it ("bad-40 #bad-40",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-40.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 41
  it ("bad-41 #bad-41",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-41.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 42
  it ("bad-42 #bad-42",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-42.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 43
  it ("bad-43 #bad-43",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-43.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 44
  it ("bad-44 #bad-44",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-44.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 45
  it ("bad-45 #bad-45",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-45.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 46
  it ("bad-46 #bad-46",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-46.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 47
  it ("bad-47 #bad-47",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-47.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 48
  it ("bad-48 #bad-48",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-48.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 49
  it ("bad-49 #bad-49",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-49.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 50
  it ("bad-50 #bad-50",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-50.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 51
  it ("bad-51 #bad-51",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-51.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 52
  it ("bad-52 #bad-52",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-52.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 53
  it ("bad-53 #bad-53",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-53.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 54
  it ("bad-54 #bad-54",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-54.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 55
  it ("bad-55 #bad-55",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-55.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 56
  it ("bad-56 #bad-56",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-56.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 57
  it ("bad-57 #bad-57",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-57.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 58
  it ("bad-58 #bad-58",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-58.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 59
  it ("bad-59 #bad-59",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-59.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 60
  it ("bad-60 #bad-60",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-60.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 61
  it ("bad-61 #bad-61",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-61.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 62
  it ("bad-62 #bad-62",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-62.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 63
  it ("bad-63 #bad-63",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-63.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 64
  it ("bad-64 #bad-64",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-64.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 65
  it ("bad-65 #bad-65",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-65.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 66
  it ("bad-66 #bad-66",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-66.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 67
  it ("bad-67 #bad-67",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-67.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 68
  it ("bad-68 #bad-68",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-68.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 69
  it ("bad-69 #bad-69",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-69.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 70
  it ("bad-70 #bad-70",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-70.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 71
  it ("bad-71 #bad-71",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-71.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 72
  it ("bad-72 #bad-72",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-72.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 73
  it ("bad-73 #bad-73",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-73.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 74
  it ("bad-74 #bad-74",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-74.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 75
  it ("bad-75 #bad-75",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-75.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 76
  it ("bad-76 #bad-76",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-76.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 77
  it ("bad-77 #bad-77",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-77.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 78
  it ("bad-78 #bad-78",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-78.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 79
  it ("bad-79 #bad-79",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-79.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 80
  it ("bad-80 #bad-80",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-80.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 81
  it ("bad-81 #bad-81",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-81.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 82
  it ("bad-82 #bad-82",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-82.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 83
  it ("bad-83 #bad-83",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-83.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 84
  it ("bad-84 #bad-84",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-84.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 85
  it ("bad-85 #bad-85",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-85.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 86
  it ("bad-86 #bad-86",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-86.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 87
  it ("bad-87 #bad-87",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-87.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 88
  it ("bad-88 #bad-88",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-88.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 89
  it ("bad-89 #bad-89",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-89.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 90
  it ("bad-90 #bad-90",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-90.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 91
  it ("bad-91 #bad-91",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-91.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 92
  it ("bad-92 #bad-92",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-92.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 93
  it ("bad-93 #bad-93",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-93.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 94
  it ("bad-94 #bad-94",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-94.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 95
  it ("bad-95 #bad-95",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-95.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 96
  it ("bad-96 #bad-96",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-96.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 97
  it ("bad-97 #bad-97",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-97.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 98
  it ("bad-98 #bad-98",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-98.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 99
  it ("bad-99 #bad-99",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-99.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// bad 100
  it ("bad-100 #bad-100",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/bad/bad-100.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

	
});

// footer
