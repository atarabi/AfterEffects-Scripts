declare namespace KIKAKU {
	
	export class JSON {
		static stringify(value: any, replacer?: any, space?: any): string;
		static parse(text: string, reviver?: any): any;
	} 
	
}