import { Component, OnInit } from "@angular/core";
import { Usuario } from "../../data/models/usuario";
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { ActivatedRoute } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { UsuariosPermisosService } from '../../data/services/usuarios-permisos.service';
import { Modulo } from "../../data/models/modulo";
import { HttpHeaders } from "@angular/common/http";
import { AsigEstacion } from "../../data/models/asigEstacion";
import { Estaciontrabajo } from "../../data/models/estaciontrabajo";
import { AsigModulo } from "../../data/models/asigModulo";
import { AtributoAsig, RecursoAsignado } from "../../data/models/asigAtributo";
import { Recurso } from "../../data/models/recurso";

@Component({
    selector: "app-permisos",
    templateUrl: "./permisos.component.html",
    styleUrls: ["./permisos.component.css"]
})

export class PermisosComponent extends BaseComponent implements OnInit {

    usuario: Usuario = null;
    listaModulosParaAsignar = new BehaviorSubject<Modulo[]>([]);
    listaModulosAsignados = new BehaviorSubject<AsigModulo[]>([]);

    listaEstacionesParaAsignar = new BehaviorSubject<Estaciontrabajo[]>([]);
    listaEstacionesAsignados = new BehaviorSubject<AsigEstacion[]>([]);

    listaRecursosAsignados = new BehaviorSubject<AtributoAsig[]>([])
    listaRecursosParaAsignar = new BehaviorSubject<Recurso[]>([]);

    constructor(protected s: UsuariosPermisosService, protected sw: SweetService,
        protected ar: ActivatedRoute) {
        super("Asignación De Permisos", s, sw, ar);
    }

    ngOnInit(): void {
        this.iniciarComponent();
    }

    eventosHeader(evento: OpcionesHeaderComponent) {
        switch (evento.idEvento) {
            case 1:
                this.s.paginaAnterior();
                break;
        }
    }

    cargarComponent(): void {
        this.cargandoDatosDelComponente = true;
        this.header.opciones.push({ icono: "clear", nombre: "Regresar", disponible: true, idEvento: 1, toolTip: "Volver a la página anterior", color: 'warn' });
        this.s.consultar<Usuario>(this.activatedRoute.snapshot.paramMap.get("id")).subscribe(res => {
            this.usuario = res;
            this.cargarDatos();
        }, (error) => {
            console.log(error);
            this.sweetService.sweet_Error(error);
        });
    }

    cargarDatos() {
        this.cargandoDatosDelComponente = true;

        forkJoin([
            this.s.getModulos(),
            this.s.getModulosAsignados(this.usuario.id),
            this.s.getEstacionesDeTrabajo(),
            this.s.getEstacionesDeTrabajoAsignadas(this.usuario.id),
            this.s.getRecusosAsignados(this.usuario.id),
            this.s.getRecursos(),
        ]).pipe(first()).subscribe(res => {
            console.log(res);

            let modulosParaAsignar: Modulo[] = [];
            let estacionesParaAsignar: Estaciontrabajo[] = [];

            this.listaEstacionesAsignados.next(res[3].aguilaData);
            this.listaModulosAsignados.next(res[1].aguilaData);
            this.listaRecursosAsignados.next(res[4].aguilaData);
            this.listaRecursosParaAsignar.next(res[5].aguilaData);


            res[0].aguilaData.forEach(modulo => {
                let agregar = true;
                res[1].aguilaData.forEach(moduloAsignado => {
                    if (modulo.id == moduloAsignado.moduloId) {
                        agregar = false
                    }
                });
                if (agregar) modulosParaAsignar.push(modulo);
            });

            res[2].aguilaData.forEach(estacion => {
                let agregar = true;
                res[3].aguilaData.forEach(estacionAsignada => {
                    if (estacionAsignada.estacionTrabajoId == estacion.id) {
                        agregar = false
                    }
                });
                if (agregar) estacionesParaAsignar.push(estacion);
            });

            this.listaModulosParaAsignar.next(modulosParaAsignar);
            this.listaEstacionesParaAsignar.next(estacionesParaAsignar);

            this.cargandoDatosDelComponente = false;
        });
    }

    // Modulos ----- -----
    asignarModulo(modulo: Modulo) {
        this.sweetService.sweet_confirmacion("Asignar Modulo", `¿Desea asignar el modulo ${modulo.nombre}?`).then(res => {
            if (res.isConfirmed) {
                this.sweetService.sweet_carga("Asignando Modulo");
                this.s.asignarModulo({ usuarioId: this.usuario.id, moduloId: modulo.id }).subscribe(res => {
                    this.sweetService.sweet_notificacion("Listo", 5000);
                    this.cargarDatos();
                }, (error) => {
                    console.log(error);
                    this.sweetService.sweet_Error(error);
                });
            }
        });
    }

