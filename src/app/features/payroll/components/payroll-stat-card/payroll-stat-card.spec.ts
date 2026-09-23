import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayrollStatCard } from './payroll-stat-card';

describe('PayrollStatCard', () => {
  let component: PayrollStatCard;
  let fixture: ComponentFixture<PayrollStatCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollStatCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PayrollStatCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
