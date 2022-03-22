import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspeccionIngresoVehiculosComponent } from './inspeccion-ingreso-vehiculos.component';

describe('InspeccionIngresoVehiculosComponent', () => {
  let component: InspeccionIngresoVehiculosComponent;
  let fixture: ComponentFixture<InspeccionIngresoVehiculosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspeccionIngresoVehiculosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InspeccionIngresoVehiculosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
