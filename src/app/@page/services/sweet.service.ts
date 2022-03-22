import { Injectable } from '@angular/core';
import swal, { SweetAlertIcon, SweetAlertInput, SweetAlertOptions } from "sweetalert2";

@Injectable({
  providedIn: "root",
})

export class SweetService {

  constructor() {
  }

  //Titulo de la alerta -- Mensaje de Alerta -- Icono a mostrar (opcional)
  sweet_alerta(titulo: string, msj: string, icono: SweetAlertIcon = "success") {
    swal.fire({
      //Titulo de la Alerta
      title: titulo,
      //Mensaje de la Alerta
      text: msj,
      //Icono de la Alerta -- por defecto success
      icon: icono,
      //Corrige el error de diseño
      heightAuto: false,
    });
  }

  //Mensaje Notificacion -- Tiempo Visible de la Notificacion (opcional) -- Icono de la Notificacion (opcional)
  sweet_notificacion(
    msj: string,
    timer: number = 2000,
    icono: SweetAlertIcon = "success",
    toast: boolean = true
  ) {
    swal.fire({
      //Posicion de la notificación
      position: "bottom-end",
      //icono a mostrar -- por defecto success
      icon: icono,
      //Mesnaje de la notificación
      text: msj,
      //Tiempo visible de la notificacion -- por defecto 2 segundos
      timer: timer,
      //Oculta/muestra el boton de confirmacion
      showConfirmButton: true,
      //Texto del boton de confirmacion
      confirmButtonText: "X",
      //Muestra una barra que indica el tiempo visible de la notificacion
      timerProgressBar: true,
      //Muestra la Notificacion como un Toast
      toast: toast,
      //Color de fondo de notificacion
      background: "#FFFFFF",
    });
  }

  //Titulo del cuadro -- Mensaje del Cuadro --Icono del Cuadro (opcional)
  sweet_confirmacion(
    titulo: string,
    msj: string,
    icono: SweetAlertIcon = "question"
  ) {
    //Se debe crear una refencia del dialogo para escuchar la respuesta
    return swal.fire({
      //Titulo del Cuadro
      title: titulo,
      //Mensaje del Cuadro
      text: msj,
      //Icono del cuadro -- por defecto question
      icon: icono,
      //Muestra boton de cancelar
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Si",
      //Color detrad del cuadro
      //backdrop: 'rgba(13,36,70,0.9)'
      //Corrige el error de diseño
      heightAuto: false,
    });
  }

  sweet_custom(option: SweetAlertOptions) {
    return swal.fire(option);
  }

  //Titulo del cuadro -- Tipo de input (opcional) -- Mensaje de Error -- Bloqueo del cuadro (opcional)
  async sweet_input(
    titulo: string,
    msj: string,
    type: SweetAlertInput = "text",
    error: string,
    lock: boolean = false,
    icono: SweetAlertIcon = "question"
  ) {
    //Lo que se ingrese en el imput se almacenara en la variable "valor"
    const { value: valor } = await swal.fire({
      //Titulo del cuadro
      title: titulo,
      //Mensaje del cuadro
      text: msj,
      //Tipo de entrada
      input: type,
      //Permitir cerrar el cuadro al hacer click fuera de el
      allowOutsideClick: !lock,
      //Permitir cerrar el cuadro al precionar la tecla Escape
      allowEscapeKey: !lock,
      //Permitir cerrar el cuadro al precionar la tecla Enter
      allowEnterKey: !lock,
      //Muestra un boton de cancelar
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      //Icono del cuadro -- por defecto question
      icon: icono,
      //Corrige el error de diseño
      heightAuto: false,
      //Valida que el input no este vacio
      inputValidator: (value) => {
        if (!value) {
          //muestra el Mensaje de Error
          return error;
        }
      },
    });
    // Verificamos que la varible 'valor' tenga un valor
    if (valor) {
      //Retornamos el valor de la variable
      return valor;
    } else {
      //Retornamos null si la variable 'valor' no contienen ningun valor
      return null;
    }
  }

  async sweet_input_date(titulo: string, mensaje: string, icono: SweetAlertIcon, lock: boolean = false,) {
    return swal.fire<Date>({
      title: titulo,
      text: mensaje,
      icon: icono,
      heightAuto: false,
      showCancelButton: true,
      allowOutsideClick: !lock,
      allowEscapeKey: !lock,
      allowEnterKey: !lock,
      cancelButtonText: "Cancelar",
      html: `<p>${mensaje}</p>` +
        '<input id="swInputDate" type="datetime-local">',
      preConfirm: () => {
        return new Date((<HTMLInputElement>document.getElementById('swInputDate')).value);
      }
    });
  }

  sweet_pasos(type: SweetAlertInput = "text") {
    return swal.mixin({
      input: type,
    });
  }

  sweet_carga(titulo: string,
    lock: boolean = true) {
    return swal.fire({
      html:
        `<h5 class="text-bold p-0 m-0">${titulo}</h5>` +
        '<div class="cssload-container">' +
        '<div class="cssload-lt"></div>' +
        '<div class="cssload-rt"></div>' +
        '<div class="cssload-lb"></div>' +
        '<div class="cssload-rb"></div>' +
        '</div>',
      showConfirmButton: false,
      allowOutsideClick: !lock,
      //Permitir cerrar el cuadro al precionar la tecla Escape
      allowEscapeKey: !lock,
      //Permitir cerrar el cuadro al precionar la tecla Enter
      allowEnterKey: !lock,
      //Corrige el error de diseño
      heightAuto: false,
    });
  }

  sweetImagen(imagen: string | ArrayBuffer) {
    /* swal.fire({
      imageUrl:imagen,
      imageAlt:'Vista Previa de Imagen',
      showCloseButton: true,
      showConfirmButton: false,
    }) */
    swal.fire({
      html:
        `<img class="img-fluid" src="${imagen}">`,
      showCloseButton: true,
      showConfirmButton: false,
    })
  }

  sweet_Error(e: any) {
    console.log(e);
    try {
      this.sweet_alerta(
        e.error.aguilaErrores[0].titulo,
        e.error.aguilaErrores[0].detalle,
        "error"
      );
    } catch (error) {
      this.sweet_alerta(`Error ${e.status}`,
        'No es posible interpretar el error, comuníquese con el administrador del sistema. Error: ' + e.error,
        'error');
    }
  }

  sweet_error_permiso_recurso(recurso: string, accion: string = "") {
    this.sweet_alerta(
      `Acceso Denegado ${accion}`,
      `No posees permiso para acceder al recurso ${recurso}`,
      "error"
    );
  }
}
