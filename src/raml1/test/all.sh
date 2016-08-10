#!/bin/bash

mocha model-editing-tests-add model-editing-tests-refactoring model-editing-tests-remove model-editing-tests-attrs model-editing-tests-sig schema-model-tests.js
mocha parserTests
mocha parserTestsRC2
mocha parserTests2
mocha parserASTTests
mocha gotoDeclarationTests
mocha findUsagesTests
mocha traits-and-resource-types-expanding-tests
mocha exampleGenTests
mocha typeSystemTests
mocha runtimeExampleTests
mocha data/parser/test/specs/parser
mocha data/parser/test/specs/optionals
mocha data/parser/test/specs/protocols
mocha data/parser/test/specs/regressions
mocha data/parser/test/specs/resourceTypes
mocha data/parser/test/specs/resourceTypesValidations
mocha data/parser/test/specs/traits
mocha data/parser/test/specs/transformations
mocha data/parser/test/specs/validator
mocha data/parser/test/specs/duplicateKeysValidations
mocha parserTestsExpanded
mocha TCK
mocha funcTests