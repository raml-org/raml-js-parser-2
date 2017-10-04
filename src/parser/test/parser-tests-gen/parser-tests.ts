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

// good 1
  it ("good-1 #good-1",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-1.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 2
  it ("good-2 #good-2",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-2.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 3
  it ("good-3 #good-3",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-3.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 4
  it ("good-4 #good-4",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-4.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 5
  it ("good-5 #good-5",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-5.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 6
  it ("good-6 #good-6",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-6.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 7
  it ("good-7 #good-7",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-7.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 8
  it ("good-8 #good-8",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-8.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 9
  it ("good-9 #good-9",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-9.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 10
  it ("good-10 #good-10",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-10.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 11
  it ("good-11 #good-11",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-11.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 12
  it ("good-12 #good-12",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-12.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 13
  it ("good-13 #good-13",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-13.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 14
  it ("good-14 #good-14",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-14.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 15
  it ("good-15 #good-15",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-15.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 16
  it ("good-16 #good-16",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-16.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 17
  it ("good-17 #good-17",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-17.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 18
  it ("good-18 #good-18",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-18.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 19
  it ("good-19 #good-19",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-19.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 20
  it ("good-20 #good-20",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-20.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 21
  it ("good-21 #good-21",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-21.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 22
  it ("good-22 #good-22",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-22.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 23
  it ("good-23 #good-23",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-23.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 24
  it ("good-24 #good-24",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-24.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 25
  it ("good-25 #good-25",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-25.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 26
  it ("good-26 #good-26",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-26.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 27
  it ("good-27 #good-27",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-27.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 28
  it ("good-28 #good-28",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-28.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 29
  it ("good-29 #good-29",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-29.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 30
  it ("good-30 #good-30",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-30.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 31
  it ("good-31 #good-31",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-31.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 32
  it ("good-32 #good-32",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-32.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 33
  it ("good-33 #good-33",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-33.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 34
  it ("good-34 #good-34",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-34.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 35
  it ("good-35 #good-35",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-35.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 36
  it ("good-36 #good-36",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-36.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 37
  it ("good-37 #good-37",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-37.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 38
  it ("good-38 #good-38",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-38.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 39
  it ("good-39 #good-39",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-39.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 40
  it ("good-40 #good-40",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-40.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 41
  it ("good-41 #good-41",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-41.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 42
  it ("good-42 #good-42",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-42.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 43
  it ("good-43 #good-43",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-43.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 44
  it ("good-44 #good-44",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-44.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 45
  it ("good-45 #good-45",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-45.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 46
  it ("good-46 #good-46",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-46.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 47
  it ("good-47 #good-47",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-47.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 48
  it ("good-48 #good-48",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-48.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 49
  it ("good-49 #good-49",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-49.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 50
  it ("good-50 #good-50",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-50.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 51
  it ("good-51 #good-51",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-51.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 52
  it ("good-52 #good-52",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-52.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 53
  it ("good-53 #good-53",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-53.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 54
  it ("good-54 #good-54",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-54.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 55
  it ("good-55 #good-55",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-55.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 56
  it ("good-56 #good-56",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-56.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 57
  it ("good-57 #good-57",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-57.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 58
  it ("good-58 #good-58",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-58.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 59
  it ("good-59 #good-59",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-59.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 60
  it ("good-60 #good-60",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-60.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 61
  it ("good-61 #good-61",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-61.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 62
  it ("good-62 #good-62",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-62.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 63
  it ("good-63 #good-63",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-63.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 64
  it ("good-64 #good-64",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-64.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 65
  it ("good-65 #good-65",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-65.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 66
  it ("good-66 #good-66",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-66.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 67
  it ("good-67 #good-67",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-67.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 68
  it ("good-68 #good-68",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-68.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 69
  it ("good-69 #good-69",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-69.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 70
  it ("good-70 #good-70",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-70.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 71
  it ("good-71 #good-71",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-71.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 72
  it ("good-72 #good-72",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-72.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 73
  it ("good-73 #good-73",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-73.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 74
  it ("good-74 #good-74",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-74.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 75
  it ("good-75 #good-75",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-75.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 76
  it ("good-76 #good-76",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-76.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 77
  it ("good-77 #good-77",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-77.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 78
  it ("good-78 #good-78",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-78.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 79
  it ("good-79 #good-79",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-79.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 80
  it ("good-80 #good-80",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-80.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 81
  it ("good-81 #good-81",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-81.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 82
  it ("good-82 #good-82",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-82.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 83
  it ("good-83 #good-83",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-83.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 84
  it ("good-84 #good-84",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-84.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 85
  it ("good-85 #good-85",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-85.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 86
  it ("good-86 #good-86",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-86.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 87
  it ("good-87 #good-87",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-87.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 88
  it ("good-88 #good-88",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-88.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 89
  it ("good-89 #good-89",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-89.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 90
  it ("good-90 #good-90",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-90.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 91
  it ("good-91 #good-91",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-91.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 92
  it ("good-92 #good-92",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-92.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 93
  it ("good-93 #good-93",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-93.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 94
  it ("good-94 #good-94",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-94.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 95
  it ("good-95 #good-95",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-95.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 96
  it ("good-96 #good-96",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-96.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 97
  it ("good-97 #good-97",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-97.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 98
  it ("good-98 #good-98",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-98.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 99
  it ("good-99 #good-99",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-99.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

// good 100
  it ("good-100 #good-100",function(){
    var api = util.loadApiWrapper1(util.data("../parser-tests-gen/data/good/good-100.raml"));
    assert.equal(util.countErrors(api.highLevel()), 0);
  });

	
});

// footer
