import { Textos } from './../../data/models/textos';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ConfigService } from './../../data/services/config.service';
import { RecursoService } from './../../data/services/recurso.service';
import { Recurso } from './../../data/models/recurso';
import { AtributoAsig } from './../../data/models/asigAtributo';
import { Usuario } from "./../../data/models/usuario";
import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";

@Component({
  selector: "app-ajustes",
  templateUrl: "./ajustes.component.html",
  styleUrls: ["./ajustes.component.css"],
})

export class AjustesComponent implements OnInit {

  tema: string = "default-theme";
  tipoTema: string = '';
  idioma: string = "ES";

  usuario = new Usuario();
  atributos: AtributoAsig[] = [];
  recursos: Recurso[] = [];
  cargandoDatos: boolean = true;
  textos: Textos = null;
  modulo: string = "";
  estacion: string = "";
  img: string = "";

  constructor(private configService: ConfigService, private recursoService: RecursoService,
    private location: Location, public sweetService: SweetService) {

    if (localStorage.getItem("tema")) {
      this.tema = localStorage.getItem("tema")!;
      this.tipoTema = localStorage.getItem("tipoTema")!;
    }

    if (localStorage.getItem("idioma")) {
      this.idioma = localStorage.getItem("idioma");
    }

    this.sincronizarDatos();
  }

  ngOnInit(): void {
  }

  async sincronizarDatos() {

    await this.configService.getTextos().then(res => {
      this.textos = res;
    }).catch(e => {
      console.log(e);
    });

    this.configService.getUsuario().subscribe(res => {
      if (res) {
        this.usuario = res;

        //Cambiar metodo de los for
        for (let modulo of this.usuario.modulos) {
          if (modulo.id == this.usuario.moduloId) {
            this.modulo = modulo.nombre;
          }
        }

        for (let estacion of this.usuario.estacionesTrabajoAsignadas) {
          if (estacion.estacionTrabajoId == this.usuario.estacionTrabajoId) {
            this.estacion = estacion.estacionTrabajo.nombre;
          }
        }

        if (this.usuario.imagenPerfil) {
          if (this.usuario.imagenPerfil.imagenDefault) {
            if (this.usuario.imagenPerfil.imagenDefault.urlImagen) {
              this.img = this.usuario.imagenPerfil.imagenDefault.urlImagen;
            } else {
              this.img = this.configService.getConfigImgPerfil().urlImagenDefaul;
            }
          } else {
            this.img = this.configService.getConfigImgPerfil().urlImagenDefaul;
          }
        } else {
          this.img = this.configService.getConfigImgPerfil().urlImagenDefaul;
        }
        for (let estacion of this.usuario.estacionesTrabajoAsignadas) {
          estacion.estacionTrabajo.recursos = [];
        }
      } else {
        this.cargandoDatos = false;
      }
    })

    this.cargarDatos();
  }

  async cargarDatos() {
    if (this.usuario.id) {
      for (let recurso of this.configService.getRecursosAsignados()) {
        await this.recursoService.consultar<Recurso>(recurso.recurso_id.toString()).toPromise().then(res => {
          for (let estacion of this.usuario.estacionesTrabajoAsignadas) {
            if (estacion.estacionTrabajoId == recurso.estacionTrabajo_id) {
              res.opciones = recurso.opcionesAsignadas;
              estacion.estacionTrabajo.recursos.push(res);
            }
          }
        });
      }
    }

    this.cargandoDatos = false;
  }

  btnGuardarTema() {
    localStorage.setItem("tema", this.tema);
    localStorage.setItem("tipoTema", this.tipoTema);
    window.location.reload();
  }

  btnGuardarIdioma() {
    localStorage.setItem("idioma", this.idioma);
    localStorage.removeItem('textos');
    window.location.reload();
  }

  async btnSincronizar() {
    this.sweetService.sweet_confirmacion('¿Actualizar Información?', 'Se actualizara la página, es posible que la configuracion actual cambie. ¿Desea Continuar?')
      .then(async res => {
        if (res.isConfirmed) {
          localStorage.removeItem('textos');
          await this.configService.sincronizarDatos().then(res => {
            window.location.reload();
          });
        }
      });
  }

  btnCerrarSesion() {
    this.configService.cerrarSesion();
  }

  back() {
    this.location.back();
  }
}
