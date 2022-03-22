import { RecursoAsignado } from './../../data/models/asigAtributo';
import { Recurso } from './../../data/models/recurso';
import { RecursoService } from './../../data/services/recurso.service';
import { AsigEstacion } from './../../data/models/asigEstacion';
import { SweetService } from './../../../@page/services/sweet.service';
import { Usuario } from './../../data/models/usuario';
import { EstaciontrabajoService } from './../../data/services/estaciontrabajo.service';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Textos } from './../../data/models/textos';
import { UsuarioService } from './../../data/services/usuario.service';
import { ConfigService } from './../../data/services/config.service';
import { Component, OnInit } from '@angular/core';
import { Paginador } from 'src/app/@page/models/paginador';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";


@Component({
  selector: 'app-consulta',
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.css']
})
export class ConsultaComponent implements OnInit {

  textos: Textos = null;
  datos: FormGroup;

  estacionesTrabajo: Estaciontrabajo[] = [];
  recursos: Recurso[] = [];
  usuarios: Usuario[] = [];
  usuariosOriginal: Usuario[]=[];
  recursosAsig: RecursoAsignado[] = [];
  estacionesAsig: AsigEstacion[] = [];
  paginador: Paginador = new Paginador();
  cargando: boolean = true;
  buscandoInfo: boolean = false;

  constructor(public configService: ConfigService, public usuarioService: UsuarioService,
    private estacionesService: EstaciontrabajoService, public sweetService: SweetService,
    private fb: FormBuilder, private recursoService: RecursoService) {

    this.datos = this.fb.group({
      filtroNombre: [''],
      idEstacion: [''],
      idRecurso: [''],
      elementosPagina: [5, [Validators.required, Validators.min(1), Validators.max(200)]]
    });

    this.cargarDatos();
  }

  ngOnInit(): void {
  }

  async cargarDatos() {
    await this.configService.getTextos().then(res => {
      this.textos = res;
    });

    await this.usuarioService.cargarRecurso();


  }

  async cargarEstaciones() {
    this.estacionesService.getDatos().toPromise().then(res => {
      this.estacionesTrabajo = res;
    });
  }

  async cargarRecursos() {
    this.recursoService.getDatos().toPromise().then(res => {
      this.recursos = res;
    });
  }

  // this.datos.controls[""].value
  async consultar(pageNumber: number) {
    // if (this.datos.controls["idEstacion"].value) {
    //   this.usuarios = [];
    //   if (this.datos.controls['idRecurso'].value) {
    //     await this.usuarioService.getRecursosParametros(pageNumber, this.datos.controls["elementosPagina"].value,
    //       this.datos.controls["idEstacion"].value, this.datos.controls['idRecurso'].value).toPromise().then(res => {
    //         this.recursosAsig = res;
    //         for (let dato of res) {
    //           this.usuarioService.getUsuarioId(dato.usuario_id).toPromise().then(res => {
    //             this.usuarios.push(res);
    //           });
    //         }
    //       });
    //     this.paginador = this.usuarioService.getPaginador();
    //     this.sweetService.sweet_notificacion('Datos cargados');
    //   } else {
    //     await this.usuarioService.getUsuariosEstacionId(this.datos.controls["idEstacion"].value,
    //       this.datos.controls["elementosPagina"].value, pageNumber).toPromise().then(res => {
    //         this.estacionesAsig = res;
    //         for (let dato of res) {
    //           this.usuarioService.getUsuarioId(dato.usuarioId).toPromise().then(res => {
    //             this.usuarios.push(res);
    //           });
    //         }
    //       });
    //     this.paginador = this.usuarioService.getPaginador();
    //     this.sweetService.sweet_notificacion('Datos cargados');
    //   }

    // } else {
    //   this.sweetService.sweet_alerta('Error', 'Complete los campos antes de continuar', 'error');
    //   this.datos.markAllAsTouched();
    // }
    console.log(this.usuariosOriginal);
    
  }

  //Muestra la imagen de perfil del usuario
  getImagen(user: Usuario): string {
    if (user.imagenPerfil) {
      if (user.imagenPerfil.imagenDefault) {
        if (user.imagenPerfil.imagenDefault.urlImagen) {
          return user.imagenPerfil.imagenDefault.urlImagen;
        } else {
          return this.configService.getConfigImgPerfil().urlImagenDefaul;
        }
      } else {
        return this.configService.getConfigImgPerfil().urlImagenDefaul;
      }
    } else {
      return this.configService.getConfigImgPerfil().urlImagenDefaul;
    }
  }

  eliminarAsignacion(usuario: Usuario) {
    let asig = this.recursosAsig.find(el => el.usuario_id === usuario.id);
    let estacion = this.estacionesTrabajo.find(el => el.id === asig.estacionTrabajo_id);

    this.sweetService.sweet_confirmacion('Eliminar Asignación',
      `¿Desea eliminar la Estación de Trabajo ${estacion.nombre} del usuario ${usuario.nombre}?`).then(res => {
        if (res.isConfirmed) {
          this.usuarioService.eliminarEstacionTrabajo(asig.id).toPromise().then(res => {
            this.sweetService.sweet_notificacion('Estacion Eliminada')
            this.usuarios = this.usuarios.filter(el => el.id !== usuario.id);
          }).catch(e => {
            console.log(e);
          });
        }
      })
  }

  filtrarPagina() {
    if(this.usuariosOriginal.length<1){
      this.usuariosOriginal = this.usuarios.map(v=>v);
    }
    let parametro = this.datos.controls["filtroNombre"].value;
    parametro = parametro.toLowerCase().trim();
    let listaFiltrada: Usuario[] = [];
    if (parametro.length > 0) {
      for (let usuario of this.usuarios) {
        for (const propiedad in usuario) {
          if (typeof (usuario[propiedad]) == 'string') {
            if (listaFiltrada.filter(el => el.id == usuario.id).length < 1) {
              if (usuario[propiedad].toLowerCase().indexOf(parametro) !== -1) {
                listaFiltrada.push(usuario);
              }
            }
          }
        }
      }
      this.usuarios= listaFiltrada;
    } else {
      this.usuarios = this.usuariosOriginal.map(v=>v);
    }
  }

  regresar() {
    this.configService.regresar();
  }

}
