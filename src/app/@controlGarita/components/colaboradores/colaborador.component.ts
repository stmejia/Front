import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BarcodeFormat } from '@zxing/library';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Empleado } from 'src/app/@catalogos/data/models/empleado';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { SweetAlertOptions } from 'sweetalert2';
import { EmpleadosIngresosService } from '../../data/services/empleados-ingresos.service';

@Component({
  selector: 'app-colaborador',
  templateUrl: './colaborador.component.html',
  styleUrls: ['./colaborador.component.scss']
})
export class ColaboradorComponent implements OnInit {

  form: FormGroup;
  cargando: boolean = true;

  codErrores = {
    idEmpleado: "*Campo Requerido",
    cui: "*Campo Requerido",
    vehiculo: "*Campo Requerido",
  }

  empleado: Empleado = null;

  //----- ----- Modo Automatico
  modo: boolean = false;
  allowedFormats = [BarcodeFormat.QR_CODE];
  availableDevices: MediaDeviceInfo[];
  hasDevices: boolean;
  currentDevice: MediaDeviceInfo = null;
  torchEnabled = false;
  hasPermission = new BehaviorSubject<boolean>(true);
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  reintentar: boolean = false;
  //----- ----- Fin modo automatico

  //Input Empleado
  filtrosAplicarEmpleados: QueryFilter[] = [];
  filtrosEmpleados: FiltrosC[] = [];
  columnasEmpleado: ColumnaTabla[] = [
    { titulo: 'CUI', target: ['codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Nombres', target: ['nombres'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Apellidos', target: ['apellidos'], tipo: 'texto', aligment: 'left', visible: true },
  ];

  constructor(private service: EmpleadosIngresosService, private sweetService: SweetService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    forkJoin([
      this.service.getCargando().pipe(first(v => v === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    }, (error) => {
      this.service.paginaAnterior();
      console.log(error);
      this.sweetService.sweet_Error(error);
    });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.service.paginaAnterior();
        break;
      case 2:
        this.guardarRegistro();
        break;
    }
  }

  cargarComponent() {
    let opt: any[] = [
      { icono: 'clear', nombre: 'Regresar', disponible: true, idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn' },
      { icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'), idEvento: 2, toolTip: 'Guardar Registro', color: 'primary' }
    ];
    this.service.setConfiguracionComponent({
      header: {
        titulo: "Ingreso / Salida De Colaboradores",
        opciones: opt
      },
      isModal: false,
    });

    //Empleados
    this.filtrosAplicarEmpleados.push({ filtro: "idEmpresa", parametro: this.service.getEmpresa().id });
    this.filtrosAplicarEmpleados.push({ filtro: "estado", parametro: "1" });
    this.filtrosEmpleados.push({
      activo: true,
      nombre: "Nombre",
      requerido: false,
      tipo: "input",
      filters: [{ filtro: "nombres", parametro: "" }],
      valores: [],
      tipoInput: "string"
    });

    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      idEmpleado: ["", [Validators.required]],
      cui: ["", [Validators.required]],
      vehiculo: [""],
      evento: ["", [Validators.required]],
      idEstacionTrabajo: [this.service.getEstacionTrabajo().id],
      validar: [true]
    });
    this.cargando = false;
  }

  getEmpleado(empleado: Empleado) {
    this.empleado = empleado;
    this.form.controls["idEmpleado"].setValue(empleado ? empleado.id : null);
    this.form.controls["cui"].setValue(empleado ? empleado.codigo : null);
    this.form.controls["vehiculo"].setValue(empleado ? (empleado.placas || "") : "");
  }

  validarPermiso() {
    if (this.service.validarPermiso('Agregar')) {
      this.cargarComponent();
    } else {
      this.service.errorPermiso("Agregar");
      this.service.paginaAnterior();
    }
  }

  opcionDisponible(opcion: string): boolean {
    return this.service.validarPermiso(opcion);
  }

  guardarRegistro() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return this.sweetService.sweet_alerta("Error", "Complete los datos.", "error");
    }

    this.service.guardar(this.form.value).subscribe(res => {
      this.reiniciarFormulario();
      this.sweetService.sweet_notificacion("Registro Guardado", 5000, "success");
    }, (error) => {
      console.log(error);
      if (error.status == 400) {
        this.form.markAllAsTouched();
        console.log("Paso Condicion If");
        
        try {
          return this.sweetService.sweet_confirmacion("Error", error.error.aguilaErrores[0].detalle + "¿Desea Continuar?", 'warning').then(res => {
            if (res.isConfirmed) {
              this.form.controls['validar'].setValue(false);
              this.guardarRegistro();
            }
          });
        } catch (catchError) {
          console.log(catchError);
          this.sweetService.sweet_Error(error);
        }
      }
      this.sweetService.sweet_Error(error);
    });
  }

  reiniciarFormulario() {
    this.form.setValue({
      idEmpleado: null,
      cui: null,
      vehiculo: "",
      evento: this.form.controls["evento"].value,
      idEstacionTrabajo: this.service.getEstacionTrabajo().id,
      validar: true
    });
    this.empleado = null;
    this.reintentar = false;
  }

  get configuracionComponent() {
    return this.service.getConfiguracionComponent();
  }

  //Modo Automatico
  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onDeviceSelectChange(selected: string) {
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.currentDevice = device || null;
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  onHasPermission(has: boolean) {
    this.hasPermission.next(has);
  }

  codigoEscaneado(evento: any) {
    try {
      let dato = JSON.parse(evento);
      if (dato['td']) {
        if (dato['td'] == "empleados") {
          this.buscarEmpleado(dato.codigo || "");
        } else {
          this.reintentar = true;
          return this.sweetService.sweet_notificacion("QR No Valido (1)", 5000, 'error');
        }
      } else {
        this.reintentar = true;
        return this.sweetService.sweet_notificacion("QR No Valido (2)", 5000, 'error');
      }
    } catch (error) {
      this.reintentar = true;
      return this.sweetService.sweet_notificacion("QR No Valido (3)", 5000, 'error');
    }
  }

  buscarEmpleado(cui: string) {
    this.reintentar = true;

    this.service.buscarEmpleado(cui).subscribe(res => {
      if (res) {
        this.empleado = res;
        let pathLogo = "./assets/img/LogoApp.png";
        let imagen = res.fotos ? (res.fotos.imagenDefault ? (res.fotos.imagenDefault.urlImagen ? res.fotos.imagenDefault.urlImagen : pathLogo) : pathLogo) : pathLogo;

        let opt: SweetAlertOptions = {
          title: `${this.form.controls['evento'].value} De Colaborador`,
          imageUrl: imagen,
          text: `${res.nombres} ${res.apellidos}`,
          showConfirmButton: true,
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          confirmButtonText: "Continuar"
        }
        this.sweetService.sweet_custom(opt).then(res => {
          if (res.isConfirmed) {
            this.form.controls["idEmpleado"].setValue(this.empleado.id);
            this.form.controls["cui"].setValue(this.empleado.codigo);
            this.form.controls["vehiculo"].setValue(this.empleado.placas);
            this.guardarRegistro();
            //this.service.marcarSalida(visita.identificacion);
          } else {
            this.reintentar = false;
          }
        });
      } else {
        this.sweetService.sweet_alerta("Error", "Empleado no registrado");
        this.reintentar = true;
      }
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_Error(error);
      this.reintentar = true;
    })
  }
}
