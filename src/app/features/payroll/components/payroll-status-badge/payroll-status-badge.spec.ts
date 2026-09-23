import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayrollStatusBadge } from './payroll-status-badge';

describe('PayrollStatusBadge', () => {
  let component: PayrollStatusBadge;
  let fixture: ComponentFixture<PayrollStatusBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollStatusBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(PayrollStatusBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
