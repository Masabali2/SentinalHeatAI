import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayrollForm } from './payroll-form';

describe('PayrollForm', () => {
  let component: PayrollForm;
  let fixture: ComponentFixture<PayrollForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PayrollForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
