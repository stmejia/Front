import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscanerQRComponent } from './escaner-qr.component';

describe('EscanerQRComponent', () => {
  let component: EscanerQRComponent;
  let fixture: ComponentFixture<EscanerQRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EscanerQRComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EscanerQRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
