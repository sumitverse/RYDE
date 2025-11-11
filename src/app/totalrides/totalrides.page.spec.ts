import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TotalridesPage } from './totalrides.page';

describe('TotalridesPage', () => {
  let component: TotalridesPage;
  let fixture: ComponentFixture<TotalridesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalridesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
