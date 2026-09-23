import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeductionForm } from './deduction-form';

describe('DeductionForm', () => {
  let component: DeductionForm;
  let fixture: ComponentFixture<DeductionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeductionForm],
    }).compileComponents();

    fixture = TestBed.createComponent(DeductionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
