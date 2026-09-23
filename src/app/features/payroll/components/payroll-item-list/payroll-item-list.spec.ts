import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayrollItemList } from './payroll-item-list';

describe('PayrollItemList', () => {
  let component: PayrollItemList;
  let fixture: ComponentFixture<PayrollItemList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollItemList],
    }).compileComponents();

    fixture = TestBed.createComponent(PayrollItemList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
