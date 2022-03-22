import { PublicRoutingModule } from './public-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicComponent } from './public.component';
import { HomeComponent } from './components/home.component';
import { PageModule } from '../@page/page.module';
import { MaterialModule } from '../@page/material.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PublicComponent, HomeComponent],
  imports: [
    CommonModule,
    PageModule,
    MaterialModule,
    FormsModule,
    PublicRoutingModule,
  ]
})
export class PublicModule { }
