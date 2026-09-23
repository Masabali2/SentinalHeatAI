import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayrollFilter } from './payroll-filter';

describe('PayrollFilter', () => {
  let component: PayrollFilter;
  let fixture: ComponentFixture<PayrollFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(PayrollFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
