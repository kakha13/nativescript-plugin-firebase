import { Common, adProperty } from './nativead-common';
import * as application from 'tns-core-modules/application';

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

// Uses file in res/layout to display ad
export class NativeAdViewLayout extends Common {
  // nativeView: com.google.android.gms.ads.formats.UnifiedNativeAdView; // added or TypeScript intellisense
  adView: any;
  layout: any;
  nativeAd: any;  // Storing nativeAd here so we can destroy it later... on second thought might not do this as view gets recycled
  private _file: string = ""; // used for grabing android layout.

  constructor() {
    super();
    console.log('nativeAdViewLayout')
  }

  createNativeView(): Object {
    // IMPORTANT: this UnifiedNativeAdView gets recycled in listviews... once the view leaves the page it will be reused again by another nativeAd
    console.log('creating native view!');

    // Alternative way to let user choose what type of layout to nest the nativeAd in
    // this.layout = android.view.LayoutInflater.from(this._context).inflate(getLayout('ad_container'), null, false);

    // container to hold nativead since file parameter doesn't load in time to inflate layout here
    this.layout = new android.widget.FrameLayout(this._context);
    
    return this.layout;
  }
  initNativeView() {
    // inflating UnifiedNativeAdView here instead of createNativeView to use file parameter user passes in for multiple templates
    this.layout.addView(android.view.LayoutInflater.from(this._context).inflate(getLayout(this._file), this.layout, false));

    this.registerView();
  }

  destroyNativeView() {
    // NOTE that this isn't the same as destroying the unifiedNativeAd itself
    // Not sure if Nativescript's destroy is good enough or if I need to specificly destroy the adview myself
    this.adView.destroy();
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
    // This gets called everytime a nativeAd is passed back into view as the unifiedNativeAdView gets recycled
    // Since this is the case registering the adview may need to be resset if different layouts were used

    // TODO: as of right now user can pass in any object through ad property... need to sanitize
    if (Object.keys(nativeAd).length === 0 && nativeAd.constructor === Object){
      // TODO: figure out why after loading new ads two empty objects get passed in
      // this is happening when concating array of items... most likely that transistion causes empty objects to be passed.
      console.log('empty object');
      return;
    }

    // TODO: remove for production... just demonstrating how listview is recycling this View
    if (this.nativeAd !== undefined) {
      console.log('*** Refreshing adView ***');
      console.log('old: ' + this.nativeAd);
      console.log('new: ' + nativeAd);
      
      // was going to destroy ad here but this view is recycled for multiple nativeAds
      // this.nativeAd.destory();
    } else {
      console.log('*** Loading adView for first time ***');
      console.log(nativeAd);
    }
    this.nativeAd = nativeAd;

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
      // TODO: remove these logs for production
      console.log('Video status: has video content');
      console.log("Video status: Ad contains a " + vc.getAspectRatio() + ":1 video asset.");
      if(vc.isCustomControlsEnabled()) {
        console.log('Video status: custom controls enabled');
      } else {
        console.log('Video status: custom controls disabled');
      }
    } else {
      console.log('Video status: Ad does not contain a video asset.');
    }
  }

  public set file({value='ad_unified'}: {value: string}) {
    this._file = value;
  }

  [adProperty.setNative](value: any) {
    this.populateView(value); // TODO: look into if this could load before registerView as there would be issues
  }
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
}
