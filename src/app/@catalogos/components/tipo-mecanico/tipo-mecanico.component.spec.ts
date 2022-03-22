import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoMecanicoComponent } from './tipo-mecanico.component';

describe('TipoMecanicoComponent', () => {
  let component: TipoMecanicoComponent;
  let fixture: ComponentFixture<TipoMecanicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoMecanicoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoMecanicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
