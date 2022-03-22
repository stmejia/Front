import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PilotoTipoComponent } from './piloto-tipo.component';

describe('PilotoTipoComponent', () => {
  let component: PilotoTipoComponent;
  let fixture: ComponentFixture<PilotoTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PilotoTipoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PilotoTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
