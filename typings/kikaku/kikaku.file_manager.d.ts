declare namespace KIKAKU {
	
	export class FileManager {
		static VERSION: string;
		static AUTHOR: string;
		
		static validateFileName(fileName: string): boolean;
		
		constructor(path: string, type?: string);
		
		getFiles(options?: {path?: string, mask?: string}): File[];
		getFile(fileName: string): File;
		getFileNames(options?: {path?: string, mask?: string}): string[];
		exists(fileName: string): boolean;
		get(fileName: string): string | void;
		save(fileName: string, text: string): void;
		delete(fileName: string): boolean;
	} 
	
}