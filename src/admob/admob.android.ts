import { firebase } from "../firebase-common";
import { BannerOptions, InterstitialOptions, NativeOptions, PreloadRewardedVideoAdOptions, ShowRewardedVideoAdOptions } from "./admob";
import { AD_SIZE, BANNER_DEFAULTS, rewardedVideoCallbacks, ADCHOICES_PLACEMENT, MEDIA_ASPECT_RATIO, IMAGE_ORIENTATION } from "./admob-common";
import * as appModule from "tns-core-modules/application";
import { topmost } from "tns-core-modules/ui/frame";
import { layout } from "tns-core-modules/utils/utils";

declare const com: any;

// TODO: remove any unused reference
const UnifiedNativeAd = com.google.android.gms.ads.formats.UnifiedNativeAd;
const NativeAd = com.google.android.gms.ads.formats.NativeAd;
const NativeAdOptions = com.google.android.gms.ads.formats.NativeAdOptions;
const MobileAds = com.google.android.gms.ads.MobileAds;
const AdRequest = com.google.android.gms.ads.AdRequest;
const AdLoader = com.google.android.gms.ads.AdLoader;
const AdListener = com.google.android.gms.ads.AdListener;


export { AD_SIZE, ADCHOICES_PLACEMENT, MEDIA_ASPECT_RATIO, IMAGE_ORIENTATION };

export function showBanner(arg: BannerOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const settings = firebase.merge(arg, BANNER_DEFAULTS);

      // always close a previously opened banner
      if (firebase.admob.adView !== null && firebase.admob.adView !== undefined) {
        const parent = firebase.admob.adView.getParent();
        if (parent !== null) {
          parent.removeView(firebase.admob.adView);
        }
      }

      firebase.admob.adView = new com.google.android.gms.ads.AdView(appModule.android.foregroundActivity);
      firebase.admob.adView.setAdUnitId(settings.androidBannerId);
      const bannerType = _getBannerType(settings.size);
      firebase.admob.adView.setAdSize(bannerType);

      // need these to support showing a banner more than once
      this.resolve = resolve;
      this.reject = reject;

      const BannerAdListener = com.google.android.gms.ads.AdListener.extend({
        resolve: null,
        reject: null,
        onAdLoaded: () => {
          this.resolve();
        },
        onAdFailedToLoad: errorCode => {
          this.reject(errorCode);
        }
      });
      firebase.admob.adView.setAdListener(new BannerAdListener());

      const ad = _buildAdRequest(settings);
      firebase.admob.adView.loadAd(ad);

      const density = layout.getDisplayDensity(),
          top = settings.margins.top * density,
          bottom = settings.margins.bottom * density;

      const relativeLayoutParams = new android.widget.RelativeLayout.LayoutParams(
          android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
          android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT);

      if (bottom > -1) {
        relativeLayoutParams.bottomMargin = bottom;
        relativeLayoutParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
      } else {
        if (top > -1) {
          relativeLayoutParams.topMargin = top;
        }
        relativeLayoutParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
      }

      const adViewLayout = new android.widget.RelativeLayout(appModule.android.foregroundActivity);
      adViewLayout.addView(firebase.admob.adView, relativeLayoutParams);

      const relativeLayoutParamsOuter = new android.widget.RelativeLayout.LayoutParams(
          android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
          android.widget.RelativeLayout.LayoutParams.MATCH_PARENT);

      // Wrapping it in a timeout makes sure that when this function is loaded from a Page.loaded event 'frame.topmost()' doesn't resolve to 'undefined'.
      // Also, in NativeScript 4+ it may be undefined anyway.. so using the appModule in that case.
      setTimeout(() => {
        const top = topmost();
        if (top !== undefined && top.currentPage && top.currentPage.android && top.currentPage.android.getParent()) {
          top.currentPage.android.getParent().addView(adViewLayout, relativeLayoutParamsOuter);
        } else if (appModule.android && appModule.android.foregroundActivity) {
          appModule.android.foregroundActivity.getWindow().getDecorView().addView(adViewLayout, relativeLayoutParamsOuter);
        } else {
          console.log("Could not find a view to add the banner to");
        }
      }, 100);
    } catch (ex) {
      console.log("Error in firebase.admob.showBanner: " + ex);
      reject(ex);
    }
  });
}

