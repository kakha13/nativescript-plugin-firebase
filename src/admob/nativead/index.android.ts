import { Common, textProperty } from './nativead-common';

export class NativeAd extends Common {
  nativeView: android.widget.Button;  // added for TypeScript intellisense.


  constructor() {
    super();
    console.log('Hello world!')
  }

  createNativeView(): Object {
    const button = new android.widget.Button(this._context);

    return button;
  }
  initNativeView() {

  }

  destroyNativeView() {

  }

  // transfer JS text value to nativeView.
  [textProperty.setNative](value: string) {
    this.nativeView.setText(value);
  }


}
