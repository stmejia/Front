import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoListaComponent } from './tipo-lista.component';

describe('TipoListaComponent', () => {
  let component: TipoListaComponent;
  let fixture: ComponentFixture<TipoListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoListaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
