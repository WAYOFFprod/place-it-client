interface options {
  "value": string,
  "label": string
}

interface SaveFieldEvent {
  saveField: SettingOption;
}

interface SettingOption { 
  "field": string,
  "value": string
}