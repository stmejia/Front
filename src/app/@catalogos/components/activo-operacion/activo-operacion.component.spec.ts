import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivoOperacionComponent } from './activo-operacion.component';

describe('ActivoOperacionComponent', () => {
  let component: ActivoOperacionComponent;
  let fixture: ComponentFixture<ActivoOperacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivoOperacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivoOperacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
