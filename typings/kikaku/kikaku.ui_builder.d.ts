/// <reference path="../aftereffects/ae.d.ts" />

declare namespace KIKAKU {
	
	namespace UIBuilder {
		export enum PARAMETER_TYPE {
			HEADING,
		    SEPARATOR,
		    SPACE,
		    PANEL,
		    PANEL_END,
		    TEXT,
		    TEXTS,
		    TEXTAREA,
		    TEXTAREAS,
		    STATICTEXT,
		    STATICTEXTS,
		    NUMBER,
		    NUMBERS,
		    SLIDER,
		    POINT,
		    POINT3D,
		    FILE,
		    FOLDER,
		    CHECKBOX,
		    CHECKBOXES,
		    RADIOBUTTON,
		    COLOR,
		    COLORS,
		    POPUP,
		    POPUPS,
		    LISTBOX,
		    LISTBOXES,
		    SCRIPT,
		    HELP,
			CUSTOM
		}
		
		export interface CustomParameter {
			getHeight(): number;
			build(group: Group, builder: UIBuilder): void;
			init?(obj?: any): void;
			get?(): any;
			set?(value: any): void;
			execute?(undo?: boolean): void;
			enable?(): void;
			disable?(): void;
			getItems?(): string[];
			addItems?(item: string | string[]): void;
			removeItem?(item: string): void;
			replaceItems?(items: string | string[]): void;
			toJSON?(): {
				value?: any;
				items?: string[];
			};
		}
	}
	
	export class UIBuilder {
		static LIBRARY_NAME: string;
		static VERSION: string;
		static AUTHOR: string;
		static API: {
			(script: string, name: string, ...args): any;
			has(script: string, name: string): boolean;
		};
		
		constructor(global: any, name: string, options?: {
			version?: string;
			author?: string;
			url?: string;
			title?: string;
			resizeable?: boolean;
			numberOfScriptColumns?: number;
			titleWidth?: number;
			width?: number;
			help?: boolean;
			autoSave?: boolean;
			fileType?: string;
		});
		
		getName(): string;
		getVersion(): string;
		getAuthor(): string;
		getUrl(): string;
		
		add(type: string | UIBuilder.PARAMETER_TYPE, name: string, value?: any, options?: any): UIBuilder;

		api(name: string, fn: Function): UIBuilder;
		
		on(type: string, fn: Function): UIBuilder;
		off(type: string, fn: Function): UIBuilder;
		trigger(type: string, ...args): UIBuilder;
		
		get(name: string, index?: number): any;
		set(name: string, value: any): UIBuilder;
		set(name: string, index: number, value: any): UIBuilder;
		execute(name: string, undo?: boolean): any;
		enable(name: string): UIBuilder;
		disable(name: string): UIBuilder;
		getItems(name: string, index?: number): string[];
		replaceItems(name: string, items: string[]): UIBuilder;
		replaceItems(name: string, index: number, items: string[]): UIBuilder;
		addItems(name: string, items: string | string[]): UIBuilder;
		addItems(name: string, index: number, items: string | string[]): UIBuilder;
		removeItem(name: string, item: string): UIBuilder;
		removeItem(name: string, index: number, item: string): UIBuilder;
		
		getSetting(key: string, defaultValue: any): void;
		saveSetting(key: string, value: any): void;
		deleteSetting(key: string): void;
		
		getFileNames(): string[];
		existsFile(fileName: string): boolean;
		getFile(fileName: string): any;
		saveFile(fileName: string, data: any): void;
		deleteFile(fileName: string): void;
		
		update(): void;
		close(): void;
		
		build(): void;
	} 
}