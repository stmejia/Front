import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AjustesComponent } from "../@aguila/components/ajustes/ajustes.component";
import { AuthGuard } from "../@aguila/security/guards/auth.guard";
import { EmpleadoComponent } from "../@catalogos/components/empleado/empleado.component";
import { EmpleadosComponent } from "../@catalogos/components/empleado/empleados.component";
import { Error404Component } from "../@page/components/error404/error404.component";
import { ReporteAusenciasComponent } from "./components/reporte-ausencias/reporte-ausencias.component";
import { ReporteIEColaboradoresComponent } from "./components/reporte-iecolaboradores/reporte-iecolaboradores.component";
import { RRHHComponent } from "./rrhh.component";

const routes: Routes = [
    {
        path: "",
        component: RRHHComponent,
        children: [
            { path: "reportes/iecolaboradores", component: ReporteIEColaboradoresComponent, canActivate: [AuthGuard] },
            { path: "reportes/ausenciaColaboradores", component: ReporteAusenciasComponent, canActivate: [AuthGuard] },
            { path: "empleados", component: EmpleadosComponent, canActivate: [AuthGuard] },
            { path: "empleados/:id", component: EmpleadoComponent, canActivate: [AuthGuard] },
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

export class RRHHRoutingModule { }