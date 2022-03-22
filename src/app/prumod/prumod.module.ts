import { PrumodRoutingModule } from './prumod-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comp1Component } from './comp1/comp1.component';
import { PrumodComponent } from './prumod.component';
import { PageModule } from '../@page/page.module';
import { MaterialModule } from '../@page/material.module';
import { FormsModule } from '@angular/forms';
import { TableGridComponent } from './table-grid/table-grid.component';

@NgModule({
  declarations: [PrumodComponent, Comp1Component, TableGridComponent],
  imports: [
    CommonModule,
    PageModule,
    MaterialModule,
    FormsModule,
    PrumodRoutingModule,
  ]
})

export class PrumodModule { }
