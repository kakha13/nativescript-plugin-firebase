import { Common, textProperty, fileProperty, adProperty } from './nativead-common';
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

    // TODO: Loading and populating should be done outside of UI element
    // loadNativeAds().then(result => {
    //   // TODO: figure out what to do for loading multiple ads... curently just using first
    //   this.populateView(result[0]);
    // }).catch(error => {
    //   console.log(error);
    // })
  }

  destroyNativeView() {
    this.adView.destroy();  // Not sure if Nativescript's destroy is good enough or if I need to specificly use the UnifiedNativeAdView destroy method here...
  }

  registerView() {
    console.log('registering views');

    // ad_view can be inside another layout for the template which is why we can't just use this.layout for adview
    this.adView = this.layout.findViewById(getId('ad_view'));
    console.log(this.adView);

    // Set the media view. Media content will be automatically populated in the media view once
    // this.adView.setNativeAd() is called.
    this.adView.setMediaView(this.adView.findViewById(getId('ad_media')));
    // Set other ad assets.
    this.adView.setVisibility(android.view.View.INVISIBLE);
    this.adView.setHeadlineView(this.adView.findViewById(getId('ad_headline')));
    this.adView.setBodyView(this.adView.findViewById(getId('ad_body')));
    this.adView.setCallToActionView(this.adView.findViewById(getId('ad_call_to_action')));
    this.adView.setIconView(this.adView.findViewById(getId('ad_icon')));
    this.adView.setPriceView(this.adView.findViewById(getId('ad_price')));
    this.adView.setStarRatingView(this.adView.findViewById(getId('ad_stars')));
    this.adView.setStoreView(this.adView.findViewById(getId('ad_store')));
    this.adView.setAdvertiserView(this.adView.findViewById(getId('ad_advertiser')));
  }

  public populateView(nativeAd) {
    // TODO: as of right now user can pass in any object through ad property... need to sanitize

    // assets guaranteed to be in every UnifiedNativeAd.
    this.adView.getHeadlineView().setText(nativeAd.getHeadline());
    this.adView.getBodyView().setText(nativeAd.getBody());
    this.adView.getCallToActionView().setText(nativeAd.getCallToAction())

    // These assets aren't guaranteed to be in every UnifiedNativeAd, so it's important to
    // check before trying to display them.

    if (nativeAd.getIcon() === null) {
      // console.log('no Icon');
      this.adView.getIconView().setVisibility(android.view.View.INVISIBLE);
    } else {
      this.adView.getIconView().setImageDrawable(nativeAd.getIcon().getDrawable());
      this.adView.getIconView().setVisibility(android.view.View.VISIBLE);
    }
    if (nativeAd.getPrice() === null) {
      // console.log('no Price');
      this.adView.getPriceView().setVisibility(android.view.View.INVISIBLE);
    } else {
      this.adView.getPriceView().setText(nativeAd.getPrice());
      this.adView.getPriceView().setVisibility(android.view.View.VISIBLE);
    }
    if (nativeAd.getStore() === null) {
      // console.log('no Store');
      this.adView.getStoreView().setVisibility(android.view.View.INVISIBLE);
    } else {
      this.adView.getStoreView().setText(nativeAd.getStore());
      this.adView.getStoreView().setVisibility(android.view.View.VISIBLE);
    }
    if (nativeAd.getStarRating() === null) {
      // console.log('no Star Rating');
      this.adView.getStarRatingView().setVisibility(android.view.View.INVISIBLE);
    } else {
      this.adView.getStarRatingView().setRating(nativeAd.getStarRating().floatValue());
      this.adView.getStarRatingView().setVisibility(android.view.View.VISIBLE);
    }
    if (nativeAd.getAdvertiser() === null) {
      // console.log('no Advertiser');
      this.adView.getAdvertiserView().setVisibility(android.view.View.INVISIBLE);
    } else {
      this.adView.getAdvertiserView().setText(nativeAd.getAdvertiser());
      this.adView.getAdvertiserView().setVisibility(android.view.View.VISIBLE);
    }
    // TODO: should probably change this in favor of user handling
    this.adView.setVisibility(android.view.View.VISIBLE);

    // This method tells the Google Mobile Ads SDK that you have finished populating your
    // native ad view with this native ad. The SDK will populate the adView's MediaView
    // with the media content from this native ad.
    this.adView.setNativeAd(nativeAd);

    // Get the video controller for the ad. One will always be provided, even if the ad doesn't
    // have a video asset.
    var vc = nativeAd.getVideoController();

    if (vc.hasVideoContent()) {
      console.log('Video status: has video content');
    } else {
      console.log('Video status: Ad does not contain a video asset.');
    }
  }
  
  [fileProperty.setNative](value: string) {
    this.nativeView.setText(value)
  }

  [adProperty.setNative](value: any) {
    this.populateView(value);
  }

  // TODO: remove for production... just an example
  // transfer JS text value to nativeView.
  [textProperty.setNative](value: string) {
    this.nativeView.setText(value);
  }
}
