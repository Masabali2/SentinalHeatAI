import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllowanceForm } from './allowance-form';

describe('AllowanceForm', () => {
  let component: AllowanceForm;
  let fixture: ComponentFixture<AllowanceForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllowanceForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AllowanceForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
