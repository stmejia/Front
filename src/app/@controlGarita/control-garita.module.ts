import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsControlGarita } from './control-garita-components';
import { PageModule } from '../@page/page.module';
import { ControlGaritaRoutingModule } from './control-garita-routing.module';
import { MaterialModule } from '../@page/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxKjuaModule } from 'ngx-kjua';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
@NgModule({
  declarations: [ComponentsControlGarita],
  imports: [
    CommonModule,
    PageModule,
    ControlGaritaRoutingModule,
    MaterialModule,
    ZXingScannerModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxKjuaModule
  ]
})
export class ControlGaritaModule { }
