import * as app from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';
// import { View, Property, isIOS } from 'tns-core-modules/ui/core/view';
import { ContentView, Property, isIOS  } from 'tns-core-modules/ui/content-view';


export const textProperty = new Property<Common, string>({ name: "text", defaultValue: "", affectsLayout: isIOS });
export const fileProperty = new Property<Common, string>({ name: "file", defaultValue: "", affectsLayout: isIOS });
export const adProperty = new Property<Common, any>({ name: "ad", defaultValue: {}, affectsLayout: isIOS});

export class Common extends ContentView {
  public message: string;
  text: string;

  constructor() {
    super();
    // this.message = Utils.SUCCESS_MSG();
  }

  public greet() {
    return "Hello, NS";
  }
}

export class Utils {
  public static SUCCESS_MSG(): string {
    let msg = `Your plugin is working on ${app.android ? 'Android' : 'iOS'}.`;

    setTimeout(() => {
      dialogs.alert(`${msg} For real. It's really working :)`).then(() => console.log(`Dialog closed.`));
    }, 2000);

    return msg;
  }
}

// Defines 'text' property on MyButtonBase class.
textProperty.register(Common);
// Defines 'file' property on NativeAdViewLayout class.
fileProperty.register(Common);

adProperty.register(Common);