import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Imagen } from 'src/app/@aguila/data/models/imagen';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { SweetAlertOptions } from 'sweetalert2';
import { SweetService } from '../../services/sweet.service';

@Component({
  selector: 'app-select-images-files',
  templateUrl: './select-files-images.component.html',
  styleUrls: ['./select-files-images.component.css']
})
export class SelectFilesImagesComponent implements OnInit {

  @Input() titulo: string = '';
  @Input() imagenRecurso: ImagenRecursoConfiguracion;
  @Output() listaImagenes = new EventEmitter<Imagen[]>();

  imagenes: Imagen[] = [];

  constructor(private sweetService: SweetService) { }

  ngOnInit(): void {
  }

  async seleccionarArchivo(event: any) {
    let pesoM = this.imagenRecurso.pesoMaxMb * 1000000;
    let files = event.target.files as File[];
    this.imagenes = [];
    if (files) {
      if (files.length > this.imagenRecurso.noMaxImagenes) {
        this.sweetService.sweet_alerta("No Máximo De Imagenes", `El maximo de imágenes permitido es ${this.imagenRecurso.noMaxImagenes}`, "error");
        this.listaImagenes.emit(this.imagenes);
        return;
      }
      for (let img of files) {
        if (img.size > pesoM) {
          this.sweetService.sweet_notificacion(`La imagen ${img.name} excede el peso máximo permitido`, 5000, 'error');
          this.listaImagenes.emit([]);
          return;
        }
        if (img.type.includes('image')) {
          await this.convertirBase64(img);
        }
      }
    } else {
      this.sweetService.sweet_notificacion('No se seleccionó ninguna archivo', 8000, 'error');
      this.listaImagenes.emit(this.imagenes);
    }
  }

  async convertirBase64(file: File) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let img = new Imagen();
      img.nombre = file.name;
      img.descripcion = file.name;
      img.fileName = file.name;
      img.subirImagenBase64 = reader.result;
      this.imagenes.push(img);
      this.listaImagenes.emit(this.imagenes);
    }
  }

  mostrarImagen(imagen: Imagen) {
    let opt: SweetAlertOptions = {
      heightAuto: false,
      icon: 'info',
      showCancelButton: true,
      //input: "textarea",
      confirmButtonText: "Guardar Información",
      html: `
      <img class="img-fluid" src="${imagen.subirImagenBase64}">
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
    this.listaImagenes.emit(this.imagenes);
  }
}
