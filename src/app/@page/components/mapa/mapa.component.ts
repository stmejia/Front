import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { LatLng } from '../../models/latlng';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})

export class MapaComponent implements OnInit {

  @Input() titulo: string = "Marque la Ubicación";
  @Input() modo: 'ubicacion' | 'ruta' | 'rutas' = "ubicacion";
  @Input() latitud;
  @Input() longitud;
  @Input() origen: LatLng;
  @Input() destino: LatLng;
  @Input() ubicaciones: LatLng[] = [];

  @Output() latlng = new EventEmitter<any>();
  @Output() ruta = new EventEmitter<any>();

  private map;
  private ubicacion: number[] = [0, 0];
  private marcador;
  private routeControl = null;

  tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 7,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  // tiles = L.tileLayer('http://192.168.10.190/{s}/v1/car/tile({x},{y},{z}).png', {
  //   maxZoom: 19,
  //   minZoom: 7,
  //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  // });

  constructor() { }

  ngOnInit(): void {
    this.getPosition().then(res => {
      this.ubicacion[0] = res.lat;
      this.ubicacion[1] = res.lng;
      console.log("Ubicación de GPS");

      this.iniciarMapa();
    }).catch(res => {
      console.log("Ubicación de Memoria");
      this.ubicacion = [14.6229,-90.5315];
      //this.ubicacion.push(14.6229);
      //this.ubicacion.push(-90.5315);
      this.iniciarMapa();
    });
  }

  ngOnChanges(cambios) {
    if (cambios.origen) {
      if (!cambios.origen.firstChange) {
        if (this.routeControl) {
          this.actualizarRuta();
        } else {
          this.marcarRuta();
        }
      }
    }
    if (cambios.destino) {
      if (!cambios.destino.firstChange) {
        if (this.routeControl) {
          this.actualizarRuta();
        } else {
          this.marcarRuta();
        }
      }
    }

    if (cambios.ubicaciones) {
      if (!cambios.ubicaciones.firstChange) {
        if (this.routeControl) {
          console.log("Actualizando Ruta", cambios.ubicaciones.currentValue);
          this.actualizarRutas();
        } else {
          console.log("marcando Rutas", cambios.ubicaciones.currentValue);
          this.marcarRutas();
        }
      }
    }
  }

  private iniciarMapa() {
    switch (this.modo) {
      case 'ubicacion':
        this.marcarUbicacion();
        break;
      case 'ruta':
        this.map = L.map('map', {
          center: this.ubicacion,
          zoom: 10
        });
        this.tiles.addTo(this.map);
        this.marcarRuta();
        break;

      case 'rutas':
        this.map = L.map('map', {
          center: this.ubicacion,
          zoom: 10
        });
        this.tiles.addTo(this.map);
        this.marcarRutas();
        break;
    }
  }

  marcarUbicacion() {
    if (this.latitud && this.longitud) {
      this.map = L.map('map', {
        center: [this.latitud, this.longitud],
        zoom: 18
      });

      L.marker([this.latitud, this.longitud], {
        title: "Ubicación"
      }).addTo(this.map);

    } else {
      this.map = L.map('map', {
        center: this.ubicacion,
        zoom: 13
      });
    }

    this.tiles.addTo(this.map);

    let search = GeoSearchControl({
      provider: new OpenStreetMapProvider()
    });
    console.log(search.onSubmit());

    this.map.addControl(search);

    this.map.on('click', (e) => {
      this.map.eachLayer((layer) => {
        if (layer.options.title) {
          this.map.removeLayer(layer)
        }
      });

      this.marcador = L.marker([e.latlng.lat, e.latlng.lng], {
        title: "Ubicación"
      }).addTo(this.map);

      this.latlng.emit(this.marcador._latlng);
    });
  }

  marcarRuta() {
    if (this.origen && this.destino) {
      this.routeControl = L.Routing.control({
        router: new L.Routing.OSRMv1({
          serviceUrl: 'http://192.168.1.17:5000/route/v1'
        }),
        //autoRoute: false,
        //show: false,
        waypoints: [],
        plan: new L.Routing.Plan([{
          name: "Ubicación de Origen",
          latLng: this.getLatLng(this.origen.latitud, this.origen.longitud)
        },
        {
          name: "Ubicación de Destino",
          latLng: this.getLatLng(this.destino.latitud, this.destino.longitud)
        }], {
          addWaypoints: false,
          draggableWaypoints: false
        }),
        lineOptions: {
          addWaypoints: false
        },
        language: 'es',
      });
      this.routeControl.addTo(this.map);
    }
  }

  actualizarRuta() {
    if (this.origen && this.destino) {
      this.routeControl.setWaypoints([
        {
          name: "Ubicación de Origen",
          latLng: this.getLatLng(this.origen.latitud, this.origen.longitud)
        },
        {
          name: "Ubicación de Destino",
          latLng: this.getLatLng(this.destino.latitud, this.destino.longitud)
        }
      ]);
      this.ruta.emit(this.routeControl);
    }
  }

  marcarRutas() {
    console.log("Longitud de Ubicaciones", this.ubicaciones.length);
    if (this.ubicaciones.length > 1) {
      let puntos = [];
      for (let ub of this.ubicaciones) {
        puntos.push({
          name: ub.nombre,
          latLng: this.getLatLng(ub.latitud, ub.longitud)
        });
      }
      console.log("Puntos a marcar", puntos);

      this.routeControl = L.Routing.control({
        router: new L.Routing.OSRMv1({
          serviceUrl: 'http://192.168.10.190:5000/route/v1'
        }),
        //autoRoute: false,
        //show: false,
        waypoints: [],

        plan: new L.Routing.Plan(puntos, {
          addWaypoints: false,
          draggableWaypoints: false
        }),
        lineOptions: {
          addWaypoints: false
        },
        language: 'es',
      });
      this.routeControl.addTo(this.map);
    } else {
      console.log("Sin Ubicaciones");

    }
  }

  actualizarRutas() {
    if (this.ubicaciones.length > 1) {
      let puntos = [];
      for (let ub of this.ubicaciones) {
        puntos.push({
          name: ub.nombre,
          latLng: this.getLatLng(ub.latitud, ub.longitud)
        });
      }

      this.routeControl.setWaypoints(puntos);
      this.ruta.emit(this.routeControl);
    }
  }

  getLatLng(lat: number, lng: number) {
    return L.latLng(lat, lng);
  }

  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resp => {
        resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
      },
        err => {
          reject(err);
        });
    });
  }

}
