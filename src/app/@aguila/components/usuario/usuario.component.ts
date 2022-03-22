import { SweetService } from "./../../../@page/services/sweet.service";
import { UsuarioService } from "./../../data/services/usuario.service";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { ImagenRecursoConfiguracion } from '../../data/models/imagenRecursoConfiguracion';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { Usuario } from "../../data/models/usuario";
import { Rol } from "../../data/models/rol";
import { forkJoin } from "rxjs";
import { first, map } from "rxjs/operators";
import { Modulo } from "../../data/models/modulo";
import { Estaciontrabajo } from "../../data/models/estaciontrabajo";
import { Sucursal } from "../../data/models/sucursal";

@Component({
    selector: "app-usuario",
    templateUrl: "./usuario.component.html",
    // styleUrls: ["./usuario.component.css"],
})

export class UsuarioComponent extends BaseComponent implements OnInit {

    imgRecursoPerfil: ImagenRecursoConfiguracion = null;
    hide: boolean = true;
    roles: Rol[] = [];
    modulos: Modulo[] = [];
    estacionesDeTrabajo: Estaciontrabajo[] = [];
    sucursales: Sucursal[] = [];

    constructor(protected s: UsuarioService, protected sw: SweetService,
        protected ar: ActivatedRoute, protected formBuilder: FormBuilder) {
        super("Usuario", s, sw, ar);
    }

    ngOnInit(): void {
        this.iniciarComponent();
    }

    eventosHeader(evento: OpcionesHeaderComponent) {
        switch (evento.idEvento) {
            case 1:
                this.s.paginaAnterior();
                break;
            case 2:
                this.guardarRegistro();
                break;
            case 3:
                this.modificarRegistro();
                break;
        }
    }

    cargarComponent(): void {
        this.cargandoDatosDelComponente = true;
        this.header.opciones.push({ icono: "clear", nombre: "Regresar", disponible: true, idEvento: 1, toolTip: "Volver a la página anterior", color: 'warn' });
        if (this.validarParametro("id")) {
            this.header.opciones.push({ icono: 'save_alt', nombre: 'Guardar Cambios', disponible: this.opcionDisponible('Modificar'), idEvento: 3, toolTip: 'Guardar Registro', color: 'primary' })
        } else {
            this.header.opciones.push({ icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'), idEvento: 2, toolTip: 'Guardar Registro', color: 'primary' })
        }
        this.s.getImagenRecursoConfiguracion("ImagenPerfil").subscribe(res => {
            this.imgRecursoPerfil = res;
            this.configurarFormulario();
        }, (error) => {
            console.log(error);
            this.sw.sweet_notificacion("La pantalla presenta errores", 5000, 'error');
            this.configurarFormulario();
        });
    }

    configurarFormulario() {
        this.form = this.formBuilder.group({
            username: ["", [Validators.required]],
            nombre: ["", [Validators.required]],
            activo: [true],
            email: ["", [Validators.required]],
            fchCreacion: [new Date()],
            password: ["", [Validators.required]],
            fchPassword: [new Date()],
            fchNacimiento: [new Date(), [Validators.required]],
            fchBloqueado: [new Date()],
            cambiarClave: [false],
            moduloId: ["", [Validators.required]],
            estacionTrabajoId: ["", [Validators.required]],
            sucursalId: ["", [Validators.required]],
            estacionesTrabajoAsignadas: [''],
            roles: [[]],
            modulos: [[]],
            imagenPerfil: [],
        });

        this.cargarDatos();
    }

    cargarDatos() {
        this.cargandoDatosDelComponente = true;
        if (this.validarParametro("id")) {
            this.form.addControl("id", new FormControl());
            this.s.consultar<Usuario>(this.activatedRoute.snapshot.paramMap.get("id"))
                .subscribe(res => {
                    this.form.patchValue(res);
                    this.cargarDatosDeListas();
                }, (error) => {
                    console.log(error);
                    if (error.status == 404) {
                        this.sweetService.sweet_alerta("Error", "Registro no existe.", "error");
                        this.header.opciones[1].disponible = this.opcionDisponible("Agregar");
                        this.header.opciones[1].nombre = "Guardar";
                        this.header.opciones[1].idEvento = 2;
                        this.form.removeControl("id");
                        this.cargarDatosDeListas();
                        return;
                    }
                    this.sweetService.sweet_Error(error);
                    this.s.paginaAnterior();
                });
        } else {
            this.cargarDatosDeListas();
        }
    }

    cargarDatosDeListas() {
        forkJoin([
            this.s.getRoles().pipe(first()),
            this.s.getModulos().pipe(first()),
            this.s.getEstacionesDeTrabajo().pipe(first()),
            this.s.getSucursales().pipe(first()),
        ]).pipe(first()).subscribe(res => {
            this.roles = res[0].aguilaData;
            this.modulos = res[1].aguilaData;
            this.estacionesDeTrabajo = res[2].aguilaData;
            this.sucursales = res[3].aguilaData;
            this.marcarRolesAsignados();
            this.bloquearInputs();
            this.cargandoDatosDelComponente = false;
        })
    }

    bloquearInputs() {
        this.form.controls["fchBloqueado"].disable();
        this.form.controls["fchPassword"].disable();
        this.form.controls["activo"].disable();
        if (this.validarParametro("id")) {
            this.form.controls["password"].disable();
            this.form.controls["username"].disable();
        }
    }

    habilitarInputs() {
        if (this.validarParametro("id")) {
            this.form.controls["username"].enable();
        }
    }

    marcarRolesAsignados() {
        this.roles.forEach(rol => {
            if (this.form.controls["roles"].value) {
                if (this.form.controls["roles"].value.find(rolF => rolF.id == rol.id)) {
                    rol.select = true;
                }
            }
        })
    }

    guardarRegistro() {
        this.habilitarInputs();
        if (this.form.valid) {
            this.s.crear(this.form.value).subscribe(res => {
                this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
                this.form.reset();
            }, (error) => {
                if (error.status == 400) {
                    this.sweetService.sweet_alerta("Error", "Algunos datos son incorrectos", "error");
                    this.errores(error.error.aguilaErrores[0].validacionErrores);
                    return;
                }
                this.sweetService.sweet_Error(error);
            });
        } else {
            this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
            this.form.markAllAsTouched();
        }
    }

    modificarRegistro() {
        this.habilitarInputs();
        if (this.form.valid) {
            this.s.modificar(this.form.value).subscribe(res => {
                this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
                this.cargarDatos();
            }, (error) => {
                if (error.status == 400) {
                    this.sweetService.sweet_alerta("Error", "Algunos datos son incorrectos", "error");
                    this.errores(error.error.aguilaErrores[0].validacionErrores);
                    return;
                }
                this.sweetService.sweet_Error(error);
            });
        } else {
            this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
            this.form.markAllAsTouched();
        }
    }

    marcar(rol: Rol) {
        if (rol.select) {
            rol.select = false;
            this.form.controls['roles'].setValue(this.form.controls['roles'].value.filter((r) => r.id !== rol.id));
        } else {
            rol.select = true;
            this.form.controls['roles'].value.push(rol);
        }
    }
}
