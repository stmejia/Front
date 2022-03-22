import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AjustesComponent } from "../@aguila/components/ajustes/ajustes.component";
import { AuthGuard } from "../@aguila/security/guards/auth.guard";
import { Error404Component } from "../@page/components/error404/error404.component";
import { TallerComponent } from "./taller.component";
import { ComponentsTallerModule } from "./taller-components";
import { TiposReparacionesComponent } from "../@catalogos/components/tipo-reparaciones/tipos-reparaciones.component";
import { TipoReparacionesComponent } from "../@catalogos/components/tipo-reparaciones/tipo-reparaciones.component";
import { ReparacionesComponent } from "../@catalogos/components/reparacion/reparaciones.component";
import { ReparacionComponent } from "../@catalogos/components/reparacion/reparacion.component";
import { ListasComponent } from "../@catalogos/components/lista/listas.component";
import { ListaComponent } from "../@catalogos/components/lista/lista.component";

const routes: Routes = [
    {
        path: "",
        component: TallerComponent,
        children: [
            { path: "inspeccionesIngreso/vehiculos", component: ComponentsTallerModule[1], canActivate: [AuthGuard] },
            { path: "inspeccionesIngreso/vehiculos/:id", component: ComponentsTallerModule[2], canActivate: [AuthGuard] },
            { path: "catalogos/listas/:idTipoLista", component: ListasComponent, canActivate: [AuthGuard] },
            { path: "catalogos/listas/:idTipoLista/:id", component: ListaComponent, canActivate: [AuthGuard] },
            { path: "catalogos/tipoReparaciones", component: TiposReparacionesComponent, canActivate: [AuthGuard] },
            { path: "catalogos/tipoReparaciones/:id", component: TipoReparacionesComponent, canActivate: [AuthGuard] },
            { path: "catalogos/reparaciones", component: ReparacionesComponent, canActivate: [AuthGuard] },
            { path: "catalogos/reparaciones/:id", component: ReparacionComponent, canActivate: [AuthGuard] },
            { path: "ajustes", component: AjustesComponent, canActivate: [AuthGuard] },
            { path: "", redirectTo: "ajustes", pathMatch: "full" },
            { path: "404", component: Error404Component },
            { path: "**", redirectTo: "404", pathMatch: "full" },
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class TallerRoutingModule { }