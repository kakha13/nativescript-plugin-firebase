import { Common, textProperty } from './nativead-common';

declare const com: any;

export class NativeAd extends Common {
  // nativeView: android.widget.Button;  // added for TypeScript intellisense.
  // nativeView: com.google.android.gms.ads.formats.UnifiedNativeAdView; // added or TypeScript intellisense


  constructor() {
    super();
    console.log('Hello world!')
  }

  createNativeView(): Object {
    // const button = new android.widget.Button(this._context);
    const button = new com.google.android.gms.ads.formats.UnifiedNativeAdView(this._context);

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
