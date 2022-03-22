import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Llanta } from 'src/app/@catalogos/data/models/llanta';
import { Columna } from 'src/app/@page/models/columna';
import { EventoMenuOpciones, MenuOpciones } from 'src/app/@page/models/menu';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { SweetAlertOptions } from 'sweetalert2';
import { CondicionLlanta } from '../../data/models/condicionLlanta';
import { EventosControlEquipo } from '../../data/models/eventosControlEquipo';
import { ControlEventosEquiposService } from '../../data/services/control-eventos-equipos.service';

@Component({
  selector: 'app-condicion-llanta',
  templateUrl: './condicion-llanta.component.html',
  styleUrls: ['./condicion-llanta.component.css']
})
export class CondicionLlantaComponent implements OnInit {

  @Input() prefijo: "CH20" | "CH40" | "CH24" | "CA01" | "FUSE" | "FURE";
  @Input() titulo: string = "Condición De Llanta";
  @Input() maxLlanta: number = 0;
  @Input() llantas: CondicionLlanta[] = [];
  @Output() condicionesLlantas = new EventEmitter();

  form: FormGroup;
  visual: boolean = false;
  listaLlantas = new BehaviorSubject<CondicionLlanta[]>([]);
  llanta: Llanta = null;
  cargando: boolean = true;

  listaEstados: any[] = [
    { nombre: "Bueno", valor: "B" },
    { nombre: "Banda Dañada", valor: "BD" },
    { nombre: "Banda Levantada", valor: "BL" },
    { nombre: "Casco Rajado", valor: "CR" },
    { nombre: "Casco Dañado", valor: "CD" },
    { nombre: "Banda Ovalada", valor: "BO" },
  ];

  columnasCondicionesLlantas: Columna[] = [
    { nombre: 'settings', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: "No.", targetId: "id", tipo: "texto", aligment: "center" },
    { nombre: "Código", targetId: "codigo", tipo: "texto", aligment: "left" },
    { nombre: "Marca", targetId: "marca", tipo: "texto", aligment: "left" },
    { nombre: "P. Izq.", targetId: "profundidadIzq", tipo: "texto", aligment: "center" },
    { nombre: "P. Cto.", targetId: "profundidadCto", tipo: "texto", aligment: "center" },
    { nombre: "P. Der.", targetId: "profundidadDer", tipo: "texto", aligment: "center" },
    { nombre: "PSI", targetId: "psi", tipo: "texto", aligment: "center" },
    { nombre: "Estado", targetId: "estado", tipo: "texto", aligment: "left" },
    { nombre: "Observaciones", targetId: "observaciones", tipo: "texto", aligment: "left" },
  ]

  optTablaCondicionLlanta: MenuOpciones[] = [
    { icono: 'create', nombre: 'Modificar', disponible: true, idEvento: 1 },
  ]

  constructor(private formBuilder: FormBuilder, private sweetService: SweetService,
    private controlEventosService: ControlEventosEquiposService) { }

  ngOnInit(): void {
    forkJoin([
      this.controlEventosService.getCargando().pipe(first(val => val === false)),
    ]).subscribe(res => {
      this.cargarComponent();
    });

  }

  ngOnChanges(cambios: SimpleChanges) {
    if (cambios.prefijo) {
      if (!cambios.prefijo.firstChange) {
        this.validarPrefijo();
      }
    }

    if (cambios.maxLlanta) {
      if (!cambios.maxLlanta.firstChange) {
        if (!this.visual && this.maxLlanta > this.listaLlantas.value.length) {
          this.form.controls["id"].setValue(this.listaLlantas.value.length + 1);
        } else {
          this.limpiarFormulario();
        }
      }
    }

    if (cambios.llantas) {
      if (!cambios.llantas.firstChange) {
        this.listaLlantas.next(cambios.llantas.currentValue);
        this.condicionesLlantas.emit(this.listaLlantas.value);
        this.form.controls["id"].setValue(this.listaLlantas.value.length + 1);
      }
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.form.patchValue(event.objeto);
        break;
    }
  }

  validarPrefijo() {
    if (this.prefijo.startsWith("CH") || this.prefijo.startsWith("CA01") || this.prefijo.startsWith("FU")) {
      this.visual = true;
      this.form.controls["id"].setValue(0);
    } else {
      this.visual = false;
      if (this.maxLlanta > 0) {
        this.form.controls["id"].setValue(this.listaLlantas.value.length + 1);
      }
    }
    this.cargando = false;
  }

