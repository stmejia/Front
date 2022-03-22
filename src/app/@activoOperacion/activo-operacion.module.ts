import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageModule } from '../@page/page.module';
import { ActivoOperacionRoutingModule } from './activo-operacion-routing.module';
import { MaterialModule } from '../@page/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxKjuaModule } from 'ngx-kjua';
import { ComponentsActivoOperacion } from './activo-operacion-components';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  declarations: [ComponentsActivoOperacion],
  imports: [
    CommonModule,
    PageModule,
    ActivoOperacionRoutingModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxKjuaModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    // Components De Otros Modulos
  ]
})
export class ActivoOperacionModule { }
