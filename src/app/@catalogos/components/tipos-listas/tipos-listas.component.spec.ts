import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposListasComponent } from './tipos-listas.component';

describe('TiposListasComponent', () => {
  let component: TiposListasComponent;
  let fixture: ComponentFixture<TiposListasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiposListasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposListasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
