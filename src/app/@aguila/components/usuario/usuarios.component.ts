import { Router } from "@angular/router";
import { SweetService } from "./../../../@page/services/sweet.service";
import { Usuario } from "./../../data/models/usuario";
import { Component, OnInit } from "@angular/core";
import { UsuarioService } from "../../data/services/usuario.service";
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { first } from 'rxjs/operators';
import { ImagenRecursoConfiguracion } from "../../data/models/imagenRecursoConfiguracion";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-usuarios",
  templateUrl: "./usuarios.component.html",
  //styleUrls: ['./usuarios.component.css']
})

export class UsuariosComponent extends BaseComponent implements OnInit {

  private imgRecursoPerfil: ImagenRecursoConfiguracion = null;

  constructor(protected s: UsuarioService, protected sw: SweetService, protected r: Router) {
    super("Usuarios", s, sw);
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 2:
        this.s.navegar([this.rutaComponent, '']);
        break;
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.s.navegar([this.rutaComponent, event.objeto.id]);
        break;
      case 2:
        this.s.navegar([this.rutaComponent, event.objeto.id]);
        break;
      case 3:
        this.eliminarItem(event.objeto);
        break;
      case 4:
        this.s.navegar(["aguila", "usuarios_permisos", event.objeto.id]);
        break;
      case 5:
        this.bloquearUsuario(event.objeto);
        break;
      case 6:
        this.restablecerClave(event.objeto);
        break;
    }
  }

  cargarComponent() {
    this.rutaComponent = this.r.url;
    forkJoin([
      this.s.getImagenRecursoConfiguracion("ImagenPerfil")
    ]).pipe(first()).subscribe(res => {
      this.imgRecursoPerfil = res[0];
      this.cargarPantalla();
    }, (error) => {
      console.log(error);
      this.sw.sweet_notificacion("La pantalla presenta errores", 5000, 'error');
      this.cargarPantalla();
    });
  }

  cargarPantalla() {
    this.header.opciones.push({
      icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
      idEvento: 2, toolTip: 'Agregar registro nuevo', color: 'primary'
    });

    this.columnasTabla = [
      { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'left', visible: true },
      { titulo: 'perm_media', target: ['imagenPerfil', 'imagenDefault', 'urlImagen'], tipo: 'imagen', imgError: this.imgRecursoPerfil ? this.imgRecursoPerfil.urlImagenDefaul : 'assets/img/LogoApp.png', aligment: 'right', visible: true },
      { titulo: 'Usuario', target: ['username'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Nombre', target: ['nombre'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Correo', target: ['email'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: '¿Activo?', target: ['activo'], tipo: 'boolean', aligment: 'center', visible: true },
      { titulo: 'Fecha De Bloqueo', target: ['fchBloqueado'], tipo: 'fecha', aligment: 'left', visible: true },
      { titulo: 'Fecha De Creación', target: ['fchCreacion'], tipo: 'fecha', aligment: 'left', visible: true }
    ]

    this.menuDeOpcionesTabla = [
      { icono: 'find_in_page', nombre: 'Consultar', disponible: this.opcionDisponible('Consultar'), idEvento: 1 },
      { icono: 'create', nombre: 'Modificar', disponible: this.opcionDisponible('Modificar'), idEvento: 2 },
      { icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible('Eliminar'), idEvento: 3 },
      { icono: 'admin_panel_settings', nombre: 'Asignar Permisos', disponible: this.opcionDisponible('Asignar Permisos'), idEvento: 4 },
      { icono: 'lock', nombre: 'Bloquear Usuario', disponible: this.opcionDisponible('Bloquear Usuario'), idEvento: 5 },
      { icono: 'vpn_key', nombre: 'Restablecer Contraseña', disponible: this.opcionDisponible('Restablecer Contraseña'), idEvento: 6 },
    ]

    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    this.filtros.push({
      nombre: "Usuario",
      valores: [],
      filters: [{ filtro: "username", parametro: "" }],
      tipo: "input",
      activo: true,
      requerido: false
    });
    this.queryFilters = [];
    this.cargandoDatosDelComponente = false;
  }

  eliminarItem(item: Usuario) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el registro ${item.nombre}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.s.eliminar(item.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion('Elemento Eliminado', 5000);
            this.cargarPaginaFiltros();
          }, (error) => {
            console.log(error);
            this.sweetService.sweet_Error(error);
          });
        }
      });
  }

  restablecerClave(user: Usuario) {
    this.sweetService
      .sweet_input(
        "Restablecer Contraseña",
        "Restablece la contraseña del usuario y lo activa. El usuario debera cambiar su contraseña al iniciar sesión.",
        "password",
        "Ingrese una contraseña",
        true,
        "warning"
      )
      .then((res) => {
        if (res) {
          let usuario = new Usuario();
          usuario.username = user.username;
          usuario.password = res as string;
          user.password = res as string;
          this.s.restablecerPassword(user).subscribe((res) => {
            if (res) {
              this.sweetService.sweet_notificacion(
                "Contraseña de usuario restablecida",
                5000
              );
              this.cargarPaginaFiltros();
            }
          });
        }
      });
  }

  bloquearUsuario(user: Usuario) {
    this.sweetService
      .sweet_confirmacion(
        "Bloquear Usuario",
        `¿Desea bloquear el usario ${user.username} - ${user.nombre}?. El usuario no podra iniciar sesión.`
      )
      .then((res) => {
        if (res.isConfirmed) {
          this.s.bloquear(user).subscribe((res) => {
            if (res) {
              this.sweetService.sweet_notificacion("Usuario Bloqueado", 5000);
              this.cargarPaginaFiltros();
            } else {
              this.sweetService.sweet_notificacion("Error de Respuesta", 5000);
            }
          });
        }
      });
  }
}