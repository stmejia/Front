import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'fecha'
})

export class FechaPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    let formato = "DD/MM/YYYY"

    if (args.length > 0) {
      if (typeof args[0] == "string") {
        formato = args[0].toString();
        return moment(value).isValid() ? moment(value).format(formato) : "";
      }
    }

    return moment(value).isValid() ? moment(value).format(formato) : "";
  }

}
