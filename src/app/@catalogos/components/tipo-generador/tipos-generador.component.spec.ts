import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposGeneradorComponent } from './tipos-generador.component';

describe('TiposGeneradorComponent', () => {
  let component: TiposGeneradorComponent;
  let fixture: ComponentFixture<TiposGeneradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiposGeneradorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposGeneradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
