import { TableGridComponent } from "./table-grid/table-grid.component";
import { PrumodComponent } from "./prumod.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AjustesComponent } from "../@aguila/components/ajustes/ajustes.component";
import { Comp1Component } from "./comp1/comp1.component";

// Las rutas de rutas del form deben ser la misma ruta del listado enviando como parametro el ID del elemento que se va a consultar,
// si esta vacio se tomara como nuevo
const routes: Routes = [
  {
    path: "",
    component: PrumodComponent,
    children: [
      {
        path: "comp1",
        component: Comp1Component,
      },
      {
        path: "tableGrid",
        component: TableGridComponent,
      },
      {
        path: "ajustes",
        component: AjustesComponent,
      },
      { path: "", redirectTo: "comp1", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrumodRoutingModule { }
