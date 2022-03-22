import { AuthService } from './../@aguila/security/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ITEMS_MENU_PUBLIC } from './public-menu';
import { ConfigService } from '../@aguila/data/services/config.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.css']
})
export class PublicComponent implements OnInit {

  menuItems = ITEMS_MENU_PUBLIC;
  cargando: boolean = true;

  constructor(private authService: AuthService, private configService: ConfigService) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.setAuthenticatedUser(this.authService.token).subscribe(res => {
        this.configService.regresar();
      }, (error) => {
        console.log(error);
        this.authService.logout();
        this.cargando = false;
      })
    }else{
      this.cargando = false;
    }
  }

}
