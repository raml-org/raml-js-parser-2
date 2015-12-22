// Compiled using typings@0.3.3
// Source: https://raw.githubusercontent.com/definitelytyped/DefinitelyTyped/be0b6b394f77a59e192ad7cfec18078706e44db5/pathwatcher/pathwatcher.d.ts
// Type definitions for pathwatcher
// Project: https://github.com/atom/node-pathwatcher
// Definitions by: vvakame <https://github.com/vvakame/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped


declare module PathWatcher {
	interface IFileStatic {
		new (path:string, symlink?:boolean):IFile;
	}

	interface IFile {
		realPath:string;
		path:string;
		symlink:boolean;
		cachedContents:string;
		digest:string;

		handleEventSubscriptions():void;
		setPath(path:string):void;
		getPath():string;
		getRealPathSync():string;
		getBaseName():string;
		write(text:string):void;
		readSync(flushCache:boolean):string;
		read(flushCache?:boolean):Q.Promise<string>;
		// exists():boolean;
		existsSync():boolean;
		setDigest(contents:string):void;
		getDigest():string;
		writeFileWithPrivilegeEscalationSync (filePath:string, text:string):void;
		handleNativeChangeEvent(eventType:string, eventPath:string):void;
		detectResurrectionAfterDelay():void;
		detectResurrection():void;
		subscribeToNativeChangeEvents():void;
		unsubscribeFromNativeChangeEvents():void;
	}

	interface IDirectoryStatic {
		new (path:string, symlink?:boolean):IDirectory;
	}

	interface IDirectory {
		realPath:string;
		path:string;
		symlink:boolean;

		getBaseName():string;
		getPath():void;
		getRealPathSync():string;
		contains(pathToCheck:string):boolean;
		relativize(fullPath:string):string;
		getEntriesSync():any[]; // return type are {File | Directory}[]
		getEntries(callback:Function):void;
		subscribeToNativeChangeEvents():void;
		unsubscribeFromNativeChangeEvents():void;
		isPathPrefixOf(prefix:string, fullPath:string):boolean;
	}
}

declare module "pathwatcher" {

	import events = require("events");

	interface IHandleWatcher extends events.EventEmitter {
		onEvent(event:any, filePath:any, oldFilePath:any):any;
		start():void;
		closeIfNoListener():void;
		close():void;
	}

	interface IPathWatcher {
		isWatchingParent:boolean;
		path:any;
		handleWatcher:IHandleWatcher;

		close():void;
	}

	function watch(path:string, callback:Function):IPathWatcher;

	function closeAllWatchers():void;

	function getWatchedPaths():string[];

	var File:PathWatcher.IFileStatic;
	var Directory:PathWatcher.IDirectoryStatic;
}