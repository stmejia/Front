import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'caracterUtf8'
})
export class CaracterUtf8Pipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    let textoConvertir = value;
    //textoConvertir = textoConvertir.replace("/p&gt;", '');
    let texto = decodeURIComponent(escape(textoConvertir));
    return texto;
  }

}
