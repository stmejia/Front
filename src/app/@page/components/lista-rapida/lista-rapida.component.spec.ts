import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaRapidaComponent } from './lista-rapida.component';

describe('ListaRapidaComponent', () => {
  let component: ListaRapidaComponent;
  let fixture: ComponentFixture<ListaRapidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaRapidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaRapidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
