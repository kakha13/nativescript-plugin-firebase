import * as observable from "tns-core-modules/data/observable";
import * as pages from "tns-core-modules/ui/page";
import { HelloWorldModel } from "./main-view-model";
import * as app from 'tns-core-modules/application';
import * as firebase from "nativescript-plugin-firebase";
import {TextView} from "tns-core-modules/ui/text-view";

const model = new HelloWorldModel();
var page;

declare const android: any;

// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
  // Get the event sender
  page = <pages.Page>args.object;

  // Getting Elements from nativescript id
  // const adView = page.getViewById("ad_view");
  // const adAttribution = page.getViewById("ad_attribution")
  // const adIcon = page.getViewById("ad_icon")
  // const adHeadline = page.getViewById("ad_headline")
  // const adAdvertiser = page.getViewById("ad_advertiser")
  // const adBody = page.getViewById("ad_body")
  // const adPrice = page.getViewById("ad_price")
  // const adStore = page.getViewById("ad_store")
  // const adCallToAction = page.getViewById("ad_call_to_action")

  // Asigning android ids
  // adView.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_view", "id", app.getNativeApplication().getPackageName()));
  // adAttribution.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_attribution", "id", app.getNativeApplication().getPackageName()));
  // adIcon.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_icon", "id", app.getNativeApplication().getPackageName()));
  // adHeadline.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_headline", "id", app.getNativeApplication().getPackageName()));
  // adAdvertiser.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_advertiser", "id", app.getNativeApplication().getPackageName()));
  // adBody.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_body", "id", app.getNativeApplication().getPackageName()));
  // adPrice.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_price", "id", app.getNativeApplication().getPackageName()));
  // adStore.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_store", "id", app.getNativeApplication().getPackageName()));
  // adCallToAction.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_call_to_action", "id", app.getNativeApplication().getPackageName()));

  page.bindingContext = model;
}

export function loadNativeAds(): void {
  // const settings = {
  //   testing: true,
  //   ad_unit_id: "ca-app-pub-3940256099942544/1044960115",
  //   totalAds: 2,
  //   adChoicesPlacement: firebase.admob.ADCHOICES_PLACEMENT.ADCHOICES_TOP_RIGHT,
  //   mediaAspectRatio: firebase.admob.MEDIA_ASPECT_RATIO.NATIVE_MEDIA_ASPECT_RATIO_SQUARE,
  //   // imageOrientation: firebase.admob.IMAGE_ORIENTATION.ORIENTATION_LANDSCAPE,  // depreciated in favor of mediaAspectRatio
  //   requestMultipleImages: true,
  //   startMuted: false, // videoOptions
  //   customControlsRequested: false, // videoOptions
  //   clickToExpandRequested: false
  // }
  // console.log('Loading Native Ad');
  // firebase.admob.loadNativeAds(settings).then(result => {
  //   // only guaranteed assets
  //   // headline, body, callToAction
  //   console.log('Total number of ads returned: ' + result.length);
  //   console.log(result[0].getImages().size());
  //   // page.getViewById("ad_headline").text = result[0].getHeadline();
  //   // page.getViewById("ad_advertiser").text = result[0].getAdvertiser();
  //   // // page.getViewById("ad_attribution").text = result[0].getAdChoicesInfo().getText().toString();
  //   // page.getViewById("ad_attribution_icon").src = result[0].getAdChoicesInfo().getImages().get(0).getUri().toString();
  //   // page.getViewById("ad_body").text = result[0].getBody();
  //   // page.getViewById("ad_icon").src = result[0].getIcon().getUri().toString();
  //   // page.getViewById("ad_price").text = result[0].getPrice();
  //   // page.getViewById("ad_store").text = result[0].getStore();
  //   // page.getViewById("ad_call_to_action").text = result[0].getCallToAction();
  //   console.log(result[0].getIcon().getUri());

  //   for (var i = 0; i < result.length; i++) {
  //     console.log(i);
  //     console.log(result[i].getHeadline());
  //   }
  // }).catch(error => {
  //   console.log(error);
  // })
}

// TODO remove or add in a storage option for ads
function destroyNativeAds(): void {
  // console.log(firebase.admob.nativeAds);
  // if(firebase.admob.nativeAds !== undefined && firebase.admob.loadNativeAds.length > 0) {
  //   for (let i = 0; i < firebase.admob.nativeAds.length; i++) {
  //     firebase.admob.nativeAds[i].destroy();
  //   }
  //   firebase.admob.nativeAds = [];
  // }
}
