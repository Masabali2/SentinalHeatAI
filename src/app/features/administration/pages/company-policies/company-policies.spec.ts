import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyPolicies } from './company-policies';

describe('CompanyPolicies', () => {
  let component: CompanyPolicies;
  let fixture: ComponentFixture<CompanyPolicies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyPolicies],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyPolicies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
