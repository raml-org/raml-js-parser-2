# RAML 1.0 JS Parser Search

See http://raml.org for more information about RAML.

Search provides a number of utility methods designed to find relations between RAML parts.

## Usage
`search-interface.ts` file contains JSDoc descriptions for all search methos provided by the module.

Of those methods two should be particularly useful: `findDeclaration(unit, offset)` and `findUsages(unit, offset)`.

`findDeclaration` method accepts compilation unit and offset inside the unit and finds a high-level node, which declares the entity referenced at offseet.

`findUsages` method accepts compilation unit and offset inside the unit and returns the object, containing a list of high-level nodes, which uses the entity in the `results` field.

This module operates on high-level and low-level, but it is always possible to descend from top-level to high-level to find the result, and then get top-level from the high-level node.

To get the unit from top-level node call `var unit = topLevelNode.highLevel().lowLevel().unit()`
To convert found high-level node back to top-level call `var topLevelNode = highLevelNode.wrapperNode()`
