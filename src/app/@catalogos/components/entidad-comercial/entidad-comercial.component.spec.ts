import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntidadComercialComponent } from './entidad-comercial.component';

describe('EntidadComercialComponent', () => {
  let component: EntidadComercialComponent;
  let fixture: ComponentFixture<EntidadComercialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntidadComercialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntidadComercialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
