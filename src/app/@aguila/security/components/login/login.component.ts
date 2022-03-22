import { environment } from './../../../../../environments/environment';
import { ConfigService } from './../../../data/services/config.service';
import { SweetService } from "./../../../../@page/services/sweet.service";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import swal from "sweetalert2";
import { AuthService } from "../../services/auth.service";
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  hide = true; //para mostrar u ocultar contraseña
  requisito: boolean = false;
  formLogin: FormGroup = new FormGroup({
    username: new FormControl("", [
      Validators.required,
      Validators.minLength(3),
    ]),
    password: new FormControl("", [Validators.required]),
    //captcha: new FormControl("", [Validators.required, Validators.minLength(5)])
  });
  desarrollo = !environment.production;

  codErrores = {
    passwordAnterior: "*Campor Requerido",
    password: "*Campor Requerido",
    passwordConfirmacion: "*Campor Requerido",
    username: "*Campor Requerido"
  };

  @ViewChild('recaptcha', { static: true }) recaptchaElement: ElementRef;
  @ViewChild('inputText', { static: true }) inputText: any;

  constructor(
    private router: Router, private sweetService: SweetService, private location: Location,
    private authService: AuthService, private configService: ConfigService
  ) {
    if (!this.desarrollo) {
      this.addRecaptchaScript();
      this.formLogin.addControl("captcha", new FormControl("", [Validators.required, Validators.minLength(5)]));
    }
  }

  ngOnInit(): void {
    this.configService.getTextos().then();
    if (this.authService.isAuthenticated()) {
      this.authService.setAuthenticatedUser(this.authService.token).subscribe(res => {
        /* this.sweetService
          .sweet_alerta('Login', `Hola ${this.authService.usuario.nombre} ya estas autenticado`, 'info'); */
      }, (error) => {
        console.log(error);
        this.authService.logout();
        this.sweetService.sweet_alerta('Error', 'No es posible obtener la informacion del usuario', 'error');
      })
      this.configService.cargarUsuario();
    }
  }

  async login() {

    if (this.formLogin.controls["passwordAnterior"]) {
      this.formLogin.controls["passwordAnterior"].enable();
      this.formLogin.controls["username"].enable();
    }

    if (!this.formLogin.valid) {
      this.sweetService.sweet_alerta(
        "Error",
        "Revise su usuario y contraseña",
        "error"
      );
    } else {
      this.authService.login(this.formLogin.value).subscribe(
        (response) => {
          if (response) {
            this.configService.getTextos();
            // guardamos la informacion en las propiedades de authService
            this.authService.guardarToken(response);
            // guardamos el usuario autenticado en authservice
            this.authService
              .setAuthenticatedUser(response)
              .subscribe(async (usuario) => {
                this.configService.cargarUsuario();
              }, (error) => {
                console.log(error);
                this.authService.logout();
                this.sweetService.sweet_alerta('Error', 'No es posible obtener la informacion del usuario', 'error');
              });
          }
        },
        (err) => {
          //console.log(err);
          if (err.error.aguilaErrores[0].estatus == 428) {
            this.formLogin.addControl("passwordAnterior", new FormControl());
            this.formLogin.addControl("passwordConfirmacion", new FormControl());
            this.formLogin.controls["passwordAnterior"].setValue(
              this.formLogin.controls["password"].value
            );
            this.formLogin.controls["passwordAnterior"].disable();
            this.formLogin.controls["username"].disable();
            this.formLogin.controls["password"].setValue("");
            this.formLogin.controls["password"].setErrors(["api"]);
            this.formLogin.controls["passwordConfirmacion"].setErrors(["api"]);
            this.requisito = true;
            this.formLogin.markAllAsTouched();
          }
          if (err.error.aguilaErrores[0].estatus == 406) {
            this.codErrores.password = "Contraseña no coincide";
            this.codErrores.passwordConfirmacion = "Contraseña no coincide";
            this.formLogin.controls["password"].setErrors(["api"]);
            //this.formLogin.controls["passwordConfirmacion"].setErrors(["api"]);
            this.formLogin.markAllAsTouched();
          }
        }
      );
    }
  }

  async btnRegresar() {
    // this.configService.cargarDatos().then(res => {
    //   this.router.navigate(['/aguila/']);
    // });
  }

  addRecaptchaScript() {
    window['grecaptchaCallback'] = () => {
      this.renderReCaptcha();
    }
    (function (d, s, id, obj) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = "https://www.google.com/recaptcha/api.js?onload=grecaptchaCallback&amp;render=explicit";
      js.async = true;
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'recaptcha-jssdk', this));
  }

  renderReCaptcha() {
    window['grecaptcha'].render(this.recaptchaElement.nativeElement, {
      'sitekey': '6LfWW1IaAAAAADn4KxnGXuIw6BfWQN-H87SfsrWm',
      'callback': (response) => {
        //console.log(response);
        /* this.authService.validarCaptcha(response).subscribe(res => {
          this.formLogin.controls["captcha"].setValue(res);
        }); */
        if (response) {
          this.formLogin.controls["captcha"].setValue(response);
          this.inputText.nativeElement.focus();
        }
      }
    });
  }
}
