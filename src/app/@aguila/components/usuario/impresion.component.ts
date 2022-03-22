import { SweetService } from 'src/app/@page/services/sweet.service';
import { AuthService } from './../../security/services/auth.service';
import { ConfigService } from './../../data/services/config.service';
import { Component, HostListener, OnInit } from "@angular/core";
import { UsuarioService } from "./../../data/services/usuario.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Usuario } from "../../data/models/usuario";
import { RecursoAsignado } from "../../data/models/asigAtributo";
import { Recurso } from '../../data/models/recurso';
import { RecursoService } from '../../data/services/recurso.service';

@Component({
  selector: "app-impresion",
  templateUrl: "./impresion.component.html",
  styleUrls: ["./impresion.component.css"],
})
export class ImpresionComponent implements OnInit {
  usuario = new Usuario();
  fecha = new Date();
  datosListos = false;
  imagen: any = '';

  // Recursos
  recursosAsignados: RecursoAsignado[] = []; //guarda los recursos asignados del usuario
  recursosDisponibles: Recurso[] = []; //Guarda la informacion de los recursos

 /*  @HostListener("window:afterprint", ["$event"])
  onWindowAfterPrint() {
    //this.back();
  } */

  constructor(
    private router: Router, private activatedRoute: ActivatedRoute,
    private usuarioService: UsuarioService, private recursoService: RecursoService,
    private authService: AuthService, private configService: ConfigService,
    private sweetService:SweetService) {
    this.cargarRecurso();
  }

  ngOnInit(): void { }

  async cargarRecurso() {
    //Cargamos el recurso
    await this.configService.cargarDatos();
    await this.usuarioService.cargarRecurso();

  }

  async cargarDatos() {
    this.datosListos = false;
    //Cargamos la informacion del usuario


    //Cargamos los recursos que tiene asignado
    // await this.usuarioService.getRecursosAsignadosId(this.usuario.id).toPromise()
    //   .then(res => {
    //     this.recursosAsignados = res;
    //   }).catch(() => {
    //     this.back();
    //   });

    //Cargamos los recursos disponibles
    // await this.recursoService.getAll().toPromise().then(async res => {
    //   this.recursosDisponibles = res;
    //   for (let recurso of this.recursosDisponibles) {
    //     await this.recursoService.getId(recurso.id.toString()).toPromise()
    //       .then(res => {
    //         recurso.opciones = res.opciones
    //       });
    //   }
    // });

    //---Inicializamos la propiedad donde se guardaran los recursos 
    for (let estacion of this.usuario.estacionesTrabajoAsignadas) {
      estacion.estacionTrabajo.recursos = []
    }

    // --- Asignamos los recursos a las estaciones de trabajo
    for (let estacion of this.usuario.estacionesTrabajoAsignadas) {
      estacion.estacionTrabajo.recursos = this.recursosDisponibles;
    }

    // --- Ocultamos el Spinner de carga
    this.mostrarImagen();
  }

  isSelect(opcion: string, recursoId: number, estacionId: number): boolean {
    //recorremos la lista de los recursos asignados que tiene un usuario
    for (let recurso of this.recursosAsignados) {
      //Validamos si poseen la mista estacion de trabajo
      if (recurso.estacionTrabajo_id == estacionId) {
        //validamos si tienen el mismo id
        if (recurso.recurso_id == recursoId) {
          //Retorna True si la opcion se encuentra dentro de las opciones asignadas
          //De lo contrario retorna False
          return recurso.opcionesAsignadas.includes(opcion);
        }
      }
    }
    return false;
  }

  async mostrarImagen() {
    await this.configService.cargarDatos();
    this.configService.getEstacionTrabajo().subscribe(res => {
      console.log(res);

      let empresa = res.estacionTrabajo.sucursal.empresa;
      if (empresa.imagenLogo) {
        if (empresa.imagenLogo.imagenDefault) {
          if (empresa.imagenLogo.imagenDefault.urlImagen) {
            this.imagen = empresa.imagenLogo.imagenDefault.urlImagen;
          } else {
            this.imagen = this.configService.getConfigLogoEmpresa().urlImagenDefaul;
          }
        } else {
          this.imagen = this.configService.getConfigLogoEmpresa().urlImagenDefaul;
        }
      } else {
        this.imagen = this.configService.getConfigLogoEmpresa().urlImagenDefaul;
      }

      this.datosListos = true;
      this.print();
    })

  }

  print() {
    /*
    let printContents = document.getElementById("contenido").innerHTML;
    let originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
    //document.hasFocus();
*/

    const el = document.getElementById("contenido");

    
    //window.print();
  }

  back() {
    this.router.navigate(["/aguila/usuarios"]);
  }
}
