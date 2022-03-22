import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAusenciasComponent } from './reporte-ausencias.component';

describe('ReporteAusenciasComponent', () => {
  let component: ReporteAusenciasComponent;
  let fixture: ComponentFixture<ReporteAusenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteAusenciasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteAusenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
