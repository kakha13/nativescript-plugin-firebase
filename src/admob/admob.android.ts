import { firebase } from "../firebase-common";
import { BannerOptions, InterstitialOptions, NativeOptions, PreloadRewardedVideoAdOptions, ShowRewardedVideoAdOptions, DirtyOptions } from "./admob";
import { AD_SIZE, BANNER_DEFAULTS, rewardedVideoCallbacks } from "./admob-common";
import * as appModule from "tns-core-modules/application";
import { topmost } from "tns-core-modules/ui/frame";
import { layout } from "tns-core-modules/utils/utils";

declare const com: any;

export { AD_SIZE };

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

export function handsDirty(arg?: NativeOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Just getting my hands Dirty here :)')
      // **************** Work space ********************

      const settings = arg;
      const ad_unit_id = "ca-app-pub-3940256099942544/2247696110"; // default value... should be added into settings
      // this was pulled from Googles example app code...
      const activity = appModule.android.foregroundActivity || appModule.android.startActivity;
      console.log('check0')
      var builder = new com.google.android.gms.ads.AdLoader.Builder(activity, ad_unit_id); 
      // may need to change format of how I extend these...
      console.log('check1')
      // https://developers.google.com/android/reference/com/google/android/gms/ads/formats/UnifiedNativeAd.OnUnifiedNativeAdLoadedListener
      console.log('check3')
      var UnifiedNativeAd = new com.google.gms.ads.formats.UnifiedNativeAd;
      firebase.admob.adLoader = builder.forUnifiedNativeAd(
        UnifiedNativeAd.OnUnifiedNativeAdLoadedListener.extend({
          onUnifiedNativeAdLoaded: (nativeAdLoader) => {
            console.log('hello ads!')
          }
        })
      ).withAdListener(
        new com.google.android.gms.ads.AdListener.extend({
          onAdFailedToLoad: (errorCode) => {
            console.log('nativeAdListener')
            // The previous native ad failed to load. Attempting to load another
            // if only doing one ad, reject could go here...
            console.log('unifiedNative ad failed :(');
            console.log(errorCode);
            if (!firebase.admob.adLoader.isLoading()) {
              // insertAdsInMenuItems
            }
          }
        })
      ).build();
      console.log('made it out check4')
      // Load the Native ads.
      // this builder for REQUEST is different than the one above that is for LOAD
      // new com.google.android.gms.ads.AdRequest.Builder().build()
      firebase.admob.adLoader.loadAds(new com.google.android.gms.ads.AdRequest.Builder().build(), 1) // second value for number of ads... this should be good

      // ************************************************
      resolve('Playing in the dirt!');
    } catch (ex) {
      console.log("Error in firebase.admob.handsDirty: " + ex);
      reject(ex);
    }
  });
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
