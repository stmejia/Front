import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AjustesComponent } from "../@aguila/components/ajustes/ajustes.component";
import { AuthGuard } from "../@aguila/security/guards/auth.guard";
import { Error404Component } from "../@page/components/error404/error404.component";
import { ColaboradorComponent } from "./components/colaboradores/colaborador.component";
import { ColaboradoresComponent } from "./components/colaboradores/colaboradores.component";
import { ContratistaComponent } from "./components/contratistas/contratista.component";
import { ContratistasComponent } from "./components/contratistas/contratistas.component";
import { ControlIEEquipoComponent } from "./components/control-ieequipo/control-ieequipo.component";
import { ControlIEEquiposComponent } from "./components/control-ieequipo/control-ieequipos.component";
import { VisitaComponent } from "./components/visitas/visita.component";
import { VisitasComponent } from "./components/visitas/visitas.component";
import { ControlGaritaComponent } from "./control-garita.component";

const routes = [
    {
        path: "",
        component: ControlGaritaComponent,
        children: [
            { path: "visitas", component: VisitasComponent, canActivate: [AuthGuard] },
            { path: "visitas/:id", component: VisitaComponent, canActivate: [AuthGuard] },
            { path: "contratistas", component: ContratistasComponent, canActivate: [AuthGuard] },
            { path: "contratistas/:id", component: ContratistaComponent, canActivate: [AuthGuard] },
            { path: "colaboradores", component: ColaboradoresComponent, canActivate: [AuthGuard] },
            { path: "colaboradores/:id", component: ColaboradorComponent, canActivate: [AuthGuard] },
            { path: "ieEquipos", component: ControlIEEquiposComponent, canActivate: [AuthGuard] },
            { path: "ieEquipos/:id", component: ControlIEEquipoComponent, canActivate: [AuthGuard] },
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

export class ControlGaritaRoutingModule { }