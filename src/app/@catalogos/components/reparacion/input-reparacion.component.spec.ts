import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputReparacionComponent } from './input-reparacion.component';

describe('InputReparacionComponent', () => {
  let component: InputReparacionComponent;
  let fixture: ComponentFixture<InputReparacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputReparacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputReparacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
