import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Cliente } from '../../data/models/cliente';
import { ClienteTarifa } from '../../data/models/clienteTarifa';
import { DataClienteTarifa } from '../../data/models/dataClienteTarifa';
import { Tarifa } from '../../data/models/tarifa';
import { ClienteTarifaService } from '../../data/services/cliente-tarifa.service';

@Component({
  selector: 'app-cliente-tarifa',
  templateUrl: './cliente-tarifa.component.html',
  styleUrls: ['./cliente-tarifa.component.css']
})
export class ClienteTarifaComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;

  codErrores = {
    precio: "",
    vigenciaHasta: "",
  };

  constructor(private serviceComponent: ClienteTarifaService, private sweetService: SweetService,
    @Inject(MAT_DIALOG_DATA) public data: DataClienteTarifa, private formBuilder: FormBuilder,) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().subscribe(res => {
      if (this.data) {
        this.cargarFormulario();
      } else {
        //Cerrar Modal
        this.sweetService.sweet_alerta("Error", "Sin datos para crear registro", "error");
      }
    });
  }

  guardar() {
    if (this.form.valid) {
      this.serviceComponent.crear(this.form.value).subscribe(() => {
        this.sweetService.sweet_notificacion("Registro Guardado");
        this.serviceComponent.paginaAnterior();
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos", "error");
      this.form.markAllAsTouched();
    }
  }

  cargarFormulario() {
    this.form = this.formBuilder.group({
      //id: [""],
      idCliente: [""],
      idTarifa: [""],
      precio: ["", [Validators.required]],
      //activa: [""],
      vigenciaHasta: ["", [Validators.required]],
      fechaCreacion: [new Date()]
    });

    this.cargarComponent();
  }

  cargarComponent() {
    switch (this.data.tipo) {
      case "tarifa":
        this.form.controls["idTarifa"].setValue(this.data.objeto.id);
        break;

      case "cliente":
        console.log(this.data.objeto);
        
        this.form.controls["idCliente"].setValue(this.data.objeto.id);
        break;
    }

    this.cargandoDatos = false;
  }

  selectCliente(cliente: Cliente) {
    this.form.controls["idCliente"].setValue(cliente.id);
    let f: QueryFilter[] = [];
    f.push({ filtro: "idTarifa", parametro: this.form.controls["idTarifa"].value });
    f.push({ filtro: "idCliente", parametro: this.form.controls["idCliente"].value });
    f.push({ filtro: "activa", parametro: true });
    this.buscarRegistro(f);
  }

  selectTarifa(tarifa: Tarifa) {
    this.form.controls["idTarifa"].setValue(tarifa.id);
    let f: QueryFilter[] = [];
    f.push({ filtro: "idTarifa", parametro: this.form.controls["idTarifa"].value });
    f.push({ filtro: "idCliente", parametro: this.form.controls["idCliente"].value });
    f.push({ filtro: "activa", parametro: true });
    this.buscarRegistro(f);
  }

  buscarRegistro(filtro: QueryFilter[]) {
    this.serviceComponent.getDatosFiltro(filtro).subscribe((res: ClienteTarifa[]) => {
      if (res.length > 0) {
        this.sweetService.sweet_alerta("Tarifa Vigente", "El cliente posee un precio especial en esta tarifa, si continua se cancelará la tarifa vigente y se registrará la nueva tarifa especial", "warning");
      } else {
        this.sweetService.sweet_notificacion("Listo");
      }
    });
  }
}