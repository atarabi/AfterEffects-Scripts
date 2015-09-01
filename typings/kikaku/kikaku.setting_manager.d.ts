declare namespace KIKAKU {
	
	export class SettingManager {
		static VERSION: string;
		static AUTHOR: string;
		
		constructor(section: string);
		
		have(key: string): boolean;
		get(key: string, defaulValue: any): any;
		save(key: string, value: any): void;
		delete(key: string): void;
	} 
	
}