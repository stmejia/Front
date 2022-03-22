import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';


@Injectable({
  providedIn: 'root'
})

export class ToolsService {

  logoApp = './assets/img/LogoApp.png';

  constructor(configService: ConfigService) { }

  getLogo() {
    return this.logoApp;
  }

  getLogoB64(callback) {
    if (!window.FileReader) {
      callback(null);
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', this.logoApp);
    xhr.send();
  }

}
