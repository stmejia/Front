import { ModuleGuard } from './@aguila/security/guards/module.guard';
import { Error404Component } from './@page/components/error404/error404.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: "",
    component: AppComponent,
    children: [
      {
        path: 'aguila', loadChildren: () => import('./@aguila/aguila.module')
          .then(m => m.AguilaModule), canActivate: [ModuleGuard]
      },
      {
        path: 'prumod', loadChildren: () => import('./prumod/prumod.module')
          .then(m => m.PrumodModule), canActivate: [ModuleGuard]
      },
      {
        path: 'security', loadChildren: () => import('./@aguila/security/security.module')
          .then(m => m.SecurityModule)
      },
      {
        path: 'catalogos', loadChildren: () => import('./@catalogos/catalogos.module')
          .then(m => m.CatalogosModule), canActivate: [ModuleGuard]
      },
      {
        path: 'activoOperaciones', loadChildren: () => import('./@activoOperacion/activo-operacion.module')
          .then(m => m.ActivoOperacionModule), canActivate: [ModuleGuard]
      },
      {
        path: 'controlGarita', loadChildren: () => import('./@controlGarita/control-garita.module')
          .then(m => m.ControlGaritaModule), canActivate: [ModuleGuard]
      },
      {
        path: 'taller', loadChildren: () => import('./@taller/taller.module')
          .then(m => m.TallerModule), canActivate: [ModuleGuard]
      },
      {
        path: 'rrhh', loadChildren: () => import('./@rrhh/rrhh.module')
          .then(m => m.RRHHModule), canActivate: [ModuleGuard]
      },
      { path: 'instructivoCabezal', redirectTo: '/assets/instructivos/Instructivo_Condicion_EquipoRemolque_Cabezal.jpg', pathMatch: 'full' },
      { path: '404', component: Error404Component },
      { path: '**', redirectTo: '404', pathMatch: 'full' },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
