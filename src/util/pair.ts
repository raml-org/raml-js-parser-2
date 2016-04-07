export class KeyValuePair<T> {
    key: string;
    value: T;
}

export class Map<T> {
	
	constructor(ms: KeyValuePair<T>[] = []) {
		ms.forEach(m=>this.mappings.push(m));
	}
	
	private mappings: KeyValuePair<T>[] = [];
	
	volume() { return this.mappings.length; }
	
	pairs() { return [].concat(this.mappings); }
	
	set(key: string, value: T) {
		var pairs = this.mappings.filter(x=>x.key == key);
		if (pairs.length == 0) 
			this.mappings.push({ key: key, value: value });
		else pairs[0].value = value;
	}
	get(key: string) : T {
		var pairs = this.mappings.filter(x=>x.key == key);
		return (pairs.length == 0) ? null : pairs[0].value;
	}
	
	map<U>(callbackfn: (elem: T, index: number, array: T[]) => U) {
		return this.mappings.map(x=>x.value).map(callbackfn);
	}
	
	forEach(callbackfn: (elem: T, index: number, array: T[]) => void) {
		this.mappings.map(x=>x.value).forEach(callbackfn);
	}
	
	filter(callbackfn: (elem: T, index: number, array: T[]) => boolean) {
		return this.mappings.map(x=>x.value).filter(callbackfn);
	}
	
}