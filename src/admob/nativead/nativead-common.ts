import * as app from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';
// import { View, Property, isIOS } from 'tns-core-modules/ui/core/view';
import { ContentView, Property, isIOS  } from 'tns-core-modules/ui/content-view';

export const adProperty = new Property<Common, any>({ name: "ad", defaultValue: {}, affectsLayout: isIOS});

export class Common extends ContentView {
  constructor() {
    super();
  }
}

// Defines 'ad' property on NativeAdViewLayout class.
adProperty.register(Common);