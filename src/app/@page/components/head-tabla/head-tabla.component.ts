import { Component, Input, OnInit } from '@angular/core';
import { Columna } from '../../models/columna';

@Component({
  selector: 'app-head-tabla',
  templateUrl: './head-tabla.component.html',
  styleUrls: ['./head-tabla.component.css']
})
export class HeadTablaComponent implements OnInit {

  @Input() columna:Columna;

  constructor() { }

  ngOnInit(): void {
  }

}
