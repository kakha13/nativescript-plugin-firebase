import * as observable from "tns-core-modules/data/observable";
import * as pages from "tns-core-modules/ui/page";
import { HelloWorldModel } from "./main-view-model";
import * as app from 'tns-core-modules/application';

const model = new HelloWorldModel();

declare const android: any;

// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
  // Get the event sender
  let page = <pages.Page>args.object;

  // Getting Elements from nativescript id
  const adView = page.getViewById("ad_view");
  const adAttribution = page.getViewById("ad_attribution")
  const adIcon = page.getViewById("ad_icon")
  const adHeadline = page.getViewById("ad_headline")
  const adAdvertiser = page.getViewById("ad_advertiser")
  const adBody = page.getViewById("ad_body")
  const adPrice = page.getViewById("ad_price")
  const adStore = page.getViewById("ad_store")
  const adCallToAction = page.getViewById("ad_call_to_action")

  // Asigning android ids
  adView.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_view", "id", app.getNativeApplication().getPackageName()));
  adAttribution.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_attribution", "id", app.getNativeApplication().getPackageName()));
  adIcon.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_icon", "id", app.getNativeApplication().getPackageName()));
  adHeadline.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_headline", "id", app.getNativeApplication().getPackageName()));
  adAdvertiser.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_advertiser", "id", app.getNativeApplication().getPackageName()));
  adBody.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_body", "id", app.getNativeApplication().getPackageName()));
  adPrice.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_price", "id", app.getNativeApplication().getPackageName()));
  adStore.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_store", "id", app.getNativeApplication().getPackageName()));
  adCallToAction.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_call_to_action", "id", app.getNativeApplication().getPackageName()));

  page.bindingContext = model;
}
