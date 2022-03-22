import { AsigEstacion } from './../../../@aguila/data/models/asigEstacion';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { Usuario } from './../../../@aguila/data/models/usuario';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Menu } from '../../models/menu';
import { EmpresaService } from 'src/app/@aguila/data/services/empresa.service';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Empresa } from 'src/app/@aguila/data/models/empresa';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  usuario: Usuario = new Usuario();
  estacion: AsigEstacion;
  img: string = "";
  idEmpresa: number = -1;

  constructor(private configService: ConfigService, private empresaService: EmpresaService) { }

  @Input() menuItems: Menu[];
  @Output() clickItem = new EventEmitter();

  ngOnInit(): void {
    forkJoin([
      this.configService.getCargando().pipe(first(val => val == false)),
      this.empresaService.getCargando().pipe(first(val => val == false))
    ]).subscribe(() => this.cargarComponent());
  }

  cargarComponent() {
    this.configService.getEstacionTrabajo().pipe(first()).subscribe(res => this.idEmpresa = res.estacionTrabajo.sucursal.empresaId);
    this.configService.getUsuario().subscribe(res => {
      if (res) {
        this.usuario = res;
        this.mostrarInformacion();
      }
    });
  }

  mostrarInformacion() {
    if (this.usuario.id) {
      this.configService.getEstacionTrabajo().subscribe(res => {
        this.estacion = res;

        //--Fix end point logo empresa

        this.empresaService.consultar<Empresa>(this.idEmpresa).pipe(first()).subscribe(res => {
          if (res.imagenLogo) {
            this.img = res.imagenLogo.imagenDefault.urlImagen;
          } else {
            if (this.estacion.estacionTrabajo.sucursal.empresa.imagenLogo) {
              if (this.estacion.estacionTrabajo.sucursal.empresa.imagenLogo.imagenDefault) {
                if (this.estacion.estacionTrabajo.sucursal.empresa.imagenLogo.imagenDefault.urlImagen) {
                  this.img = this.estacion.estacionTrabajo.sucursal.empresa.imagenLogo.imagenDefault.urlImagen;
                } else {
                  this.img = this.configService.getConfigLogoEmpresa().urlImagenDefaul;
                }
              } else {
                this.img = this.configService.getConfigLogoEmpresa().urlImagenDefaul;
              }
            } else {
              this.img = this.configService.getConfigLogoEmpresa().urlImagenDefaul;
            }
          }
        });
      });
    }
  }

  rutaRegistroNuevo(ruta: string[]): string[] {
    ruta.push("/");
    return ruta;
  }

  getIconoModulo() {
    return this.configService.getIconoModulo(this.configService.getModuloValue().path);
  }

  getModulo() {
    return this.configService.getModulo();
  }
}
