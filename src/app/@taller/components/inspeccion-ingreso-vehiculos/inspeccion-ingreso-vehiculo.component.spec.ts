import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspeccionIngresoVehiculoComponent } from './inspeccion-ingreso-vehiculo.component';

describe('InspeccionIngresoVehiculoComponent', () => {
  let component: InspeccionIngresoVehiculoComponent;
  let fixture: ComponentFixture<InspeccionIngresoVehiculoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspeccionIngresoVehiculoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InspeccionIngresoVehiculoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