export function preloadInterstitial(arg: InterstitialOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const settings = firebase.merge(arg, BANNER_DEFAULTS);
      const activity = appModule.android.foregroundActivity || appModule.android.startActivity;
      firebase.admob.interstitialView = new com.google.android.gms.ads.InterstitialAd(activity);
      firebase.admob.interstitialView.setAdUnitId(settings.androidInterstitialId);

      // need these to support preloadInterstitial more than once
      this.resolve = resolve;
      this.reject = reject;

      // Interstitial ads must be loaded before they can be shown, so adding a listener
      const InterstitialAdListener = com.google.android.gms.ads.AdListener.extend({
        onAdLoaded: () => {
          this.resolve();
        },
        onAdFailedToLoad: errorCode => {
          this.reject(errorCode);
        },
        onAdClosed: () => {
          if (firebase.admob.interstitialView) {
            firebase.admob.interstitialView.setAdListener(null);
            firebase.admob.interstitialView = null;
          }
          arg.onAdClosed && arg.onAdClosed();
        }
      });
      firebase.admob.interstitialView.setAdListener(new InterstitialAdListener());

      const ad = _buildAdRequest(settings);
      firebase.admob.interstitialView.loadAd(ad);
    } catch (ex) {
      console.log("Error in firebase.admob.showInterstitial: " + ex);
      reject(ex);
    }
  });
}

export function showInterstitial(arg?: InterstitialOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    try {

      // if no arg is passed, the interstitial has probably been preloaded
      if (!arg) {
        if (firebase.admob.interstitialView) {
          firebase.admob.interstitialView.show();
          resolve();
        } else {
          reject("Please call 'preloadInterstitial' first");
        }
        return;
      }

      const settings = firebase.merge(arg, BANNER_DEFAULTS);
      const activity = appModule.android.foregroundActivity || appModule.android.startActivity;
      firebase.admob.interstitialView = new com.google.android.gms.ads.InterstitialAd(activity);
      firebase.admob.interstitialView.setAdUnitId(settings.androidInterstitialId);

      // Interstitial ads must be loaded before they can be shown, so adding a listener
      const InterstitialAdListener = com.google.android.gms.ads.AdListener.extend({
        onAdLoaded: () => {
          if (firebase.admob.interstitialView) {
            firebase.admob.interstitialView.show();
          }
          resolve();
        },
        onAdFailedToLoad: errorCode => {
          reject(errorCode);
        },
        onAdClosed: () => {
          if (firebase.admob.interstitialView) {
            firebase.admob.interstitialView.setAdListener(null);
            firebase.admob.interstitialView = null;
          }
          arg.onAdClosed && arg.onAdClosed();
        }
      });
      firebase.admob.interstitialView.setAdListener(new InterstitialAdListener());

      const ad = _buildAdRequest(settings);
      firebase.admob.interstitialView.loadAd(ad);
    } catch (ex) {
      console.log("Error in firebase.admob.showInterstitial: " + ex);
      reject(ex);
    }
  });
}

export function preloadRewardedVideoAd(arg: PreloadRewardedVideoAdOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const settings = firebase.merge(arg, BANNER_DEFAULTS);
      const activity = appModule.android.foregroundActivity || appModule.android.startActivity;
      firebase.admob.rewardedAdVideoView = com.google.android.gms.ads.MobileAds.getRewardedVideoAdInstance(activity);

      rewardedVideoCallbacks.onLoaded = resolve;
      rewardedVideoCallbacks.onFailedToLoad = reject;

      // rewarded Ads must be loaded before they can be shown, so adding a listener
      const RewardedVideoAdListener = com.google.android.gms.ads.reward.RewardedVideoAdListener.extend({
        onRewarded(reward) {
          rewardedVideoCallbacks.onRewarded({
            amount: reward.getAmount(),
            type: reward.getType()
          });
        },
        onRewardedVideoAdLeftApplication() {
          rewardedVideoCallbacks.onLeftApplication();
        },
        onRewardedVideoAdClosed() {
          if (firebase.admob.rewardedAdVideoView) {
            firebase.admob.rewardedAdVideoView.setRewardedVideoAdListener(null);
            firebase.admob.rewardedAdVideoView = null;
          }
          rewardedVideoCallbacks.onClosed();
        },
        onRewardedVideoAdFailedToLoad(errorCode) {
          rewardedVideoCallbacks.onFailedToLoad(errorCode);
        },
        onRewardedVideoAdLoaded() {
          rewardedVideoCallbacks.onLoaded();
        },
        onRewardedVideoAdOpened() {
          rewardedVideoCallbacks.onOpened();
        },
        onRewardedVideoStarted() {
          rewardedVideoCallbacks.onStarted();
        },
        onRewardedVideoCompleted() {
          rewardedVideoCallbacks.onCompleted();
        }
      });

      firebase.admob.rewardedAdVideoView.setRewardedVideoAdListener(new RewardedVideoAdListener());

      const ad = _buildAdRequest(settings);
      firebase.admob.rewardedAdVideoView.loadAd(settings.androidAdPlacementId, ad);
    } catch (ex) {
      console.log("Error in firebase.admob.preloadRewardedVideoAd: " + ex);
      reject(ex);
    }
  });
}

