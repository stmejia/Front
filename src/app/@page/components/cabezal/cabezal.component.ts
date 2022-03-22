import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
//import * as PrefixFree from "prefixfree";

@Component({
  selector: 'app-cabezal',
  templateUrl: './cabezal.component.html',
  styleUrls: ['./cabezal.component.css']
})
export class CabezalComponent implements OnInit, AfterViewInit {

  @Output() llanta = new EventEmitter();
  @Input() llantasRegistradas: any[] = [];
  @Input() noLlanta: number = 0;
  @Input() modo: "llantas" | "exterior" = "llantas";
  mouseDown = false;
  mouseMoved = false;
  press = "mousedown";
  move = "mousemove";
  release = "mouseup";
  j;
  k;
  l;
  m;
  n;
  o;
  p;
  q;
  r;
  s;

  settings = {
    light: "static",
    shade: ".3",
    tint: ".15",
    border: "0.4",
    bg: "transparent",
    snap: "off",
    match: .5,
    zoom: 100
  }

  @ViewChild("view3D") h: ElementRef<HTMLCanvasElement>;
  @ViewChild("scene") i: ElementRef<HTMLDivElement>;

  constructor() { }
  ngAfterViewInit(): void {
    this.camera(-90, 0);
  }

  ngOnInit(): void {

  }

  ngOnChanges(cambios: SimpleChanges) {
  }

  clickLlanta(no: number) {
    this.llanta.emit(no);
  }

  getLlantaRegistrada(noLlanta: any) {
    if (this.llantasRegistradas.find(i => i.id == noLlanta)) {
      return true;
    } else {
      return false;
    }
  }

  getCss(no) {
    if (!this.getLlantaRegistrada(no) && this.modo == 'llantas') {
      if (this.noLlanta == no && this.modo == 'llantas') {
        return {
          'face-r': true,
          'face-s': true
        };
      }
      return { 'face-r': true };
    }
    if (this.getLlantaRegistrada(no) && this.modo == 'llantas') {
      return { 'face-g': true };
    }
    if (this.modo == 'exterior') {
      return { 'noLlanta': true };
    }
  }

  camera(c, d) {
    this.j = this.h.nativeElement.offsetLeft
    this.k = this.h.nativeElement.offsetTop
    this.l = this.h.nativeElement.offsetWidth
    this.m = this.h.nativeElement.offsetHeight
    this.n = 0
    this.o = 0
    this.p = 0
    this.q = 0
    this.r = "transform:rotateX(" + c + "deg) rotateY(" + d + "deg); "
    this.s = "-webkit-" + this.r + "-moz-" + this.r + "-ms-" + this.r + this.r;
    this.i.nativeElement.setAttribute("style", this.s);

    this.h.nativeElement.addEventListener(this.press, (a: MouseEvent) => {
      if (!this.mouseDown) {
        this.mouseDown = true;
        var b = this.i.nativeElement.style["webkitTransform"];
        this.n = a.pageX - this.l / 2 - this.j;
        this.o = a.pageY - this.m / 2 - this.k;
        this.p = this.translate3DToShape(b).y;
        this.q = this.translate3DToShape(b).x;
      }
    });

    this.h.nativeElement.addEventListener("touchstart", (a: TouchEvent) => {
      if (!this.mouseDown) {
        this.mouseDown = true;
        var b = this.i.nativeElement.style["webkitTransform"];
        this.n = a.changedTouches[0].pageX - this.l / 2 - this.j;
        this.o = a.changedTouches[0].clientY - this.m / 2 - this.k;
        this.p = this.translate3DToShape(b).y;
        this.q = this.translate3DToShape(b).x;
      }
    });

    this.h.nativeElement.addEventListener(this.move, (a: MouseEvent) => {
      if (this.mouseDown) {
        this.pauseEvent(a);
        var b = a.pageX - this.l / 2 - this.j
        var c = a.pageY - this.m / 2 - this.k
        var d = b - this.n
        var e = c - this.o
        var f = this.p + d
        var g = this.q - e
        var h = "transform:rotateX(" + g + "deg) rotateY(" + f + "deg); "
        var r = "-webkit-" + h + "-moz-" + h + "-ms-" + h + h;
        this.i.nativeElement.setAttribute("style", r),
          "dynamic" === this.settings.light
      }
    });

    this.h.nativeElement.addEventListener("touchmove", (a: TouchEvent) => {
      a.preventDefault();
      if (this.mouseDown) {
        this.pauseEvent(a);
        var b = a.changedTouches[0].pageX - this.l / 2 - this.j
        var c = a.changedTouches[0].clientY - this.m / 2 - this.k
        var d = b - this.n
        var e = c - this.o
        var f = this.p + d
        var g = this.q - e
        var h = "transform:rotateX(" + g + "deg) rotateY(" + f + "deg); "
        var r = "-webkit-" + h + "-moz-" + h + "-ms-" + h + h;
        this.i.nativeElement.setAttribute("style", r),
          "dynamic" === this.settings.light
      }
    });

    this.h.nativeElement.addEventListener(this.release, () => {
      this.mouseDown && (this.mouseDown = !1);
    });

    this.h.nativeElement.addEventListener("touchend", (a: TouchEvent) => {
      this.mouseDown && (this.mouseDown = !1);
    });
  }

  translate3DToShape(a) {
    a = a.toString();
    var b = /([0-9-.]+)+(?![3d]\()/gi

    var c = a.match(b);
    return {
      x: parseFloat(c[0]),
      y: parseFloat(c[1]),
      z: parseFloat(c[2])
    }
  }

  pauseEvent(a) {
    return a.stopPropagation && a.stopPropagation(),
      a.preventDefault && a.preventDefault(),
      a.cancelBubble = !0,
      a.returnValue = !1,
      !1
  }
}
