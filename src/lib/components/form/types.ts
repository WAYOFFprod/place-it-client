interface options {
	value: string;
	label: string;
}

interface SaveFieldEvent {
	saveField: SettingOption;
}

interface SettingOption {
	field: string;
	value: string;
}

interface BoolSettingOption {
	field: string;
	value: boolean;
}

interface CanvaFieldUpdate {
	id: number;
	field: string;
	value: string;
}

interface Option {
	key: number;
	value: string;
}

interface updateSearchEvent {
	onChange: string;
}
