import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogosRoutingModule } from './catalogos-routing.module';
import { PageModule } from '../@page/page.module';
import { MaterialModule } from "../@page/material.module";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ComponentesCatalogos } from './components-catalogos';
import { NgxKjuaModule } from 'ngx-kjua';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

@NgModule({
  declarations: [ComponentesCatalogos],
  imports: [
    CommonModule,
    PageModule,
    CatalogosRoutingModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxQRCodeModule,
    NgxKjuaModule,
  ],
  //exports: [InputVehiculoComponent]
})

export class CatalogosModule { }
