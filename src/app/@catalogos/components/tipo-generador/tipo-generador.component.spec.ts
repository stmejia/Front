import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoGeneradorComponent } from './tipo-generador.component';

describe('TipoGeneradorComponent', () => {
  let component: TipoGeneradorComponent;
  let fixture: ComponentFixture<TipoGeneradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoGeneradorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoGeneradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
