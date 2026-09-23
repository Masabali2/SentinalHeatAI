import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayrollDashboard } from './payroll-dashboard';

describe('PayrollDashboard', () => {
  let component: PayrollDashboard;
  let fixture: ComponentFixture<PayrollDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(PayrollDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
