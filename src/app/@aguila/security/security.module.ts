import { LoginComponent } from './components/login/login.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecurityRoutingModule } from './security-routing.module';
import { SecurityComponent } from './security.component';
import { MaterialModule } from "../../@page/material.module";
import { FormsModule,ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [SecurityComponent, LoginComponent],
  imports: [
    CommonModule,
    SecurityRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class SecurityModule { }
