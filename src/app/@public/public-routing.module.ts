import { HomeComponent } from './components/home.component';
import { PublicComponent } from './public.component';
import { Error404Component } from './../@page/components/error404/error404.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "", component: PublicComponent, children: [
      { path: "home", component: HomeComponent},
      { path: "", redirectTo: "home", pathMatch: "full" },
      { path: "404", component: Error404Component},
      { path: "**", redirectTo: "404", pathMatch: "full" },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class PublicRoutingModule { }