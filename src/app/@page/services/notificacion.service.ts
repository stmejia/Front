import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {


  constructor(
    public snackBar: MatSnackBar,
    private zone: NgZone) { }

  showError(message: string): void {
    this.zone.run(() => {
      // The second parameter is the text in the button. 
      // In the third, we send in the css class for the snack bar.
      this.snackBar.open(message, 'X', { panelClass: ['error'] });
    });
  }

}
