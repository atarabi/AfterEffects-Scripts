/// <reference path="../aftereffects/ae.d.ts" />

declare namespace KIKAKU.Utils {
	
	export var VERSION: string;
	export var AUTHOR: string;
	
	//utility
	export function isObject(obj: any): boolean;
	export function isArray(obj: any): boolean;
	export function isFunction(obj: any): boolean;
	export function isString(obj: any): boolean;
	export function isNumber(obj: any): boolean;
	export function isBoolean(obj: any): boolean;
	export function isUndefined(obj: any): boolean;
	
	export function forEach(obj: Object | any[], fn: Function): void;
	export function forEachItem(folder: FolderItem, fn: Function): void;
	export function forEachItem(fn: Function): void;
	export function forEachLayer(comp: CompItem, fn: Function): void;
	export function forEachPropertyGroup(propertyGrouop: PropertyGroup, fn: Function): void;
	export function forEachEffect(layer: AVLayer, fn: Function): void;
	
	export function inherits(C: any, P: any): void;
	
	export function assign(obj: Object, ...others): Object;
	export function map(arr: any[], fn: Function): any[];
	export function reduce(arr: any[], fn: Function, initialValue?: any): any;
	export function filter(arr: any[], fn: Function): any[];
	export function some(arr: any[], fn: Function): boolean;
	export function every(arr: any[], fn: Function): boolean;
	
	export function inArray(arr: any[], fn: Function | any): number;
	export function find(arr: any[], fn: Function): any | void;
	
	export function clamp(v: any, mn: any, mx: any): any;
	export function trim(str: string): string;
	
	//item
	export function isFootageItem(item: Item): boolean;
	export function isCompItem(item: Item): boolean;
	export function isAVItem(item: Item): boolean;
	export function isFolderItem(item: Item): boolean;
	
	export function createItemFilter(filters?: any): Function;
	
	export function getItems(fn: Function | any): Item[];
	export function getItem(fn: Function | any): Item | void;
	export function getActiveItem(): Item | void;
	export function getActiveComp(): CompItem | void;
	export function getCompByName(name: string): CompItem | void;
	export function getAVItemByName(name: string): AVItem | void;
	
	//layer
	export function isTextLayer(layer: Layer): boolean;
	export function isShapeLayer(layer: Layer): boolean;
	export function isAVLayer(layer: Layer): boolean;
	export function isNullLayer(layer: Layer): boolean;
	export function isSolidLayer(layer: Layer): boolean;
	export function isCompLayer(layer: Layer): boolean;
	export function isCameraLayer(layer: Layer): boolean;
	export function isLightLayer(layer: Layer): boolean;
	
	export function createLayerFilter(filters?: any): Function;
	
	export function getLayers(fn?: Function | any, comp?: CompItem): Layer[];
	export function getLayer(fn?: Function | any, comp?: CompItem): Layer | void;
	export function getLayerByName(name: string, comp?: CompItem): Layer | void;
	
	export function selectLayers(fn?: Function | any, comp?: CompItem, deselect?: boolean): boolean;
	export function selectLayer(fn?: Function | any, comp?: CompItem, deselect?: boolean): boolean;
	export function deselectLayers(comp?: CompItem): void;

	export function getSelectedLayers(comp?: CompItem): Layer[];
	export function getSelectedLayer(comp?: CompItem): Layer | void;
	
	//property
	export function isProperty(property: PropertyBase): boolean;
	export function isPropertyGroup(property: PropertyBase): boolean;
	export function isHiddenProperty(property: PropertyBase): boolean;
	
	export function createPropertyFilter(filters?: any): Function;
	
	export function getSelectedProperties(options?: {multiple?: boolean, propertyGroup?: boolean, filter?: Function}): PropertyBase[];
	export function getSelectedPropertiesWithLayer(options?: {multiple?: boolean, propertyGroup?: boolean, filter?: Function}): {layer: Layer; properties: PropertyBase[]}[];
	export function getSelectedProperty(): PropertyBase | void;
	export function getSelectedPropertyWithLayer(): {layer: Layer; property: PropertyBase;} | void;
	export function getPathOfProperty(property: PropertyBase, type?: string): string[];
	export function getPathOfSelectedProperty(type?: string): PropertyBase | void;
	export function getPropertyFromPath(layer: Layer, path: (string | number)[]): void;
	export function getLayerOfProperty(property: PropertyBase): Layer;
	
	//color
	export function rgbToHsl(rgba: [number, number, number, number]): [number, number, number, number];
	export function hslToRgb(hsla: [number, number, number, number]): [number, number, number, number];
	export function rgbToYuv(rgba: [number, number, number, number]): [number, number, number, number];
	export function yuvToRgb(yuva: [number, number, number, number]): [number, number, number, number];

}