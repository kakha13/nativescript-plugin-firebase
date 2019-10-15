import { RewardedVideoAdCallbacks, RewardedVideoAdReward } from "./admob";

export const AD_SIZE = {
  SMART_BANNER: "SMART",
  LARGE_BANNER: "LARGE",
  BANNER: "BANNER",
  MEDIUM_RECTANGLE: "MEDIUM",
  FULL_BANNER: "FULL",
  LEADERBOARD: "LEADERBOARD",
  SKYSCRAPER: "SKYSCRAPER",
  FLUID: "FLUID"
};

export const BANNER_DEFAULTS = {
  margins: {
    top: -1,
    bottom: -1
  },
  testing: false,
  size: "SMART",
  view: undefined
};

export const ADCHOICES_PLACEMENT = {
  ADCHOICES_BOTTOM_LEFT: "BOTTOM_LEFT",
  ADCHOICES_BOTTOM_RIGHT: "BOTTOM_RIGHT",
  ADCHOICES_TOP_LEFT: "TOP_LEFT",
  ADCHOICES_TOP_RIGHT: "TOP_RIGHT"
}

export const MEDIA_ASPECT_RATIO = {
  NATIVE_MEDIA_ASPECT_RATIO_LANDSCAPE: "LANDSCAPE",
  NATIVE_MEDIA_ASPECT_RATIO_PORTRAIT: "PORTRAIT",
  NATIVE_MEDIA_ASPECT_RATIO_SQUARE: "SQUARE",
  NATIVE_MEDIA_ASPECT_RATIO_UNKNOWN: "UNKOWN",
  NATIVE_MEDIA_ASPECT_RATIO_ANY: "ANY"
}

export const NATIVEADS_DEFAULTS = {
  testing: false,
  totalAds: 1,
  adChoicesPlacement: ADCHOICES_PLACEMENT.ADCHOICES_TOP_RIGHT,
  mediaAspectRatio: MEDIA_ASPECT_RATIO.NATIVE_MEDIA_ASPECT_RATIO_LANDSCAPE,
  // imageOrientation: firebase.admob.IMAGE_ORIENTATION.ORIENTATION_LANDSCAPE,  // depreciated in favor of mediaAspectRatio
  requestMultipleImages: false,
  startMuted: false, // videoOptions
  customControlsRequested: false, // videoOptions
  clickToExpandRequested: false // videoOptions
}

export const IMAGE_ORIENTATION = {
  ORIENTATION_ANY: "ANY",
  ORIENTATION_LANDSCAPE: "LANDSCAPE",
  ORIENTATION_PORTRAIT: "PORTRAIT"
}

export const rewardedVideoCallbacks: RewardedVideoAdCallbacks = {
  onRewarded: (reward: RewardedVideoAdReward) => console.warn("onRewarded callback not set - the fallback implementation caught this reward: " + JSON.stringify(reward)),
  onLeftApplication: () => {
  },
  onClosed: () => {
  },
  onOpened: () => {
  },
  onStarted: () => {
  },
  onCompleted: () => {
  },
  onLoaded: () => {
  },
  onFailedToLoad: (err) => console.warn("onFailedToLoad not set - the fallback implementation caught this error: " + err),
};
