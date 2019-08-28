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

  const adView = page.getViewById("ad_view");
  const adAttribution = page.getViewById("ad_attribution")

  adView.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_view", "id", app.getNativeApplication().getPackageName()));
  adAttribution.android.setId(app.getNativeApplication().getResources().getIdentifier("ad_attribution", "id", app.getNativeApplication().getPackageName()));

  page.bindingContext = model;
}
