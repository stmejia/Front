import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaAguilaComponent } from './tabla-aguila.component';

describe('TablaAguilaComponent', () => {
  let component: TablaAguilaComponent;
  let fixture: ComponentFixture<TablaAguilaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablaAguilaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablaAguilaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
