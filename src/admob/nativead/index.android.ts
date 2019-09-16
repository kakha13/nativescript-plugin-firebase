import { Common, textProperty, fileProperty } from './nativead-common';
import * as application from 'tns-core-modules/application';

declare const com: any;

function getLayout(id: string) {
  const context: android.content.Context = application.android.context;
  return context.getResources().getIdentifier(id, 'layout', context.getPackageName());
}

export class NativeAd extends Common {
  // nativeView: android.widget.Button;  // added for TypeScript intellisense.
  // nativeView: com.google.android.gms.ads.formats.UnifiedNativeAdView; // added or TypeScript intellisense


  constructor() {
    super();
    console.log('nativeAdView')
  }

  createNativeView(): Object {
    // const button = new android.widget.Button(this._context);
    console.log('creating native view!');
    const nativeAdView = new com.google.android.gms.ads.formats.UnifiedNativeAdView(this._context);
    return nativeAdView;
  }
  initNativeView() {

  }

  destroyNativeView() {

  }

  myFunction() {
    console.log('running my function!');
  }

  // transfer JS text value to nativeView.
  [textProperty.setNative](value: string) {
    this.nativeView.setText(value);
  }
}

// Note could be getting into trouble with using 
// Using layout from file.
export class NativeAdViewLayout extends Common {
  // nativeView: android.widget.Button;  // added for TypeScript intellisense.
  // nativeView: com.google.android.gms.ads.formats.UnifiedNativeAdView; // added or TypeScript intellisense


  constructor() {
    super();
    console.log('nativeAdViewLayout')
  }

  createNativeView(): Object {
    // const button = new android.widget.Button(this._context);
    console.log('creating native view!');
    const layout = android.view.LayoutInflater.from(this._context).inflate(getLayout('ad_unified'), null, false);
    console.log(layout);
    return layout;
  }
  initNativeView() {

  }

  destroyNativeView() {

  }

  myFunction() {
    console.log('running my function!');
  }
  



  // transfer JS text value to nativeView.
  [textProperty.setNative](value: string) {
    this.nativeView.setText(value);
  }

  [fileProperty.setNative](value: string) {
    this.nativeView.setText(value)
  }


}