export function showRewardedVideoAd(arg?: ShowRewardedVideoAdOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      if (!firebase.admob.rewardedAdVideoView) {
        reject("Please call 'preloadRewardedVideoAd' first");
        return;
      }

      if (arg.onRewarded) {
        rewardedVideoCallbacks.onRewarded = arg.onRewarded;
      }

      if (arg.onLeftApplication) {
        rewardedVideoCallbacks.onLeftApplication = arg.onLeftApplication;
      }

      if (arg.onClosed) {
        rewardedVideoCallbacks.onClosed = arg.onClosed;
      }

      if (arg.onOpened) {
        rewardedVideoCallbacks.onOpened = arg.onOpened;
      }

      if (arg.onStarted) {
        rewardedVideoCallbacks.onStarted = arg.onStarted;
      }

      if (arg.onCompleted) {
        rewardedVideoCallbacks.onCompleted = arg.onCompleted;
      }

      firebase.admob.rewardedAdVideoView.show();
      resolve();
    } catch (ex) {
      console.log("Error in firebase.admob.showRewardedVideoAd: " + ex);
      reject(ex);
    }
  });
}

export function hideBanner(): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      if (firebase.admob.adView !== null) {
        const parent = firebase.admob.adView.getParent();
        if (parent !== null) {
          parent.removeView(firebase.admob.adView);
        }
        firebase.admob.adView = null;
      }
      resolve();
    } catch (ex) {
      console.log("Error in firebase.admob.hideBanner: " + ex);
      reject(ex);
    }
  });
}

export function loadNativeAds(arg: NativeOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // args need to contain
      // ad_unit_id, number of ads up to 5
      console.log('Check1')  // TODO: remove for production

      this.resolve = resolve;
      this.reject = reject;

      const settings = arg;
      const adChoicesPlacement = _getAdChoicesPlacement(settings.adChoicesPlacement);
      const mediaAspectRatio = _getMediaAspectRatio(settings.mediaAspectRatio);
      const imageOrientation = _getImageOrientation(settings.imageOrientation);
      if (settings.requestMultipleImages === undefined) {
        settings.requestMultipleImages = false; // default
      }

      // TODO: will eventually need to come up with a solution for storing ads in different adunits
      // TODO: figure out if we want to store all ads or just leave that up to the user
      // Creating initial array for ads
      // if (firebase.admob.nativeAds === undefined) {
      firebase.admob.nativeAds = [];  // letting user handle destroying nativeAds
      // }
      // TODO: should sanitize/check if all referenced values are passed in... referencing something not defined will through errors
      const activity = appModule.android.foregroundActivity || appModule.android.startActivity;

      console.log('check2');  // TODO: remove for production

      const NativeAdListener = com.google.android.gms.ads.AdListener.extend({
        onAdFailedToLoad: errorCode => {
          console.log('ad Failed to load: ' + errorCode);
          if (!firebase.admob.adLoader.isLoading()) {
            console.log('total ads loaded: ' + firebase.admob.nativeAds.length);  // NOTE: if loadNativeAds is called this will return total of all ads loaded unless destroyed.
            if(firebase.admob.nativeAds.length > 0) {
              this.resolve(firebase.admob.nativeAds)
            } else {
              this.reject('failed to load ad(s)');
            }
            // reject for single ad goes in here
            // if multiple ads check should be done if at least one ad was successful
          }
        },
        onAdClicked: args => {
          // NOTE: not sure if this will actually work as I needed a different listener for loaded UnifiedNativeAds
          console.log("Click event Logged!!!");
        }
      });

      console.log('check3') // TODO: remove for production

      var builder = new AdLoader.Builder(activity, settings.ad_unit_id);

      var nativeAdOptionsBuilder = new NativeAdOptions.Builder()
        .setAdChoicesPlacement(adChoicesPlacement)
        .setRequestMultipleImages(settings.requestMultipleImages)
        .setImageOrientation(imageOrientation); // This method is deprecated. Use setMediaAspectRatio()
        // NOTE if com.google.firebase:firebase-ads version lines up with com.gogle.android.gms.ads then at the time of writing this I have not
        //      updated to 18.1.0 which is where setMediaAspectRatio was added.
        //      firebase changelog https://firebase.google.com/support/release-notes/android
        //      Mobile Ads SDK changelog https://developers.google.com/admob/android/rel-notes#17.2.0
        // TODO update firebase-ads to 18.1.0 and see if setMediaAspectRatio works.
        // .setMediaAspectRatio(mediaAspectRatio);  // currently not a function... only in version 18.1.0 and greater of com.gogle.android.gms.ads
      console.log("imageOrientation: " + imageOrientation);
      
      firebase.admob.adLoader = builder
        .forUnifiedNativeAd(new MyUnifiedNativeAd(this.resolve))
        .withAdListener(new NativeAdListener())
        .withNativeAdOptions(nativeAdOptionsBuilder.build())
        .build();

      console.log('check4') // TODO: remove for production
      
      // Load the Native ads.
      // NOTE: might just be able to use loadAds even for one ad... documentation talked about both ways... leaving as example
      if(settings.totalAds > 1 && settings.totalAds <= 5) {
        firebase.admob.adLoader.loadAds(_buildAdRequest(settings), settings.totalAds) // second value for number of ads... up to 5 max
      } else if(settings.totalAds === 1) {
        firebase.admob.adLoader.loadAd(_buildAdRequest(settings));  // for loading single ad
      } else {
        reject('totalAds is a required setting and can only be a number 1 to 5');
      }
    } catch (ex) {
      console.log("Error in firebase.admob.loadNativeAds: " + ex);
      reject(ex);
    }
  });
}

