import { Direccion } from './../../data/models/direccion';
import { DireccionService } from './../../data/services/direccion.service';
import { Component, Input, OnInit, Output, EventEmitter, SimpleChange } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Columna } from 'src/app/@page/models/columna';
import { first } from 'rxjs/operators';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { Pais } from '../../data/models/pais';
import { Departamento } from '../../data/models/departamento';
import { CodigoPostal, Municipio } from '../../data/models/municipio';

@Component({
  selector: 'app-direccion',
  templateUrl: './direccion.component.html',
  styleUrls: ['./direccion.component.css']
})

export class DireccionComponent implements OnInit {

  @Input() direccion: Direccion;
  @Output() getDireccion = new EventEmitter();
  @Output() cancelEvent = new EventEmitter();

  listaPaises = new BehaviorSubject<Pais[]>([]);
  listaDepartamentos = new BehaviorSubject<Departamento[]>([]);
  listaMunicipios = new BehaviorSubject<Municipio[]>([]);
  codigoPostal: CodigoPostal;

  cargandoDatos: boolean = true;
  form: FormGroup;

  codErrores = {
    idMunicipio: "*Campo Requerido",
    calle: "*Campo Requerido",
    colonia: "*Campo Requerido",
    zona: "*Campo Requerido",
    codigoPostal: "*Campo Requerido",
    direccion: "*Campo Requerido",
  };

  colPaises: Columna[] = [
    { nombre: "Cód de Moneda", aligment: "center", targetId: "codMoneda", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ]

  colDepartamentos: Columna[] = [
    { nombre: "Código", aligment: "center", targetId: "codigo", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ]

  colMunicipios: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codMunicipio", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombreMunicipio", texto: true }
  ]

  constructor(private serviceComponent: DireccionService, private sweetService: SweetService,
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(
      first(value => value === false)
    ).subscribe(res => {
      this.cargarComponent();
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_alerta("Error", "No es posible cargar el componente", "error");
    });
  }

  cargarComponent() {
    this.serviceComponent.getListaPaises().subscribe(res => {
      this.listaPaises.next(res);
      this.configurarFormulario();
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_alerta("Error", "La pantalla presenta errores", "error");
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      id: [0],
      idMunicipio: ["", [Validators.required]],
      idDepartamento: ["", [Validators.required]],
      idPais: ["", [Validators.required]],
      colonia: ["", Validators.required],
      zona: ["", [Validators.required]],
      codigoPostal: ["", [Validators.required]],
      direccion: ["", [Validators.required]],
      fechaCreacion: [new Date()]
    });

    this.form.controls["idPais"].valueChanges.subscribe(res => {
      this.serviceComponent.getListaDepartamentos(res).subscribe(dep => {
        this.listaDepartamentos.next(dep);
      });
    });

    this.form.controls["idDepartamento"].valueChanges.subscribe(res => {
      this.serviceComponent.getListaMunicipios(res).subscribe(mun => {
        this.listaMunicipios.next(mun);
      });
    });

    this.form.controls["idMunicipio"].valueChanges.subscribe(res => {
      this.serviceComponent.getCodigoPostal(res).subscribe(cod => {
        this.codigoPostal = cod;
      });
    });

    this.form.valueChanges.subscribe(res => {
      if (this.form.valid) {
        this.getDireccion.emit(this.form.value);
      } else {
        this.getDireccion.emit(null);
      }
    });

    if (this.direccion) {
      this.cargarRegistro(this.direccion);
    } else {
      this.cargandoDatos = false;
    }
  }

  cargarRegistro(direccion: Direccion) {
    if (direccion) {
      forkJoin([
        this.serviceComponent.getListaDepartamentos(direccion.municipio.departamento.idPais),
        this.serviceComponent.getListaMunicipios(direccion.municipio.idDepartamento),
        this.serviceComponent.getCodigoPostal(direccion.idMunicipio)
      ]).pipe(first()).subscribe(res => {
        this.listaDepartamentos.next(res[0]);
        this.listaMunicipios.next(res[1]);
        this.codigoPostal = res[2];
        this.form.patchValue(direccion);
        this.form.controls["idPais"].setValue(direccion.municipio.departamento.idPais);
        this.form.controls["idDepartamento"].setValue(direccion.municipio.idDepartamento);
        this.cargandoDatos = false;
      }, (error) => {
        console.log(error);
        this.sweetService.sweet_alerta("Error", "Error al cargar información", "error");
      });
    }
  }

  getDireccionCompleta(): string {
    if (this.form.controls['idPais'].valid && this.form.controls['idDepartamento'].valid && this.form.controls['idMunicipio'].valid) {
      return `${this.form.controls['direccion'].value}, ${this.form.controls['colonia'].value}, zona ${this.form.controls['zona'].value}, 
         ${this.listaMunicipios.value.find(m => m.id == this.form.controls['idMunicipio'].value).nombreMunicipio}, 
         ${this.listaDepartamentos.value.find(d => d.id == this.form.controls['idDepartamento'].value).nombre}, 
         ${this.listaPaises.value.find(p => p.id == this.form.controls['idPais'].value).nombre}`;
    }
    return "";
  }
}
