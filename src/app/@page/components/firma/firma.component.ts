import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Imagen } from 'src/app/@aguila/data/models/imagen';
//import ResizeObserver from 'resize-observer-polyfill';

@Component({
  selector: 'app-firma',
  templateUrl: './firma.component.html',
  styleUrls: ['./firma.component.css']
})
export class FirmaComponent implements OnInit, AfterViewInit {

  @Output() base64 = new EventEmitter<any>();

  private factorDeAlisamiento = 2;
  //private firma = document.getElementById("firmaCanvas");
  private dibujar: boolean = false;
  private observador;
  private trazados = [];
  private puntos = [];
  private ctx;
  private cw;
  private ch;

  @ViewChild("firmaCanvas") firma: ElementRef<HTMLCanvasElement>;
  @ViewChild("divCanvas") divCanvas: ElementRef<HTMLDivElement>;

  constructor() {
  }

  ngOnInit(): void { }

  ngOnDestroy() {
    this.observador.unobserve(this.divCanvas.nativeElement);
  }

  ngAfterViewInit(): void {
    this.base64.emit(null);
    this.observador = new (window as any).ResizeObserver(entrada => {
      let lectura = entrada[0].contentRect;
      let w = lectura.width;
      let h = lectura.height;

      this.cw = this.firma.nativeElement.width = this.divCanvas.nativeElement.offsetWidth;
      this.ch = this.firma.nativeElement.height = this.divCanvas.nativeElement.offsetHeight;

      this.dibujarTrazo();
    });

    this.observador.observe(this.divCanvas.nativeElement);

    this.ctx = this.firma.nativeElement.getContext("2d");
    this.ctx.lineJoin = "round";

    this.firma.nativeElement.addEventListener("mousedown", () => {
      this.dibujar = true;
      this.puntos.length = 0;
      this.ctx.beginPath();
    });

    this.firma.nativeElement.addEventListener("touchstart", (event) => {
      this.dibujar = true;
      this.puntos.length = 0;
      this.ctx.beginPath();
      event.preventDefault();
    });

    this.firma.nativeElement.addEventListener("mouseup", () => {
      this.dibujarTrazo();
    });

    this.firma.nativeElement.addEventListener("mouseout", () => {
      this.dibujarTrazo();
    });

    this.firma.nativeElement.addEventListener("touchend", (event) => {
      event.preventDefault();
      this.dibujarTrazo();
    });

    this.firma.nativeElement.addEventListener("mousemove", (evt) => {
      if (this.dibujar) {
        let m = this.oMousePos(this.firma.nativeElement, evt);
        this.puntos.push(m);
        this.ctx.lineTo(m.x, m.y);
        this.ctx.stroke();
      }
    });

    this.firma.nativeElement.addEventListener("touchmove", (evt) => {
      evt.preventDefault();
      if (this.dibujar) {
        let m = this.onTouchPos(this.firma.nativeElement, evt);
        this.puntos.push(m);
        this.ctx.lineTo(m.x, m.y);
        this.ctx.stroke();
      }
    });
  }

  limpiarFirma() {
    this.dibujar = false;
    this.ctx.clearRect(0, 0, this.cw, this.ch);
    this.trazados.length = 0;
    this.puntos.length = 0;
    this.base64.emit(null);
  }

  dibujarTrazo() {
    this.dibujar = false;
    this.ctx.clearRect(0, 0, this.cw, this.ch);
    this.reducirArray(this.factorDeAlisamiento, this.puntos);
    for (var i = 0; i < this.trazados.length; i++) {
      this.alisarTrazado(this.trazados[i]);
    }
    let firma = new Imagen();
    firma.nombre = "Firma";
    firma.descripcion = "";
    firma.fileName = "firma.png";
    firma.subirImagenBase64 = this.firma.nativeElement.toDataURL("image/png");
    this.base64.emit([firma]);
  }

  alisarTrazado(ry) {
    if (ry.length > 1) {
      let ultimoPunto = ry.length - 1;
      this.ctx.beginPath();
      this.ctx.moveTo(ry[0].x, ry[0].y);
      for (let i = 1; i < ry.length - 2; i++) {
        let pc = this.calcularPuntoDeControl(ry, i, i + 1);
        this.ctx.quadraticCurveTo(ry[i].x, ry[i].y, pc.x, pc.y);
      }
      this.ctx.quadraticCurveTo(ry[ultimoPunto - 1].x, ry[ultimoPunto - 1].y, ry[ultimoPunto].x, ry[ultimoPunto].y);
      this.ctx.stroke();
    }
  }

  calcularPuntoDeControl(ry, a, b) {
    var pc: any = {}
    pc.x = (ry[a].x + ry[b].x) / 2;
    pc.y = (ry[a].y + ry[b].y) / 2;
    return pc;
  }

  reducirArray(n, elArray) {
    var nuevoArray = [];
    nuevoArray[0] = elArray[0];
    for (var i = 0; i < elArray.length; i++) {
      if (i % n == 0) {
        nuevoArray[nuevoArray.length] = elArray[i];
      }
    }
    nuevoArray[nuevoArray.length - 1] = elArray[elArray.length - 1];
    this.trazados.push(nuevoArray);
  }

  onTouchPos(canvas: HTMLCanvasElement, evt: TouchEvent) {
    let ClientRect = canvas.getBoundingClientRect();

    return {
      x: Math.round(evt.changedTouches[0].pageX - ClientRect.left),
      y: Math.round(evt.changedTouches[0].clientY - ClientRect.top)
    }
  }

  oMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
    let ClientRect = canvas.getBoundingClientRect();

    return {
      x: Math.round(evt.clientX - ClientRect.left),
      y: Math.round(evt.clientY - ClientRect.top)
    }
  }
}
