import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsRRHHModule } from './rrhh-components';
import { PageModule } from '../@page/page.module';
import { MaterialModule } from '../@page/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RRHHRoutingModule } from './rrhh-routing.module';



@NgModule({
  declarations: [ComponentsRRHHModule],
  imports: [
    CommonModule,
    PageModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RRHHRoutingModule
  ]
})
export class RRHHModule { }