    desasignarModulo(modulo: Modulo) {
        this.sweetService.sweet_confirmacion("Desasignar Modulo", `¿Desea desasignar el modulo ${modulo.nombre}?`, 'warning').then(res => {
            if (res.isConfirmed) {
                this.sweetService.sweet_carga("Desasignando Modulo");
                let options = {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json'
                    }),
                    body: {
                        'usuarioId': this.usuario.id,
                        'moduloId': modulo.id
                    }
                }
                this.s.desasignarModulo(options).subscribe(res => {
                    this.sweetService.sweet_notificacion("Listo", 5000);
                    this.cargarDatos();
                }, (error) => {
                    console.log(error);
                    this.sweetService.sweet_Error(error);
                });
            }
        });
    }

    establecerModuloPorDefecto(modulo: Modulo) {
        this.sweetService.sweet_confirmacion("Establecer Modulo Por Defecto", `¿Desea establecer el modulo ${modulo.nombre} por defecto?`)
            .then(res => {
                if (res.isConfirmed) {
                    this.usuario.moduloId = modulo.id;
                    this.s.modificar(this.usuario).subscribe(res => {
                        this.sweetService.sweet_notificacion("Listo", 5000);
                        this.header.opciones = [];
                        this.cargarComponent();
                    }, (error) => {
                        console.log(error);
                        this.sweetService.sweet_Error(error);
                    });
                }
            });
    }

    // Estación De Trabajo
    asignarEstacionDeTrabajo(estacion: Estaciontrabajo) {
        this.sweetService.sweet_confirmacion("Asignar Estación", `¿Desea asignar la Estación De Trabajo ${estacion.nombre}?`).then(res => {
            if (res.isConfirmed) {
                this.sweetService.sweet_carga("Asignando Estación De Trabajo");
                this.s.asignarEstacionDeTrabajo({ usuarioId: this.usuario.id, estacionTrabajoId: estacion.id }).subscribe(res => {
                    this.sweetService.sweet_notificacion("Listo", 5000);
                    this.cargarDatos();
                }, (error) => {
                    console.log(error);
                    this.sweetService.sweet_Error(error);
                });
            }
        });
    }

    desasignarEstacionDeTrabajo(estacion: AsigEstacion) {
        this.sweetService.sweet_confirmacion("Desasignar Estación", `¿Desea desasignar la Estación De Trabajo ${estacion.estacionTrabajo.nombre}?`).then(res => {
            if (res.isConfirmed) {
                this.sweetService.sweet_carga("Desasignando Estación De Trabajo");
                this.s.desasignarEstacionDeTrabajo(estacion.id).subscribe(res => {
                    this.sweetService.sweet_notificacion("Listo", 5000);
                    this.cargarDatos();
                }, (error) => {
                    console.log(error);
                    this.sweetService.sweet_Error(error);
                })
            }
        })
    }

    establecerEstacionDeTrabajoPorDefecto(estacion: Estaciontrabajo) {
        this.sweetService.sweet_confirmacion("Establecer Esstación De Trabajo Por Defecto", `¿Desea establecer la estación de trabajo ${estacion.nombre} por defecto?`)
            .then(res => {
                if (res.isConfirmed) {
                    this.usuario.estacionTrabajoId = estacion.id;
                    this.s.modificar(this.usuario).subscribe(res => {
                        this.sweetService.sweet_notificacion("Listo", 5000);
                        this.header.opciones = [];
                        this.cargarComponent();
                    }, (error) => {
                        console.log(error);
                        this.sweetService.sweet_Error(error);
                    });
                }
            });
    }

    //Recursos
    isAsignado(opcion: string, recurso: AtributoAsig) {
        if (recurso.opcionesAsignadas.find(o => o.toLowerCase() == opcion.toLowerCase())) {
            return true;
        } else {
            return false;
        }
    }

    actualizarPermiso(opcion: string, recurso: AtributoAsig) {
        let usuarioRecurso: RecursoAsignado = {
            id: recurso.id,
            estacionTrabajo_id: recurso.estacionTrabajo_id,
            recurso_id: recurso.recurso_id,
            usuario_id: recurso.usuario_id,
            opcionesAsignadas: []
        }

        if (recurso.opcionesAsignadas.find(o => o.toLowerCase() == opcion.toLowerCase())) {
            if (opcion.toLowerCase() != "consultar") {
                usuarioRecurso.opcionesAsignadas = recurso.opcionesAsignadas.filter(o => o.toLowerCase() != opcion.toLowerCase());
            }
        } else {
            usuarioRecurso.opcionesAsignadas = recurso.opcionesAsignadas.concat([opcion]);
        }

        this.sweetService.sweet_carga("Asignando Permiso");

        if (usuarioRecurso.opcionesAsignadas.length > 0) {
            this.s.actualizarPermiso(usuarioRecurso).subscribe(res => {
                recurso.opcionesAsignadas = usuarioRecurso.opcionesAsignadas.map(o => o);
                this.sweetService.sweet_notificacion("Permiso Actualizado");
            }, (error) => {
                console.log(error);
                this.sweetService.sweet_Error(error)
            });
        } else {
            this.s.eliminarRecursoAsignado(recurso.id).subscribe(res => {
                this.listaRecursosAsignados.next(this.listaRecursosAsignados.value.filter(r => r.id != recurso.id));
                this.sweetService.sweet_notificacion("Permiso Actualizado");
            }, (error) => {
                console.log(error);
                this.sweetService.sweet_Error(error)
            });
        }
    }

    asignarPermiso(opcion: string, recurso: Recurso, idEstacion) {
        let usuarioRecurso: RecursoAsignado = {
            estacionTrabajo_id: idEstacion,
            recurso_id: recurso.id,
            usuario_id: this.usuario.id,
            opcionesAsignadas: []
        }

        if (opcion.toLowerCase() != "consultar") {
            usuarioRecurso.opcionesAsignadas = ["Consultar"];
        }

        usuarioRecurso.opcionesAsignadas.push(opcion);
        this.sweetService.sweet_carga("Asignando Permiso");

        this.s.asignarPermiso(usuarioRecurso).subscribe(res => {
            this.listaRecursosAsignados.value.push(res.aguilaData);
            this.sweetService.sweet_notificacion("Permiso Actualizado");
        }, (error) => {
            console.log(error);
            this.sweetService.sweet_Error(error)
        });
    }

    mostrarRecurso(recurso: Recurso) {
        if (this.listaRecursosAsignados.value.find(ra => ra.recurso_id == recurso.id)) {
            return false;
        } else {
            return true;
        }
    }

}
