import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabezalComponent } from './cabezal.component';

describe('CabezalComponent', () => {
  let component: CabezalComponent;
  let fixture: ComponentFixture<CabezalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CabezalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CabezalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
