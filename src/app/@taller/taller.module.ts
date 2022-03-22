import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageModule } from '../@page/page.module';
import { MaterialModule } from '../@page/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ComponentsTallerModule } from './taller-components';
import { TallerRoutingModule } from './taller-routing.module';



@NgModule({
  declarations: [ComponentsTallerModule],
  imports: [
    CommonModule,
    PageModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TallerRoutingModule
  ]
})
export class TallerModule { }
