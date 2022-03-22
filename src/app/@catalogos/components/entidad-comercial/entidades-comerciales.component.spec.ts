import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntidadesComercialesComponent } from './entidades-comerciales.component';

describe('EntidadesComercialesComponent', () => {
  let component: EntidadesComercialesComponent;
  let fixture: ComponentFixture<EntidadesComercialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntidadesComercialesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntidadesComercialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