function _getAdChoicesPlacement(placement): any {
  if (placement === ADCHOICES_PLACEMENT.ADCHOICES_BOTTOM_LEFT){
    return com.google.android.gms.ads.formats.NativeAdOptions.ADCHOICES_BOTTOM_LEFT;
  } else if (placement === ADCHOICES_PLACEMENT.ADCHOICES_BOTTOM_RIGHT){
    return com.google.android.gms.ads.formats.NativeAdOptions.ADCHOICES_BOTTOM_RIGHT;
  } else if (placement === ADCHOICES_PLACEMENT.ADCHOICES_TOP_LEFT){
    return com.google.android.gms.ads.formats.NativeAdOptions.ADCHOICES_TOP_LEFT;
  } else if (placement === ADCHOICES_PLACEMENT.ADCHOICES_TOP_RIGHT){
    return com.google.android.gms.ads.formats.NativeAdOptions.ADCHOICES_TOP_RIGHT;
  } else {
    return com.google.android.gms.ads.formats.NativeAdOptions.ADCHOICES_TOP_RIGHT;
  }
}
// currently MediaAspectRatio doesn't work... com.google.firebase:firebase-ads >= 18.1.0 to work
function _getMediaAspectRatio(ratio): any {
  if (ratio === MEDIA_ASPECT_RATIO.NATIVE_MEDIA_ASPECT_RATIO_LANDSCAPE) {
    return com.google.android.gms.ads.formats.NativeAdOptions.NATIVE_MEDIA_ASPECT_RATIO_LANDSCAPE;
  } else if (ratio === MEDIA_ASPECT_RATIO.NATIVE_MEDIA_ASPECT_RATIO_PORTRAIT) {
    return com.google.android.gms.ads.formats.NativeAdOptions.NATIVE_MEDIA_ASPECT_RATIO_PORTRAIT;
  } else if (ratio === MEDIA_ASPECT_RATIO.NATIVE_MEDIA_ASPECT_RATIO_SQUARE) {
    return com.google.android.gms.ads.formats.NativeAdOptions.NATIVE_MEDIA_ASPECT_RATIO_SQUARE;
  } else if (ratio === MEDIA_ASPECT_RATIO.NATIVE_MEDIA_ASPECT_RATIO_UNKNOWN) {
    return com.google.android.gms.ads.formats.NativeAdOptions.NATIVE_MEDIA_ASPECT_RATIO_UNKNOWN
  } else if (ratio === MEDIA_ASPECT_RATIO.NATIVE_MEDIA_ASPECT_RATIO_ANY) {
    return com.google.android.gms.ads.formats.NativeAdOptions.NATIVE_MEDIA_ASPECT_RATIO_ANY;
  } else {
    return com.google.android.gms.ads.formats.NativeAdOptions.NATIVE_MEDIA_ASPECT_RATIO_ANY;
  }
}

