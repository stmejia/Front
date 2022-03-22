import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Columna } from 'src/app/@page/models/columna';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})

export class WelcomeComponent implements OnInit {
  listaDatos: any[] = [];
  cargando = true;
  columnas: Columna[] = [
    { nombre: 'Autor', targetId: 'author', tipo: 'texto', aligment: 'left', visible: true },
    { nombre: 'Titulo', targetId: 'title', tipo: 'texto', aligment: 'left', visible: true },
    { nombre: 'Contenido', targetId: 'content', tipo: 'texto', aligment: 'left', visible: true },
    { nombre: 'Portada', targetId: 'cover', tipo: 'imagen', aligment: 'left', visible: true },
    { nombre: 'Idioma', targetId: 'language', tipo: 'texto', aligment: 'left', visible: true },
    { nombre: 'No. Paginas', targetId: 'pages', tipo: 'texto', aligment: 'center', visible: true },
    { nombre: 'Editora', targetId: 'publisher', tipo: 'texto', aligment: 'left', visible: true },
    { nombre: 'F. Publicación', targetId: 'publisher', tipo: 'texto', aligment: 'left', visible: false },
  ];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // this.http.get("https://www.etnassoft.com/api/v1/get/?category=libros_programacion&criteria=most_viewed?results_range=0&num_items=200")
    //   .subscribe((res: any) => {
    //     this.listaDatos = res;
    //     this.cargando = false;
    //   });
  }
}
