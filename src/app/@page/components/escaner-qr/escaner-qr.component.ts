import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BarcodeFormat } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';
import { QRDataModal } from '../../models/modal';
import { SweetService } from '../../services/sweet.service';

@Component({
  selector: 'app-escaner-qr',
  templateUrl: './escaner-qr.component.html',
  styleUrls: ['./escaner-qr.component.css']
})
export class EscanerQRComponent implements OnInit {

  allowedFormats = [BarcodeFormat.QR_CODE];
  availableDevices: MediaDeviceInfo[];
  hasDevices: boolean;
  currentDevice: MediaDeviceInfo = null;
  torchEnabled = false;
  hasPermission = new BehaviorSubject<boolean>(true);
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  reintentar: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: QRDataModal, public dialogRef: MatDialogRef<EscanerQRComponent>,
    private sw: SweetService) { }

  ngOnInit(): void {
  }

  codigoEscaneado(evento: any) {
    try {
      let dato = JSON.parse(evento);
      if (dato['td']) {
        if (dato['td'] == this.data.controlador) {
          return this.dialogRef.close(dato[this.data.campo]);
        } else {
          this.reintentar = true;
          return this.sw.sweet_notificacion("QR No Valido (1)", 5000, 'error');
        }
      } else {
        this.reintentar = true;
        return this.sw.sweet_notificacion("QR No Valido (2)", 5000, 'error');
      }
    } catch (error) {
      this.reintentar = true;
      return this.sw.sweet_notificacion("QR No Valido (3)", 5000, 'error');
    }
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onDeviceSelectChange(selected: string) {
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.currentDevice = device || null;
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  onHasPermission(has: boolean) {
    this.hasPermission.next(has);
  }

  dataValido(): boolean {
    if (this.data) {
      if (this.data.controlador) {
        return true;
      }
    }
    return false;
  }
}
