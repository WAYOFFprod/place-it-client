export interface options {
	value: string;
	label: string;
}

export interface SaveFieldEvent {
	saveField: SettingOption;
}

export interface SettingOption {
	field: string;
	value: string;
}

export interface BoolSettingOption {
	field: string;
	value: boolean;
}

export interface CanvaFieldUpdate {
	id: number;
	field: string;
	value: string;
}

export interface Option {
	key: number;
	value: string;
}

export interface updateSearchEvent {
	onChange: string;
}
