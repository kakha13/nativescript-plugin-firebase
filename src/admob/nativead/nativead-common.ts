import * as app from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';
// import { View, Property, isIOS } from 'tns-core-modules/ui/core/view';
import { ContentView, Property, isIOS  } from 'tns-core-modules/ui/content-view';

export const fileProperty = new Property<Common, string>({ name: "file", defaultValue: "", affectsLayout: isIOS });
export const adProperty = new Property<Common, any>({ name: "ad", defaultValue: {}, affectsLayout: isIOS});

export class Common extends ContentView {
  constructor() {
    super();
  }
}

// Defines 'file' property on NativeAdViewLayout class.
fileProperty.register(Common);

// Defines 'ad' property on NativeAdViewLayout class.
adProperty.register(Common);