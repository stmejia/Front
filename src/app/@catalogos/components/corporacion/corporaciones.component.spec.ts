import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporacionesComponent } from './corporaciones.component';

describe('CorporacionesComponent', () => {
  let component: CorporacionesComponent;
  let fixture: ComponentFixture<CorporacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorporacionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorporacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
