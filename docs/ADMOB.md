<img src="https://raw.githubusercontent.com/EddyVerbruggen/nativescript-plugin-firebase/master/docs/images/features/admob.png" height="85px" alt="AdMob"/>

<img src="https://raw.githubusercontent.com/EddyVerbruggen/nativescript-plugin-firebase/master/docs/images/admob-types.png" height="262px" alt="AdMob Ad Types"/>

_AdMob currently supports these three types of Ads, as does this plugin_

## Enabling AdMob

### Android
> ⚠️ Important! Plugin version 7.4.0+ requires you to do this - or your app will crash on start-up! ⚠️

Open your App_Resources/Android/AndroidManifest.xml file and add this `meta-data` line at [the right spot](https://github.com/EddyVerbruggen/nativescript-plugin-firebase/blob/3fe3f6b4b9d1b83b048b10472bec923f64e08c75/demo/app_resources/Android/src/main/AndroidManifest.xml#L28-L30) (and replace the value by the actual App ID of [your app](https://apps.admob.com/)!):

```xml
<application>
  <!-- this line needs to be added (replace the value!) -->
  <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-3940256099942544~3347511713" />

  <activity></activity>
</application>
```

### iOS

> ⚠️ Important! Plugin version 8.2.0+ requires you to do this - or your app will crash on start-up! ⚠️

As can be read [here](https://developers.google.com/admob/ios/quick-start#update_your_infoplist) you should open your
App_Resources/iOS/Info.plist file and add this `GADApplicationIdentifier` key and replace the value by the actual App ID of [your app](https://apps.admob.com/)!:

```xml
  <key>GADApplicationIdentifier</key>
  <string>ca-app-pub-9517346003011652~2508636525</string>
```

#### App Transport Security
Open `app/App_Resources/iOS/Info.plist` and add this to the bottom:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
  <key>NSAllowsArbitraryLoadsForMedia</key>
  <true/>
  <key>NSAllowsArbitraryLoadsInWebContent</key>
  <true/>
</dict>
```

[More info on this subject.](https://firebase.google.com/docs/admob/ios/app-transport-security)

## Functions
> Note that it may take up to 24 hours after adding an Ad to your [AdMob console](https://apps.admob.com) before it's available for your app. Until then you'll see a ⚠️ warning about an unknown Ad ID.

### admob.showBanner
Go [manage your AdMob app](https://apps.admob.com) and grab the banner, then show it in your app:

```js
  firebase.admob.showBanner({
    size: firebase.admob.AD_SIZE.SMART_BANNER, // see firebase.admob.AD_SIZE for all options
    margins: { // optional nr of device independent pixels from the top or bottom (don't set both)
      bottom: 10,
      top: -1
    },
    androidBannerId: "ca-app-pub-9517346003011652/7749101329",
    iosBannerId: "ca-app-pub-9517346003011652/3985369721",
    testing: true, // when not running in production set this to true, Google doesn't like it any other way
    iosTestDeviceIds: [ //Android automatically adds the connected device as test device with testing:true, iOS does not
        "45d77bf513dfabc2949ba053da83c0c7b7e87715", // Eddy's iPhone 6s
        "fee4cf319a242eab4701543e4c16db89c722731f"  // Eddy's iPad Pro
    ],
    keywords: ["keyword1", "keyword2"] // add keywords for ad targeting
  }).then(
      function () {
        console.log("AdMob banner showing");
      },
      function (errorMessage) {
        dialogs.alert({
          title: "AdMob error",
          message: errorMessage,
          okButtonText: "Hmmkay"
        });
      }
  );
```

### admob.hideBanner
Easy peasy:

```js
  firebase.admob.hideBanner().then(
      function () {
        console.log("AdMob banner hidden");
      },
      function (errorMessage) {
        dialogs.alert({
          title: "AdMob error",
          message: errorMessage,
          okButtonText: "Hmmkay"
        });
      }
  );
```

### admob.showInterstitial
This is a fullscreen ad, so you can earn extra credit on the eternal ladder of annoyance.

Note that an interstitial is supposed to be hidden by clicking the close button, so there's no function to do it programmatically.

If you want to get notified when an interstitial is closed, provide an `onAdClosed` callback as shown below.

There's two ways how you can use this function:

* **RECOMMENDED**: without arguments, and after the Promise of `preloadInterstitial` resolves. This will show the interstitial immediately.
* **DEPRECATED**: with arguments (same as `preloadInterstitial`). This will preload and *then* show the interstitial, so a delay will be noticable by the user, which is against Google's policies.

```js
  firebase.admob.preloadInterstitial({
    iosInterstitialId: "ca-app-pub-9517346003011652/6938836122",
    androidInterstitialId: "ca-app-pub-9517346003011652/6938836122",
    testing: true, // when not running in production set this to true, Google doesn't like it any other way
    iosTestDeviceIds: [ // Android automatically adds the connected device as test device with testing:true, iOS does not
        "45d77bf513dfabc2949ba053da83c0c7b7e87715", // Eddy's iPhone 6s
        "fee4cf319a242eab4701543e4c16db89c722731f"  // Eddy's iPad Pro
    ],
    onAdClosed: () => console.log("Interstitial closed")
  }).then(
      function () {
        console.log("AdMob interstitial preloaded, you can now call 'showInterstitial' at any time to show it without delay.");
      },
      function (errorMessage) {
        dialogs.alert({
          title: "AdMob error",
          message: errorMessage,
          okButtonText: "Hmmkay"
        });
      }
  );
```

After the preload Promise resolved successfully, you can show the interstitial at any time you want:

```js
  firebase.admob.showInterstitial().then(
      function () {
        console.log("AdMob interstitial showing.");
      },
      function (errorMessage) {
        dialogs.alert({
          title: "AdMob error",
          message: errorMessage,
          okButtonText: "Hmmkay"
        });
      }
  );
```

### preloadRewardedVideoAd
Use this for instance while loading your view, so it's ready for the moment you want to actually show it (by calling `showRewardedVideoAd`).

```js
firebase.admob.preloadRewardedVideoAd({
    testing: true,
    iosAdPlacementId: "ca-app-pub-XXXXXX/YYYYY2", // add your own
    androidAdPlacementId: "ca-app-pub-AAAAAAAA/BBBBBB2", // add your own
    keywords: ["keyword1", "keyword2"], // add keywords for ad targeting
  }).then(
      function() {
        console.log("RewardedVideoAd preloaded - you can now call 'showRewardedVideoAd' whenever you're ready to do so");
      },
      function(error) {
        console.log("admob preloadRewardedVideoAd error: " + error);
      }
)
```

### showRewardedVideoAd
At any moment after `preloadRewardedVideoAd` successfully resolves, you can call `showRewardedVideoAd`.

Note that when you want to use `showRewardedVideoAd` again, you also have to use `preloadRewardedVideoAd` again because those ads can't be reused.

`onRewarded` is probably the only callback you need to worry about.

```js
firebase.admob.showRewardedVideoAd({
  onRewarded: (reward) => {
    // the properties 'amount' and 'type' correlate to the values set at https://apps.admob.com
    console.log("onRewarded called with amount " + reward.amount);
    console.log("onRewarded called with type " + reward.type);
  },
  onLeftApplication: () => console.log("onLeftApplication"),
  onClosed: () => console.log("onClosed"),
  onOpened: () => console.log("onOpened"),
  onStarted: () => console.log("onStarted"),
  onCompleted: () => console.log("onCompleted"),
}).then(
      function() {
        console.log("RewardedVideoAd showing");
      },
      function(error) {
        console.log("showRewardedVideoAd error: " + error);
      }
)
```

### loadNativeAds (Curently Android Only)
This is used to load a nativeAd that you can load into the NativeAdViewLayout. You'll need to make sure to include a template for your ad in your `app_resoures/Android/src/main/res/layout`. This is where you can customize the look and feel of the ad. This can be used in a listView or any other layout. Make sure to test with google's test ad_unit_id `ca-app-pub-3940256099942544/2247696110`

```js
const settings = {
  testing: true,  // change to false for production
  ad_unit_id: "ca-app-pub-3940256099942544/2247696110", // add your own when ready for production... this is googles test ad_unit_id
  totalAds: 5 // number can be 1 through 5
}

firebase.admob.loadNativeAds(settings).then(nativeAdsArray => {
  console.log("NativeAds returned: " + result.length);
  // Note even if you requested 5 ads you might not get 5 ads back
  if (result.length <= 0) {
    return
  }
  // store results to pass into NativeAdViewLayout
}).catch(error => {
  console.log(error);
})
```
The results contain an array of UnifiedNativeAd objects that need to be passed into the NativeAdViewLayout in order to be displayed.

In the example below, {{ items }} contains an array of UnifiedNativeAd objects and the app's normal content where {{ DoLoadNativeAds }} is a function that determines which template to use.
```xml
<Page xmlns:ui="nativescript-plugin-firebase/admob/nativead">
<ListView items="{{ items }}" height="100%" loadMoreItems="{{ doLoadNativeAds }}" itemTemplateSelector="{{ doSelectItemTemplate }}">
  <ListView.itemTemplates >
    <template key="ad">
      <StackLayout>
        <ui:NativeAdViewLayout ad="{{ $value }}" file="ad_unified" width="100%" />
      </StackLayout>
    </template>
    <template key="card">
      <StackLayout>
        <Label text="Your normal content would go here" />
      </StackLayout>
    </template>
  </ListView.itemTemplates>
</ListView>
</Page>
```
The NativeAdViewLayout looks for a the file you named in the `app_resoures/Android/src/main/res/layout` directory. This is where you can modify the look and feel of your nativeAd.

app_resoures/Android/src/main/res/layout/ad_unified.xml
```xml
<com.google.android.gms.ads.formats.UnifiedNativeAdView xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/ad_view"
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:background="#FFFFFF"
        android:minHeight="50dp"
        android:orientation="vertical">

        <TextView
            android:id="@+id/ad_attribution"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_gravity="left"
            android:textColor="#FFFFFF"
            android:textSize="12sp"
            android:text="Ad"
            android:background="#FFCC66"
            android:width="15dp"
            android:height="15dp"/>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:paddingLeft="20dp"
            android:paddingRight="20dp"
            android:paddingTop="3dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="horizontal">

                <ImageView
                    android:id="@+id/ad_icon"
                    android:layout_width="40dp"
                    android:layout_height="40dp"
                    android:adjustViewBounds="true"
                    android:paddingBottom="5dp"
                    android:paddingRight="5dp"
                    android:paddingEnd="5dp"/>

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="vertical">

                    <TextView
                        android:id="@+id/ad_headline"
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:textColor="#0000FF"
                        android:textSize="16sp"
                        android:textStyle="bold" />

                    <LinearLayout
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content">

                        <TextView
                            android:id="@+id/ad_advertiser"
                            android:layout_width="wrap_content"
                            android:layout_height="match_parent"
                            android:gravity="bottom"
                            android:textSize="14sp"
                            android:textStyle="bold"/>

                        <RatingBar
                            android:id="@+id/ad_stars"
                            style="?android:attr/ratingBarStyleSmall"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:isIndicator="true"
                            android:numStars="5"
                            android:stepSize="0.5" />
                    </LinearLayout>

                </LinearLayout>
            </LinearLayout>

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical">

                <TextView
                    android:id="@+id/ad_body"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginRight="20dp"
                    android:layout_marginEnd="20dp"
                    android:textSize="12sp" />

                <com.google.android.gms.ads.formats.MediaView
                    android:id="@+id/ad_media"
                    android:layout_gravity="center_horizontal"
                    android:layout_width="250dp"
                    android:layout_height="175dp"
                    android:layout_marginTop="5dp" />

                <LinearLayout
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_gravity="end"
                    android:orientation="horizontal"
                    android:paddingBottom="10dp"
                    android:paddingTop="10dp">

                    <TextView
                        android:id="@+id/ad_price"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:paddingLeft="5dp"
                        android:paddingStart="5dp"
                        android:paddingRight="5dp"
                        android:paddingEnd="5dp"
                        android:textSize="12sp" />

                    <TextView
                        android:id="@+id/ad_store"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:paddingLeft="5dp"
                        android:paddingStart="5dp"
                        android:paddingRight="5dp"
                        android:paddingEnd="5dp"
                        android:textSize="12sp" />

                    <Button
                        android:id="@+id/ad_call_to_action"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:gravity="center"
                        android:textSize="12sp" />
                </LinearLayout>
            </LinearLayout>
        </LinearLayout>
    </LinearLayout>
</com.google.android.gms.ads.formats.UnifiedNativeAdView>
```
When editing ad_unified.xml it is important to not rename the android ids as they are used to register and populate the unifiedNativeAdView with the correct values. Also not all ads will return all of the content. Required fields are headline, body, and call to action. If the content is not present the unifiedNativeAdView will not display it.
#### Important Notes
- You should always test with google's [test ads](https://developers.google.com/admob/android/test-ads?hl=en-US).
- When using `loadNativeAds()` NativeAd objects that have been around longer than an hour and havn't been displayed should be discarded and replaced with new ads.
- You are responsible for destroying the nativeAds that are returned from loadNativeAds... simply call `.destroy()` on the nativeAd you wish to get rid of. Failure to do so can result in memory leaks.
- NativeAds best [practices](https://admob.google.com/home/resources/native-ads-playbook/)
- Counting [impressions](https://support.google.com/admanager/answer/2521337?hl=en) happen when ad comes into screen veiw for mobile. 
- Metric definitions for admob can be found [here](https://developers.google.com/admob/android/reporting#metrics)
## What about the nativescript-admob plugin?
There's no functional difference between the AdMob features in the Firebase plugin and
[nativescript-admob](https://github.com/EddyVerbruggen/nativescript-admob).

The main advantage of using the version in the Firebase plugin is to avoid a gradle build conflict
in the Android build you may encounter when including both plugins in your app.
