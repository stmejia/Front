import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposProveedoresComponent } from './tipos-proveedores.component';

describe('TiposProveedoresComponent', () => {
  let component: TiposProveedoresComponent;
  let fixture: ComponentFixture<TiposProveedoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiposProveedoresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposProveedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
