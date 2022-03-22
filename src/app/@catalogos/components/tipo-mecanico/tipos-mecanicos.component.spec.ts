import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposMecanicosComponent } from './tipos-mecanicos.component';

describe('TiposMecanicosComponent', () => {
  let component: TiposMecanicosComponent;
  let fixture: ComponentFixture<TiposMecanicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiposMecanicosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposMecanicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
