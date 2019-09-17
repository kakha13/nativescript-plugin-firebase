import { Common, textProperty, fileProperty } from './nativead-common';
import * as application from 'tns-core-modules/application';
import { loadNativeAds } from "../admob.android";

declare const com: any;
const UnifiedNativeAdView = com.google.android.gms.ads.formats.UnifiedNativeAdView;

function getLayout(id: string) {
  const context: android.content.Context = application.android.context;
  return context.getResources().getIdentifier(id, 'layout', context.getPackageName());
}

function getId(id: string) {
  const context: android.content.Context = application.android.context;
  return context.getResources().getIdentifier(id, 'id', context.getPackageName());
}

// TODO: register and populate view so user isn't dependent on res/layout layout
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
    const nativeAdView = new UnifiedNativeAdView(this._context);
    return nativeAdView;
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

// Uses file in res/layout to display ad
export class NativeAdViewLayout extends Common {
  // nativeView: android.widget.Button;  // added for TypeScript intellisense.
  // nativeView: com.google.android.gms.ads.formats.UnifiedNativeAdView; // added or TypeScript intellisense
  adView: any;
  layout: any;

  constructor() {
    super();
    console.log('nativeAdViewLayout')
  }

  createNativeView(): Object {
    // const button = new android.widget.Button(this._context);
    console.log('creating native view!');
    this.layout = android.view.LayoutInflater.from(this._context).inflate(getLayout('ad_unified'), null, false);
    return this.layout;
  }
  initNativeView() {
    // TODO: Come up with better way to hide ad before it is loaded
    this.registerView();
  }

  destroyNativeView() {
    this.adView.destroy();  // Not sure if Nativescript's destroy is good enough or if I need to specificly use the UnifiedNativeAdView destroy method here...
  }

  registerView() {
    console.log('registering views');

    // NOTE: ad_view can be inside another layout for the template which is why we can't just use this.layout for adview
    this.adView = this.layout.findViewById(getId('ad_view'));
    console.log(this.adView);
    // Register the view used for each individual asset.
    console.log(this.adView.findViewById(getId('ad_headline')));
    this.adView.setHeadlineView(this.adView.findViewById(getId('ad_headline')));
    this.adView.setBodyView(this.adView.findViewById(getId('ad_body')));
    this.adView.setCallToActionView(this.adView.findViewById(getId('ad_call_to_action')));
    this.adView.setIconView(this.adView.findViewById(getId('ad_icon')));
    this.adView.setPriceView(this.adView.findViewById(getId('ad_price')));
    this.adView.setStarRatingView(this.adView.findViewById(getId('ad_stars')));
    this.adView.setStoreView(this.adView.findViewById(getId('ad_store')));
    this.adView.setAdvertiserView(this.adView.findViewById(getId('ad_advertiser')));

    // NOTE: not sure why but reigistering MediaView here is sufficiant for displaying this resource...
    //       you do not need to set this asset like the rest... also video is curently not tested

    // The MediaView will display a video asset if one is present in the ad, and the
    // first image asset otherwise.
    this.adView.setMediaView(this.adView.findViewById(getId('ad_media')));

    console.log('loading ads');

    // TODO: split this section out
    //Loading ads
    loadNativeAds().then(result => {
      // TODO: figure out what to do for loading multiple ads... curently just using first
      console.log('Total number of ads returned: ' + result.length);
      console.log(result[0]);

      // Some assets are guaranteed to be in every UnifiedNativeAd.
      this.adView.getHeadlineView().setText(result[0].getHeadline());
      this.adView.getBodyView().setText(result[0].getBody());
      this.adView.getCallToActionView().setText(result[0].getCallToAction())

      // These assets aren't guaranteed to be in every UnifiedNativeAd, so it's important to
      // check before trying to display them.

      if (result[0].getIcon() === null) {
        console.log('no Icon');
        this.adView.getIconView().setVisibility(android.view.View.INVISIBLE);
      } else {
        this.adView.getIconView().setImageDrawable(result[0].getIcon().getDrawable());
      }
      if (result[0].getPrice() === null) {
        console.log('no Price');
        this.adView.getPriceView().setVisibility(android.view.View.INVISIBLE);
      } else {
        this.adView.getPriceView().setText(result[0].getPrice());
      }
      if (result[0].getStore() === null) {
        console.log('no Store');
        this.adView.getStoreView().setVisibility(android.view.View.INVISIBLE);
      } else {
        this.adView.getStoreView().setText(result[0].getStore());
      }
      if (result[0].getStarRating() === null) {
        console.log('no Star Rating');
        this.adView.getStarRatingView().setVisibility(android.view.View.INVISIBLE);
      } else {
        this.adView.getStarRatingView().setRating(result[0].getStarRating().floatValue());
      }
      if (result[0].getAdvertiser() === null) {
        console.log('no Advertiser');
        this.adView.getAdvertiserView().setVisibility(android.view.View.INVISIBLE);
      } else {
        this.adView.getAdvertiserView().setText(result[0].getAdvertiser());
      }
  
      // NOTE: if ad isn't set here click events won't work as they are handled
      //       by the sdk when
      this.adView.setNativeAd(result[0]);

      console.log('*** List of ads loaded ***')
      for (var i = 0; i < result.length; i++) {
        console.log(i + ': ' + result[i].getHeadline());
      }
    }).catch(error => {
      console.log(error);
    })
  }
  
  [fileProperty.setNative](value: string) {
    this.nativeView.setText(value)
  }

  // TODO: remove for production... just an example
  // transfer JS text value to nativeView.
  [textProperty.setNative](value: string) {
    this.nativeView.setText(value);
  }
}
