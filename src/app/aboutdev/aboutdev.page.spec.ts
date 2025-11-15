import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutdevPage } from './aboutdev.page';

describe('AboutdevPage', () => {
  let component: AboutdevPage;
  let fixture: ComponentFixture<AboutdevPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutdevPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
