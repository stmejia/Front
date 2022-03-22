import { Modulo } from './../models/modulo';
import { Textos } from './../models/textos';
import { NavigationEnd, Router } from '@angular/router';
import { RecursoAsignado } from './../models/asigAtributo';
import { AsigEstacion } from './../models/asigEstacion';
import { SelectEstacionComponent } from './../../config/components/select-estacion/select-estacion.component';
import { SweetService } from './../../../@page/services/sweet.service';
import { HttpClient } from '@angular/common/http';
import { ImagenRecursoConfiguracion } from './../models/imagenRecursoConfiguracion';
import { AuthService } from './../../security/services/auth.service';
import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario';
import { first, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Empresa } from '../models/empresa';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {

  private usuario: Usuario = new Usuario();
  private estacion: AsigEstacion;
  private modulo: Modulo;
  private recursosAsignados: RecursoAsignado[];
  private estaciones = new BehaviorSubject<AsigEstacion[]>([]);
  private estacionSubject = new BehaviorSubject<AsigEstacion>(null);
  private usuarioSubject = new BehaviorSubject<Usuario>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private moduloSubject = new BehaviorSubject<Modulo>(null);
  private modulos = new BehaviorSubject<Modulo[]>([]);
  private textos: Textos;
  private iconosModulos: any;
  private empresas = new BehaviorSubject<Empresa[]>([]);

  //Configuracion de Imagen
  private imgConfigPerfil: ImagenRecursoConfiguracion;
  private imgConfigLogoEmpresa: ImagenRecursoConfiguracion;
  private listaImagenesRecursosConfig: ImagenRecursoConfiguracion[];

  //Url's EndPoint
  private urlEndPoint: string =
    environment.UrlAguilaApi;

  constructor(private http: HttpClient, private authService: AuthService,
    public sweetService: SweetService, public dialog: MatDialog, private location: Location,
    private router: Router) {
    this.cargarDatos();
  }

  cargarDatos() {
    if (this.authService.isAuthenticated()) {
      this.cargarUsuario();
    } else {
      this.router.navigate(['/security/login']);
      this.cargando.next(false);
    }
  }

  async getTextos() {
    if (this.textos) {
      return this.textos;
    } else {
      if (localStorage.getItem("textos")) {
        this.textos = JSON.parse(localStorage.getItem('textos'));
        return this.textos;
      }

      let idioma = 'ES';
      if (localStorage.getItem("idioma")) {
        idioma = localStorage.getItem("idioma");
      }

      switch (idioma) {
        case 'ES':
          await this.http.get("./assets/lenguajes/ES.json").toPromise().then((res: Textos) => {
            this.textos = res;
            localStorage.setItem("textos", JSON.stringify(this.textos));
            return this.textos;
          });
          break;

        case 'EN':
          await this.http.get("./assets/lenguajes/EN.json").toPromise().then((res: Textos) => {
            this.textos = res;
            localStorage.setItem("textos", JSON.stringify(this.textos));
            return this.textos;
          })
          break;
      }
      return this.textos;
    }
  }

  //Carga la informacion del Usuario
  //Esto incluye establecer la estacion de trabajo en la que se trabajara
  //Tambien se Carga Configuracion para las Imagenes a utilizar (ImagenPerfil, LogoEmpresa)
  cargarUsuario() {
    this.usuario = this.authService.usuario;
    //Validamos si el usuario existe
    if (this.usuario) {
      //Obtenemos la estacion de trabajo por defecto
      this.estacion = this.usuario.estacionesTrabajoAsignadas.find(el => el.estacionTrabajoId == this.usuario.estacionTrabajoId);
      this.usuario.estacionesTrabajoAsignadas.forEach(est => {
        let emp = est.estacionTrabajo.sucursal.empresa;
        if (this.empresas.value.filter(e => e.id == emp.id).length == 0) {
          this.empresas.value.push(emp);
        }
      });
      //Obtenemos el modulo por defecto
      this.modulo = this.usuario.modulos.find(el => el.id == this.usuario.moduloId);
      if (!this.modulo) {
        this.sweetService.sweet_carga("Sin modulo asignado, comunicate con el administrador del sistema.");
      } else {
        this.moduloSubject.next(this.modulo);
        this.modulos.next(this.usuario.modulos.filter(el => el.id !== this.modulo.id));
        //Si la estacion de trabajo por defecto no esta asignada mostramos un mensaje al usuario
        if (!this.estacion) {
          this.sweetService.sweet_carga("No tienes estaciones de trabajo asignadas, comunicate con el administrador del sistema.");
        } else {
          //Si la estacion esta asignada la cargamos a memoria
          this.estacionSubject.next(this.estacion);
          this.estaciones.next(this.usuario.estacionesTrabajoAsignadas.filter(el => el.estacionTrabajoId !== this.estacion.estacionTrabajoId));
          forkJoin([
            this.cargarConfigLogoEmpresa().pipe(first()),
            this.cargarConfigImgPerfil().pipe(first()),
            this.cargarRecursosAsignados(this.usuario.id).pipe(first()),
            this.cargarImagenRecursoConfiguracion().pipe(first()),
            this.cargarIconosModulos()
          ]).subscribe(res => {
            this.imgConfigLogoEmpresa = res[0];
            this.imgConfigPerfil = res[1];
            this.recursosAsignados = res[2];
            this.listaImagenesRecursosConfig = res[3];
            this.usuarioSubject.next(this.usuario);
            this.iconosModulos = res[4];
            this.cargarModulo(this.modulo.nombre, true, this.modulo);
            this.cargando.next(false);
          }, (error) => {
            this.sweetService.sweet_carga("La aplicación no pudo cargar la configuración inicial, vuelva a cargar la pagina o intente más tarde");
          });
        }
      }
    } else {
      this.sweetService.sweet_alerta("Error", "No fue posible obtener la informacion del usuario", 'error');
      this.authService.logout();
      this.router.navigate(['/security/login']);
      this.cargando.next(false);
    }
  }

  cargarConfigImgPerfil() {
    return this.http.get(this.urlEndPoint + `/api/Usuarios/ImagenConfiguracion/imagenPerfil`).pipe(
      map((res: any) => res.aguilaData as ImagenRecursoConfiguracion));
  }

  cargarConfigLogoEmpresa() {
    return this.http.get(this.urlEndPoint + `/api/Empresas/ImagenConfiguracion/imagenLogo`).pipe(
      map((res: any) => res.aguilaData as ImagenRecursoConfiguracion));
  }

  cargarImagenRecursoConfiguracion() {
    return this.http.get(this.urlEndPoint + `/api/ImagenesRecursosConfiguracion`).pipe(
      map((res: any) => res.aguilaData as ImagenRecursoConfiguracion[]));
  }

  cargarRecursosAsignados(idUsuario: number) {
    return this.http.get(this.urlEndPoint + `/api/UsuariosRecursos/${idUsuario}`).pipe(
      map((res: any) => res.aguilaData as RecursoAsignado[]),
    );
  }

  cargarIconosModulos() {
    return this.http.get("./assets/iconos/modulos.json");
  }

  //Devuelve la configuracion
  getConfigImgPerfil(): ImagenRecursoConfiguracion {
    return this.imgConfigPerfil;
  }

  //Devuelve la configuracion
  getConfigLogoEmpresa(): ImagenRecursoConfiguracion {
    return this.imgConfigLogoEmpresa;
  }

  //Devuelve la informacion del usuario
  getUsuario(): Observable<Usuario> {
    return this.usuarioSubject;
  }

  getUsuarioValue() {
    return this.usuarioSubject.value;
  }

  //Devuelve la Estacion de Trabajo que esta en uso
  getEstacionTrabajo(): Observable<AsigEstacion> {
    return this.estacionSubject.asObservable();
  }

  //Devuelve las Estaciones de Trabajo Disponibles para el Usuario Logueado
  getEstacionesTrabajo(): Observable<AsigEstacion[]> {
    //this.estaciones.next(this.usuario.estaciones.filter(el=> el.id!== this.estacion.id));
    return this.estaciones.asObservable();
  }

  getEstacionTrabajoV() {
    return this.estacionSubject.value.estacionTrabajo;
  }

  getModulos(): Observable<Modulo[]> {
    return this.modulos.asObservable();
  }

  getModulo(): Observable<Modulo> {
    return this.moduloSubject.asObservable();
  }

  getModuloValue(): Modulo {
    return this.moduloSubject.value;
  }

  getRecursosAsignados() {
    return this.recursosAsignados;
  }

  //Cierra la sesion del usuario
  cerrarSesion() {
    this.sweetService.sweet_confirmacion(this.usuario.nombre, '¿Desea cerrar sesión?', 'question')
      .then(res => {
        if (res.isConfirmed) {
          this.usuario = null;
          this.usuarioSubject.next(this.usuario);
          this.authService.logout();
        }
      });
  }

  //Cambia la estacion de trabajo actual
  cambiarEstacionTrabajo(estacion: AsigEstacion) {
    if (this.estacion.id == estacion.id) {
      this.sweetService.sweet_notificacion("Estación de trabajo activa", 5000, 'info');
    } else {
      this.sweetService.sweet_confirmacion('Advertencia', `¿Desea cambiar la estación de trabajo a ${estacion.estacionTrabajo.nombre}?`, 'question')
        .then(res => {
          if (res.isConfirmed) {
            this.estacion = estacion;
            this.estacionSubject.next(this.estacion);
            this.estaciones.next(this.usuario.estacionesTrabajoAsignadas.filter(el => el.estacionTrabajoId !== this.estacion.estacionTrabajoId));
            this.router.navigate([this.modulo.path]);
          }
        });
    }
  }

  //Sincroniza la informacion del EndPoint con los datos guardados en memoria
  async sincronizarDatos() {
    this.sweetService.sweet_carga('Actualizando Información');
    await this.authService.setAuthenticatedUser(this.authService.token).toPromise().then(async res => {
      // await this.cargarUsuario().then(res => {
      //   this.textos = null;
      //   this.getTextos().then();
      //   this.sweetService.sweet_notificacion("Información Actualizada", 10000);
      // });
    }, (error) => {
      console.log(error);
    });
    return true;
  }

  //Abre una modal para Seleccionar una estacion de trabajo
  selectEstacion() {
    this.dialog.open(SelectEstacionComponent, {
      data: this.usuario.estacionesTrabajoAsignadas.filter(el => el.id !== this.estacion.id)
    });
  }

  //Metodo que valida si el usuario tiene permiso a una opcion del recurso
  opcionDisponible(RecursoId: number, opcion: string): boolean {
    if (this.authService.hasRole('SUPERADMIN')) {
      return true;
    }

    if (this.authService.hasRole('Soporte') && opcion.toUpperCase().trim() == "CONSULTAR") {
      return true;
    }

    //Pendiente Definir Rol de Administrador
    if (this.authService.hasRole('Administrador')) {
      return true;
    }

    let recurso = this.recursosAsignados
      .find(el => el.estacionTrabajo_id == this.estacion.estacionTrabajoId &&
        el.recurso_id == RecursoId);
    if (recurso) {
      let permiso = recurso.opcionesAsignadas.find(el => el.toUpperCase().trim() == opcion.toUpperCase().trim());

      if (permiso) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //Metodo que regresa a la pagina anterior
  regresar() {
    this.location.back();
  }

  cargarModulo(modulo: string, directo: boolean, mod: Modulo) {
    if (directo && environment.production) {
      this.moduloSubject.next(this.usuario.modulos.find(m => m.id == mod.id));
      this.modulos.next(this.usuario.modulos.filter(m => m.id != mod.id));
      this.router.navigate([mod.path]);
      this.mensajeBienvenida();
      this.monitorearRuta();
    } else {
      this.sweetService.sweet_confirmacion('Advertencia', `¿Desea ingresar al modulo ${modulo}?`, 'question')
        .then(res => {
          if (res.isConfirmed) {
            this.moduloSubject.next(this.usuario.modulos.find(m => m.id == mod.id));
            this.modulos.next(this.usuario.modulos.filter(m => m.id != mod.id));
            //this.usuario.modulos.find(m => m.id == mod.id)
            this.router.navigate([mod.path]);
            return;
          }
        });
    }
  }

  cambiarConfiguracion() {
    this.moduloSubject.next(this.modulo);
    this.modulos.next(this.usuario.modulos.filter(el => el.id !== this.modulo.id));
  }

  mensajeBienvenida() {
    this.sweetService.sweet_alerta(
      "Bienvenido",
      `Hola ${this.usuario.nombre}, has iniciado sesión con éxito`,
      "success"
    );
  }

  isLogin() {
    return this.authService.isAuthenticated();
  }

  getCargando(): Observable<boolean> {
    return this.cargando.asObservable();
  }

  getToken(): any {
    let token = this.authService.token;
    let payload = this.authService.obtenerDatosToken(token);
    return payload;
  }

  monitorearRuta() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.startsWith('/' + this.moduloSubject.value.path)) {
          return;
        } else {
          this.router.navigate([this.moduloSubject.value.path]);
        }
      }
    });
  }

  recargarModulo() {
    this.router.navigate([this.moduloSubject.value.path]);
  }

  getImagenRecursoConfiguracion(idRecurso, propiedad) {
    return this.listaImagenesRecursosConfig.find(imgRecursoConf => imgRecursoConf.recurso_Id == idRecurso && imgRecursoConf.propiedad.toLowerCase() == propiedad.toLowerCase());
  }

  getIconoModulo(ruta: string) {
    return this.iconosModulos[ruta];
  }

  navegar(ruta: string[]) {
    this.router.navigate(ruta);
  }

  getEmpresasAsignadas(): Observable<Empresa[]> {
    return this.empresas.asObservable();
  }

  getEmpresasAsignadasValue(): Empresa[] {
    return this.empresas.value;
  }

  isDarkMode() {
    if (localStorage.getItem('tipoTema')) {
      if (localStorage.getItem('tipoTema').toLocaleLowerCase().endsWith('dark')) {
        return true;
      }
    }

    return false;
  }

  getBaseURL() {
    return this.router.url;
  }

}

