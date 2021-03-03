import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

//this may not be necissary, I don't think it's being used now...
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

//START CUSTOM GESTURE ORIENTATION: 
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import * as Hammer from "hammerjs";

import { ModalPage } from './modal/modal.page';
import { IonicStorageModule } from '@ionic/storage';

export class CustomHammerConfig extends HammerGestureConfig {
  overrides = {
    'pan': {
      direction: Hammer.DIRECTION_ALL,
      threshold: 30
    },
    'swipe': {
      direction: Hammer.DIRECTION_ALL
    }
  }
}
//END CUSTOM GESTURE ORIENTATION

@NgModule({
  declarations: [AppComponent, ModalPage],
  entryComponents: [ModalPage],
  imports: [BrowserModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule],
  providers: [
  	ScreenOrientation,
    IonicStorageModule,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
