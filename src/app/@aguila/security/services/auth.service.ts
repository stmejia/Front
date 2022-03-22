import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Usuario } from "../../data/models/usuario";
import { map, catchError, tap } from "rxjs/operators";
import { Login } from "./login";
import { SweetService } from "./../../../@page/services/sweet.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})

export class AuthService {
  private urlEndPoint: string = environment.UrlAguilaApi;
  private urlCaptcha: string = "https://www.google.com/recaptcha/api/siteverify";
  private _usuario: Usuario;
  private _token: string;

  constructor(
    private http: HttpClient,
    private sweetService: SweetService,
    private router: Router,
  ) { }

  // este metodo personalizado, regresa el usuario si ya fue seteado, si no lo busca en el session storage
  public get usuario(): Usuario {
    if (this._usuario != null) {
      return this._usuario;
    }
    if (this._usuario == null && sessionStorage.getItem("usuario") != null) {
      // si se encuentra el usuario en el session storage lo traemos de nuevo
      // utilizamos JSON.parse para convertir el string en un objeto de tipo usuario
      this._usuario = JSON.parse(sessionStorage.getItem("usuario")) as Usuario;
      return this._usuario;
    }
    return null;
  }

  public get token(): string {
    if (this._token != null) {
      return this._token;
    } else if (this._token == null && sessionStorage.getItem("token") != null) {
      // si se encuentra el token en el session storage lo traemos de nuevo
      this._token = sessionStorage.getItem("token");
      return this._token;
    }
    return null;
  }

  loginOld(usuario: Usuario): Observable<any> {
    const urlEndPoint = this.urlEndPoint;
    const credentials = btoa("AguilaApi" + ":" + "AguilaKeyPass");
    const httpHeaders = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + credentials,
    });
    let params = new URLSearchParams();
    params.set("grant_type", "password");
    params.set("username", usuario.username);
    params.set("password", usuario.password);
    console.log(params.toString());
    return this.http.post<any>(urlEndPoint, params.toString(), {
      headers: httpHeaders,
    });
  }

  //Metodo para iniciar Sesion, devuelve un token con la informacion del usuario
  login(login: Login): Observable<any> {
    this.sweetService.sweet_carga('Iniciando Sesión');
    return this.http.post(this.urlEndPoint + "/api/Security", login).pipe(
      map((response: any) => response.token as string),
      catchError((e) => {
        console.log(e);
        this.mostrarError(e);
        return throwError(e);
      })
    );
  }

  changePassword(usuario: Usuario, oldPassword: string): Observable<any> {
    const headers: HttpHeaders = new HttpHeaders({
      "Content-Type": `application/json`,
    });

    let prms: HttpParams = new HttpParams();
    prms = prms.set("oldPassword", oldPassword);

    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json" }),
      params: prms,
    };
    // Ejecutamos un post con Body y parameters, utilizando httpOptiones
    return this.http.post<any>(
      `${this.urlEndPoint}/usuario/changepassword`,
      usuario,
      httpOptions
    );
  }

  setAuthenticatedUser(accessToken: string): Observable<Usuario> {
    // Obtenemos el token que regresa Login y obtenemos el usuario desde el api
    // Con el Objetivo de obtener correctamente los Authorities y todos los permisos que tenga el usuario
    let payload = this.obtenerDatosToken(accessToken);
    let id = payload.UsuarioId; //Cambiar Con nuevo endpoint
    return this.http
      .get<Usuario>(`${this.urlEndPoint}/api/Usuarios/${id}`)
      .pipe(
        map((response: any) => response.aguilaData as Usuario),
        tap((usuario) => {
          this._usuario = usuario;
          // Guardamos el usuario en el session storage
          sessionStorage.setItem("usuario", JSON.stringify(usuario));
        }),
        catchError((e) => {
          console.log(e);
          this.mostrarError(e);
          return throwError(e);
        })
      );
  }

  guardarToken(accessToken: string): void {
    this._token = accessToken;
    sessionStorage.setItem("token", accessToken);
  }

  obtenerDatosToken(accessToken: string): any {
    if (accessToken != null) {
      // acceder a los datos del token regresado, el token tiene tres partes separados por un punto, obtenemos la parte de 2
      // decodificamos el token con la funcion atob
      // convertimos a un objeto de tipo JSON y retornamos la cual tendra todos los datos adicionales
      // regresados en el token, nota que en los datos adicionales regresamos user_name con guion bajo no confundir con la clase usuario
      return JSON.parse(atob(accessToken.split(".")[1]));
    }
    return null;
  }

  isAuthenticated(): boolean {
    // obtenemos el token del metodo get, ya que si no se encuentra asignada el atributo lo podemos traer del sessionstorage si existe
    let payload = this.obtenerDatosToken(this.token);
    if (payload != null && payload.UserName && payload.UserName.length > 0) {
      return true;
    }
    return false;
  }

  // este metodo se utiliza para verificar si un usuario tiene determinado rol
  hasRole(role: string): boolean {

    if (!this.usuario || !this.usuario.roles) {
      return false;
    }

    // ({name}) casteamos el objeto y especificamos un campo
    if (this.usuario.roles.filter((rol) => rol.nombre.toLocaleUpperCase().trim() === role.toUpperCase().trim()).length > 0) {
      return true;
    }

    return false;
  }

  logout(): void {
    // para cerrar la session del usuario
    // TODO se debe de ejecutar el metodo de logout del restapi y enviar el token actual para destruir el token en backend
    this._token = null;
    this._usuario = null;
    //localStorage.clear();
    sessionStorage.clear();
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    this.router.navigate(["/security"]);
  }

  //Muestra una alerta cuando se produce un error en las peticiones al endPoint
  mostrarError(e: any) {
    console.log(e);
    try {
      this.sweetService.sweet_alerta(
        e.error.aguilaErrores[0].titulo,
        e.error.aguilaErrores[0].detalle,
        "error"
      );
    } catch (error) {
      this.sweetService.sweet_alerta(`Error ${e.status}`,
        `No es posible interpretar el error, comuníquese con el administrador del sistema.`,
        'error');
    }
  }

  validarCaptcha(token: string) {
    return this.http.post(this.urlCaptcha + `?secret=6&response=${token}`, {})
      .pipe(
        map((response: any) => response.success as boolean)
      );
  }
}