// depreciated in favor of MediaAspectRatio as of com.google.firebase:firebase-ads 18.1.0
function _getImageOrientation(orientation): any {
  if (orientation === IMAGE_ORIENTATION.ORIENTATION_LANDSCAPE) {
    return com.google.android.gms.ads.formats.NativeAdOptions.ORIENTATION_LANDSCAPE;
  } else if (orientation === IMAGE_ORIENTATION.ORIENTATION_PORTRAIT) {
    return com.google.android.gms.ads.formats.NativeAdOptions.ORIENTATION_PORTRAIT;
  } else if (orientation === IMAGE_ORIENTATION.ORIENTATION_ANY) {
    return com.google.android.gms.ads.formats.NativeAdOptions.ORIENTATION_ANY;
  } else {
    return com.google.android.gms.ads.formats.NativeAdOptions.ORIENTATION_ANY;
  }
}

function _getBannerType(size): any {
  if (size === AD_SIZE.BANNER) {
    return com.google.android.gms.ads.AdSize.BANNER;
  } else if (size === AD_SIZE.LARGE_BANNER) {
    return com.google.android.gms.ads.AdSize.LARGE_BANNER;
  } else if (size === AD_SIZE.MEDIUM_RECTANGLE) {
    return com.google.android.gms.ads.AdSize.MEDIUM_RECTANGLE;
  } else if (size === AD_SIZE.FULL_BANNER) {
    return com.google.android.gms.ads.AdSize.FULL_BANNER;
  } else if (size === AD_SIZE.LEADERBOARD) {
    return com.google.android.gms.ads.AdSize.LEADERBOARD;
  } else if (size === AD_SIZE.SMART_BANNER) {
    return com.google.android.gms.ads.AdSize.SMART_BANNER;
  } else {
    return null;
  }
}

function _buildAdRequest(settings): any {
  const builder = new com.google.android.gms.ads.AdRequest.Builder();
  if (settings.testing) {
    builder.addTestDevice(com.google.android.gms.ads.AdRequest.DEVICE_ID_EMULATOR);
    // This will request test ads on the emulator and device by passing this hashed device ID.
    const activity = appModule.android.foregroundActivity || appModule.android.startActivity;
    const ANDROID_ID = android.provider.Settings.Secure.getString(activity.getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
    let deviceId = _md5(ANDROID_ID);
    if (deviceId !== null) {
      deviceId = deviceId.toUpperCase();
      console.log("Treating this deviceId as testdevice: " + deviceId);
      builder.addTestDevice(deviceId);
    }
  }

  if (settings.keywords !== undefined && settings.keywords.length > 0) {
    for (let i = 0; i < settings.keywords.length; i++) {
      builder.addKeyword(settings.keywords[i]);
    }
  }

  const bundle = new android.os.Bundle();
  bundle.putInt("nativescript", 1);
  const adextras = new com.google.android.gms.ads.mediation.admob.AdMobExtras(bundle);
  // builder = builder.addNetworkExtras(adextras);
  return builder.build();
}

function _md5(input): string {
  try {
    const digest = java.security.MessageDigest.getInstance("MD5");
    const bytes = [];
    for (let j = 0; j < input.length; ++j) {
      bytes.push(input.charCodeAt(j));
    }

    const s = new java.lang.String(input);
    digest.update(s.getBytes());
    const messageDigest = digest.digest();
    let hexString = "";
    for (let i = 0; i < messageDigest.length; i++) {
      let h = java.lang.Integer.toHexString(0xFF & messageDigest[i]);
      while (h.length < 2)
        h = "0" + h;
      hexString += h;
    }
    return hexString;

  } catch (noSuchAlgorithmException) {
    console.log("error generating md5: " + noSuchAlgorithmException);
    return null;
  }
}

@Interfaces([UnifiedNativeAd.OnUnifiedNativeAdLoadedListener])
class MyUnifiedNativeAd extends UnifiedNativeAd {
  /**
   * Important that all methods be included when overiding interfaces
   * Ref. https://docs.nativescript.org/core-concepts/android-runtime/binding-generator/extend-class-interface
   */
  private LoadNativeAdsResolve: any;
  constructor(loadNativeAdsResolve: any) {
    super();
    this.LoadNativeAdsResolve = loadNativeAdsResolve;
    return global.__native(this);
  }
  onUnifiedNativeAdLoaded(ad) {
    console.log(ad);
    firebase.admob.nativeAds.push(ad); // could potentialy pop
    if (!firebase.admob.adLoader.isLoading()) {
      this.LoadNativeAdsResolve(firebase.admob.nativeAds);  // resolving promise for loadNativeAds()
    }
  }
}