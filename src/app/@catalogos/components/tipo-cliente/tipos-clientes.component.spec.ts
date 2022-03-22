import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposClientesComponent } from './tipos-clientes.component';

describe('TiposClientesComponent', () => {
  let component: TiposClientesComponent;
  let fixture: ComponentFixture<TiposClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiposClientesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
