import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoActivoComponent } from './tipo-activo.component';

describe('TipoActivoComponent', () => {
  let component: TipoActivoComponent;
  let fixture: ComponentFixture<TipoActivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoActivoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoActivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
