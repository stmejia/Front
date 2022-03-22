import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-input-code-aguila',
  templateUrl: './input-code-aguila.component.html',
  styleUrls: ['./input-code-aguila.component.css']
})
export class InputCodeAguilaComponent implements OnInit {

  @Input() inputLabel:string;
  @Input() typeInput: 'text' | 'number' = 'text';
  @Input() label: string = "";
  @Input() inputValue = "";
  @Input() tooltipButton = "Buscar Registro";

  constructor() { }

  ngOnInit(): void {
  }


}