  cargarComponent() {
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      id: [""],
      codigo: ["", [Validators.required]],
      marca: ["", [Validators.required]],
      profundidadIzq: ["", [Validators.required]],
      profundidadCto: ["", [Validators.required]],
      profundidadDer: ["", [Validators.required]],
      psi: ["", [Validators.required]],
      estado: ["", [Validators.required]],
      observaciones: [""]
    });
    this.cargarDatos();
  }

  limpiarFormulario() {
    this.form.reset();
  }

  cargarDatos() {
    if (this.prefijo) {
      this.validarPrefijo();
    } else {
      if (this.maxLlanta > 0) {
        this.form.controls["id"].setValue(this.listaLlantas.value.length + 1);
      }
      this.cargando = false;
    }
  }

  crearEvento() {
    let equipo = this.llanta;
    let opt: SweetAlertOptions = {
      title: "Crear Evento",
      heightAuto: false,
      icon: 'warning',
      showCancelButton: true,
      //input: "textarea",
      confirmButtonText: "Crear Evento",
      html: `
      <p class="text-left p-0 m-0"><b>Código De Equipo: </b>${equipo.codigo}</p>
      <p class="text-left p-0 m-0 pt-10"><b>Titulo De Evento:</b> </p>
      <input id="swal-input1" class="swal2-input p-0 m-0">
      <p class="text-left p-0 m-0 pt-10"><b>Observaciones:</b> </p>
      <textarea id="swal-input2" class="swal2-input p-0 m-0"></textarea>
      `,
      preConfirm: () => {
        return [
          (<HTMLInputElement>document.getElementById('swal-input1')).value,
          (<HTMLTextAreaElement>document.getElementById('swal-input2')).value
        ]
      }
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        console.log(r.value);
        if (r.value[0].trim().length < 5) {
          this.sweetService.sweet_alerta('Error', 'Debe proporcionar un Titulo Valido para el Evento.', 'error');
          return;
        }
        if (r.value[1].trim().length < 5) {
          this.sweetService.sweet_alerta('Error', 'Debe proporcionar una Observación Valida para el Evento.', 'error');
          return;
        }

        let eventoRevisa: EventosControlEquipo = {
          idActivo: equipo.id,
          idEstacionTrabajo: this.controlEventosService.getEstacionTrabajo().id,
          descripcionEvento: r.value[0],
          bitacoraObservaciones: r.value[1],
          idUsuarioRevisa: this.controlEventosService.getUsuario().id,
        }
        this.controlEventosService.crear(eventoRevisa).subscribe(res => {
          this.sweetService.sweet_notificacion('Registro Guardado', 5000, 'info');
        });
      }
    });
  }

  getLlanta(llanta: Llanta) {
    if (llanta) {
      this.form.controls["codigo"].setValue(llanta.codigo);
      this.form.controls["marca"].setValue(llanta.marca);
      this.llanta = llanta;
    }else{
      this.llanta = null;
    }
  }

  getNoLlanta(no) {
    let indexLlanta = this.listaLlantas.value.findIndex(item => item.id == no);
    if (indexLlanta >= 0) {
      this.form.patchValue(this.listaLlantas.value[indexLlanta]);
    } else {
      this.limpiarFormulario();
      this.form.controls["id"].setValue(no);
    }
  }

  enviarObjeto() {
    if (this.form.valid) {
      let indexLlanta = this.listaLlantas.value.findIndex(item => item.id == this.form.controls["id"].value);

      if (indexLlanta >= 0) {
        this.listaLlantas.value[indexLlanta] = this.form.value;
        this.sweetService.sweet_notificacion("Condición actualizada");
        //Limpiar Formulario
      } else {
        if (this.listaLlantas.value.filter(i => i.codigo == this.form.controls["codigo"].value).length > 0) {
          this.sweetService.sweet_alerta("Error", "La llanta ya se encuentra registra da en el equipo", "error");
          this.form.controls["codigo"].setValue("");
          return;
        }
        this.listaLlantas.value.push(this.form.value);
        this.sweetService.sweet_notificacion("Condición registrada");
      }
      this.limpiarFormulario();
      this.condicionesLlantas.emit(this.listaLlantas.value.sort((a, b) => { return a.id - b.id }));
      if (!this.visual && this.maxLlanta > this.listaLlantas.value.length) {
        this.form.controls["id"].setValue(this.listaLlantas.value.length + 1);
      }
    } else {
      this.sweetService.sweet_alerta("Error De Formulario", "Complete los campos requeridos", "error");
      this.form.markAllAsTouched();
    }
  }

  getListaLlantas() {
    return this.listaLlantas.asObservable()
  }
}
