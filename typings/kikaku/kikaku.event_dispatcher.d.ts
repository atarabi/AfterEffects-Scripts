declare namespace KIKAKU {
	
	export class EventDispatcher {
		static VERSION: string;
		static AUTHOR: string;
		
		addEventListener(type: string, fn: Function | string, ctx?: any): void;
		removeEventListener(type: string, fn: Function | string, ctx?: any): void;
		dispatchEvent(type: string): void;
	} 
	
}