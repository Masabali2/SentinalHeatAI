import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCollaborators } from './task-collaborators';

describe('TaskCollaborators', () => {
  let component: TaskCollaborators;
  let fixture: ComponentFixture<TaskCollaborators>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCollaborators],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCollaborators);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
