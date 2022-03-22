// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  hmr: false,
  //UrlAguilaApi: 'https://localhost:44328'
  //UrlAguilaApi: 'https://srvdev1:443/AguilaApi',
  UrlAguilaApi: 'https://192.168.1.17/AguilaApi', //Desarrollo
  //UrlAguilaApi: 'https://192.168.1.17:4600/AguilaApi', //Produccion Para Pruebas
  UrlGlpi: 'https://www.sacsa-ca.com/api_test',
  formatoFecha: "MM/DD/YYYY",
  formatoFechaHora: "MM/DD/YYYY HH:mm:ss"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
