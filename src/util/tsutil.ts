/// <reference path="../../typings/main.d.ts" />
import ts = require("typescript");

// https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API


export function escapeTypescriptPropertyName( str: string ): string {
    return isValidTypescriptIdentifier( str ) ? str : JSON.stringify( str )
}

// TODO: these are made up lists. check the grammar
var tsKeywords = 'type class interface break case catch continue debugger default delete do else finally for function if in instanceof new return switch this throw try typeof var void while with'.split(' ')

var digitCodesL = "0".charCodeAt(0);
var digitCodesR = "9".charCodeAt(0);
var lowerCaseCodesL = "a".charCodeAt(0);
var lowerCaseCodesR = "z".charCodeAt(0);
var upperCaseCodesL = "A".charCodeAt(0);
var upperCaseCodesR = "Z".charCodeAt(0);

var digitChars = {}//:boolean[] = []
var validChars = {}//:boolean[] = []
//for(var i = 0 ; i < 128 ; i++){
//    digitCodes.push(false)
//    validCodes.push(false)
//}

for(var i = digitCodesL, end = digitCodesR ; i <= end ; i++ ){
    digitChars[String.fromCharCode(i)] = true
    validChars[String.fromCharCode(i)] = true
}

for(var i = lowerCaseCodesL, end = lowerCaseCodesR ; i <= end ; i++ ){
    validChars[String.fromCharCode(i)] = true
}

for(var i = upperCaseCodesL, end = upperCaseCodesR ; i <= end ; i++ ){
    validChars[String.fromCharCode(i)] = true
}

"_ $".split(" ").forEach(x=>validChars[x]=true)

export function isValidTypescriptIdentifier( str: string ): boolean {

    str = str.trim();
    if(str.length==0){
        return false;
    }
    if(tsKeywords.indexOf(str)>=0){
        return false;
    }
    if(digitChars[str.charAt(0)]){
        return false;
    }
    for(var i = 0 ; i < str.length ; i++){
        if(!validChars[str.charAt(i)]){
            return false;
        }
    }
    return true;
}

export function escapeToIdentifier( str: string ): string {

    str = str.trim();
    var result:string = ''
    if(str.length>0&&digitChars[str.charAt(0)]){
        result += '_';
    }
    for(var i = 0 ; i < str.length ; i++){
        var ch = str.charAt(i);
        if(validChars[ch]){
            result += ch;
        }
        else{
            result += '_';
        }
    }
    return result;
}


// Note: this uses ts.formatting which is part of the typescript 1.4 package but is not currently
//       exposed in the public typescript.d.ts. The typings should be exposed in the next release.
export function format(text: string) {
    var options = getDefaultOptions();

    // Parse the source text
    var sourceFile = ts.createSourceFile("file.ts", text, ts.ScriptTarget.Latest,true);
    fixupParentReferences(sourceFile);

    // Get the formatting edits on the input sources
    var edits = (<any>ts).formatting.formatDocument(sourceFile, getRuleProvider(options), options);

    // Apply the edits on the input code
    return applyEdits(text, edits);

    function getRuleProvider(options: ts.FormatCodeOptions) {
        // Share this between multiple formatters using the same options.
        // This represents the bulk of the space the formatter uses.
        var ruleProvider = new (<any>ts).formatting.RulesProvider();
        ruleProvider.ensureUpToDate(options);
        return ruleProvider;
    }

    function applyEdits(text: string, edits: ts.TextChange[]): string {
        // Apply edits in reverse on the existing text
        var result = text;
        for (var i = edits.length - 1; i >= 0; i--) {
            var change = edits[i];
            var head = result.slice(0, change.span.start);
            var tail = result.slice(change.span.start + change.span.length)
            result = head + change.newText + tail;
        }
        return result;
    }

    function getDefaultOptions(): ts.FormatCodeOptions {
        return <any>{
            IndentSize: 4,
            TabSize: 4,
            NewLineCharacter: '\n',
            ConvertTabsToSpaces: true,
            InsertSpaceAfterCommaDelimiter: true,
            InsertSpaceAfterSemicolonInForStatements: true,
            InsertSpaceBeforeAndAfterBinaryOperators: true,
            InsertSpaceAfterKeywordsInControlFlowStatements: true,
            InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
            InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
            PlaceOpenBraceOnNewLineForFunctions: false,
            PlaceOpenBraceOnNewLineForControlBlocks: false
        };
    }

    function fixupParentReferences(sourceFile: ts.SourceFile) {
        var parent: ts.Node = sourceFile;
        function walk(n: ts.Node): void {
            n.parent = parent;

            var saveParent = parent;
            parent = n;
            ts.forEachChild(n, walk);
            parent = saveParent;
        }
        ts.forEachChild(sourceFile, walk);
    }
}

var typeMap={
    'string': 'string',
    'integer': 'number',
    'number': 'number',
    'boolean': 'boolean',
    'file': 'string',
    'date': 'string',
    'NumberType':'number'
};

export function ramlType2TSType(ramlType:string):string{
    var tsType=typeMap[ramlType];
    if(!tsType){
        tsType = 'any';
    }
    return tsType;
}

export function escapeToJavaIdentifier(str:string){
    str = escapeToIdentifier(str);
    return javaReservedWords[str] ? str + '_' : str;
}

export var tsToJavaTypeMap:{[key:string]:string} = {
    'number': 'Double',
    'string': 'String',
    'boolean': 'Boolean',
    'any': 'Object'
}

export var javaReservedWords:{[key:string]:boolean} = {
    "abstract": true,
    "continue": true,
    "for": true,
    "new": true,
    "switch": true,
    "assert": true,
    "default": true,
    "goto": true,
    "package": true,
    "synchronized": true,
    "boolean": true,
    "do": true,
    "if": true,
    "private": true,
    "this": true,
    "break": true,
    "double": true,
    "implements": true,
    "protected": true,
    "throw": true,
    "byte": true,
    "else": true,
    "import": true,
    "public": true,
    "throws": true,
    "case": true,
    "enum": true,
    "instanceof": true,
    "return": true,
    "transient": true,
    "catch": true,
    "extends": true,
    "int": true,
    "short": true,
    "try": true,
    "char": true,
    "final": true,
    "interface": true,
    "static": true,
    "void": true,
    "class": true,
    "finally": true,
    "long": true,
    "strictfp": true,
    "volatile": true,
    "const": true,
    "float": true,
    "native": true,
    "super": true,
    "while": true,
};