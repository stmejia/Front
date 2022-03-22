import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Imagen } from 'src/app/@aguila/data/models/imagen';
import { ImagenRecurso } from 'src/app/@aguila/data/models/imagenRecurso';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { SweetAlertOptions } from 'sweetalert2';
import { SweetService } from '../../services/sweet.service';

@Component({
  selector: 'app-imagenes',
  templateUrl: './imagenes.component.html',
  styleUrls: ['./imagenes.component.css']
})
export class ImagenesComponent implements OnInit {

  @Input() imagenRecurso: ImagenRecurso = null;
  @Input() imagenRecursoConfiguracion: ImagenRecursoConfiguracion = null;
  @Output() imagenRecursoChange = new EventEmitter<ImagenRecurso>();
  imagenesAEliminar: Imagen[] = [];

  constructor(private sweetService: SweetService) { }

  ngOnInit(): void {
  }

  mostrarImagen(imagen: Imagen) {
    let opt: SweetAlertOptions = {
      heightAuto: false,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: "Guardar Información",
      html: `
      <img class="img-fluid" src="${imagen.urlImagen}">
      <p class="text-left p-0 m-0 pt-10"><b>Titulo De Imagen :</b> </p>
      <input id="swal-input1" class="swal2-input p-0 m-0" value="${imagen.nombre}">
      <p class="text-left p-0 m-0 pt-10"><b>Descripción De Imagen:</b> </p>
      <textarea id="swal-input2" class="swal2-input p-0 m-0">${imagen.descripcion}</textarea>
      `,
      preConfirm: () => {
        return [
          (<HTMLInputElement>document.getElementById('swal-input1')).value,
          (<HTMLTextAreaElement>document.getElementById('swal-input2')).value
        ]
      }
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        if (r.value[0].trim().length < 1) {
          this.sweetService.sweet_alerta('Error', 'Debe proporcionar un Titulo Valido.', 'error');
          return;
        }
        if (r.value[1].trim().length < 1) {
          this.sweetService.sweet_alerta('Error', 'Debe proporcionar una Descripción Valida.', 'error');
          return;
        }

        imagen.descripcion = r.value[1];
        imagen.nombre = r.value[0];
      }
    });
  }

  eliminarImagen(imagen: Imagen) {
    this.sweetService.sweet_confirmacion("Eliminar Imagen", "La imagen se eliminar al guardar los cambios, ¿desea continuar?")
      .then(res => {
        if (res.isConfirmed) {
          if (this.imagenRecurso.imagenesEliminar == null) {
            this.imagenRecurso.imagenesEliminar = [];
          }
          this.imagenRecurso.imagenesEliminar.push(imagen.id);
          this.imagenesAEliminar.push(imagen);
          if (this.imagenRecurso.imagenes) {
            this.imagenRecurso.imagenes = this.imagenRecurso.imagenes.filter(img => img.id != imagen.id);
          }
          if (this.imagenRecurso.imagenDefault) {
            if (this.imagenRecurso.imagenDefault.id == imagen.id) this.imagenRecurso.imagenDefault = null;
          }
          this.enviarImagenRecurso();
        }
      });
  }

  async seleccionarArchivo(event: any) {
    let pesoM = this.imagenRecursoConfiguracion.pesoMaxMb * 1000000;
    let files = event.target.files as File[];
    this.quitarImagenesSinId();
    if (files) {
      if (files.length > this.imagenRecursoConfiguracion.noMaxImagenes) {
        this.sweetService.sweet_alerta("No Máximo De Imagenes", `El maximo de imágenes permitido es ${this.imagenRecursoConfiguracion.noMaxImagenes}`, "error");
        this.enviarImagenRecurso();
        return;
      }
      for (let img of files) {
        if (img.size > pesoM) {
          this.sweetService.sweet_notificacion(`La imagen ${img.name} excede el peso máximo permitido`, 5000, 'error');
          this.enviarImagenRecurso();
          return;
        }
        if (img.type.includes('image')) {
          await this.convertirBase64(img);
        }
      }
    } else {
      this.sweetService.sweet_notificacion('No se seleccionó ninguna archivo', 8000, 'error');
      this.enviarImagenRecurso();
    }
  }

  async convertirBase64(file: File) {
    if(!this.imagenRecurso){
      this.imagenRecurso = { imagenes: []}
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let img = new Imagen();
      img.nombre = file.name;
      img.descripcion = file.name;
      img.fileName = file.name;
      img.subirImagenBase64 = reader.result;
      if (this.imagenRecurso.imagenes) {
        this.imagenRecurso.imagenes.push(img);
      } else {
        this.imagenRecurso.imagenes = [img];
      }
      this.enviarImagenRecurso();
    }
  }

  quitarImagenesSinId() {
    if(!this.imagenRecurso){
      this.imagenRecurso = { imagenes: []}
    }
    if (this.imagenRecurso.imagenes) {
      this.imagenRecurso.imagenes = this.imagenRecurso.imagenes.filter(imagen => imagen.id ? true : false);
    }
  }

  enviarImagenRecurso() {
    this.imagenRecursoChange.emit(this.imagenRecurso);
  }
}
