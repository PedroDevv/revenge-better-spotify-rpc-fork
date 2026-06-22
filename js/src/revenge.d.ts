declare module "@vendetta/metro" {
	export const findByName: any;
	export const findByProps: any;
	export const findByStoreName: any;
}

declare module "@vendetta/metro/common" {
	export const FluxDispatcher: any;
	export const React: any;
	export const ReactNative: any;
	export const stylesheet: any;
}

declare module "@vendetta/patcher" {
	export const after: any;
}

declare module "@vendetta/plugin" {
	export const storage: Record<string, unknown>;
}

declare module "@vendetta/ui" {
	export const semanticColors: Record<string, string>;
}

declare module "@vendetta/ui/assets" {
	export const getAssetIDByName: (name: string) => any;
}
