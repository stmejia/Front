import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputCodeAguilaComponent } from './input-code-aguila.component';

describe('InputCodeAguilaComponent', () => {
  let component: InputCodeAguilaComponent;
  let fixture: ComponentFixture<InputCodeAguilaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputCodeAguilaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputCodeAguilaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
