export type VersionChanges = {
	[key in changeType]?: string[];
};

export type VersionChangeEntry = [string, string[]];

export interface Versioning {
	[key: string]: VersionChanges;
}

export enum changeType {
	ADDED = 'added',
	FIXED = 'fixed',
	CHANGED = 'changed',
	DEPRECATED = 'deprecated',
	REMOVED = 'removed',
	SECURITY = 'security'
}
