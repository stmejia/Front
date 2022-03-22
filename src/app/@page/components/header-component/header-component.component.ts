import { OpcionesHeaderComponent } from './../../models/headers';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemHeaderComponent } from '../../models/headers';

@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.css']
})

export class HeaderComponentComponent implements OnInit {

  @Input() header:ItemHeaderComponent;
  @Output() eventos = new EventEmitter<OpcionesHeaderComponent>();
  

  constructor() { }

  ngOnInit(): void {
  }

  emitirEvento(opcion:OpcionesHeaderComponent){
    this.eventos.emit(opcion);
  }

}
