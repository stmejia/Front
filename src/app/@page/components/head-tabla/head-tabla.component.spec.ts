import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadTablaComponent } from './head-tabla.component';

describe('HeadTablaComponent', () => {
  let component: HeadTablaComponent;
  let fixture: ComponentFixture<HeadTablaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeadTablaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadTablaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
