import { AuthService } from './../../../@aguila/security/services/auth.service';
import { environment } from './../../../../environments/environment';
import { Textos } from './../../../@aguila/data/models/textos';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { Usuario } from './../../../@aguila/data/models/usuario';
import { Component, OnInit, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Modulo } from 'src/app/@aguila/data/models/modulo';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() sidenav: MatSidenav
  isAuthenticated: boolean = false;
  usuario = new Usuario();
  img: string;
  textos: Textos = null;
  produccion: boolean = environment.production;
  modulosU: Modulo[] = [];

  constructor(private configService: ConfigService, private authService: AuthService) {
    this.cargarDatos();
  }

  ngOnInit(): void { }

  async cargarDatos() {
    await this.configService.getTextos().then(res => {
      this.textos = res;
    });

    this.configService.getUsuario().subscribe(res => {
      if (res) {
        this.usuario = res;
        this.motrarInformacion();
      }
    });
    this.configService.getModulos().subscribe(res => {
      this.modulosU = res;
    });
  }

  getIconoModulo(ruta: string): string {
    return this.configService.getIconoModulo(ruta);
    
  }

  cambiarModulo(modulo: Modulo) {
    this.configService.cargarModulo('', false, modulo);
  }

  motrarInformacion() {
    if (this.usuario.id) {
      if (this.usuario.imagenPerfil) {
        if (this.usuario.imagenPerfil.imagenDefault) {
          if (this.usuario.imagenPerfil.imagenDefault.urlImagen) {
            this.img = this.usuario.imagenPerfil.imagenDefault.urlImagen;
          } else {
            this.img = this.configService.getConfigImgPerfil().urlImagenDefaul;
          }
        } else {
          this.img = this.configService.getConfigImgPerfil().urlImagenDefaul;
        }
      } else {
        this.img = this.configService.getConfigImgPerfil().urlImagenDefaul;
      }
    }
  }

  isSuperAdmin(): boolean {
    if (this.authService.hasRole('SUPERADMIN')) {
      return true;
    } else {
      return false;
    }
  }

  btnLogout() {
    this.configService.cerrarSesion();
  }

  EstacionDialog() {
    this.configService.selectEstacion();
  }

}
