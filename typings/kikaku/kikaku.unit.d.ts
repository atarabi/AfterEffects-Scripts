declare module KIKAKU {
	
	export class Unit {
		static test(name: string, tests: {
			[name: string]: Function;
		}): boolean;
		static test(name: string, hooks: {
			before?: Function;
			beforeEach?: Function;
			afterEach?: Function;
			after?: Function;
		}, tests: {
			[name: string]: Function;
		}): any;
	} 
	
}