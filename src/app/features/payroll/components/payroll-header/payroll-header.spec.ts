import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayrollHeader } from './payroll-header';

describe('PayrollHeader', () => {
  let component: PayrollHeader;
  let fixture: ComponentFixture<PayrollHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(PayrollHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
