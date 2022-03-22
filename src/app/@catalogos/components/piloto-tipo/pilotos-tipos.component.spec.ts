import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PilotosTiposComponent } from './pilotos-tipos.component';

describe('PilotosTiposComponent', () => {
  let component: PilotosTiposComponent;
  let fixture: ComponentFixture<PilotosTiposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PilotosTiposComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PilotosTiposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
