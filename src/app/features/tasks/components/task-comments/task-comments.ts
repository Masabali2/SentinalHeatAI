import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { PermissionService } from '../../../../core/authorization/permission.service';
import { PERMISSIONS } from '../../../../core/authorization/permission.constants';
import { EmployeeTaskService } from '../../../../core/services/employee-task.service';

import {
  AddTaskCommentRequest,
  EmployeeTask,
  EmployeeTaskComment
} from '../../../../models/task.model';

@Component({
  selector: 'app-task-comments',
  imports: [DatePipe],
  templateUrl: './task-comments.html',
  styleUrl: './task-comments.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskComments implements OnInit {
  private readonly taskService = inject(EmployeeTaskService);
  private readonly permissionService = inject(PermissionService);

  readonly task = input.required<EmployeeTask>();

  readonly comments = signal<EmployeeTaskComment[]>([]);
  readonly isLoading = signal(false);
  readonly isAdding = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly commentText = signal('');

  readonly canViewComments = computed(() =>
    this.permissionService.hasPermission(
      PERMISSIONS.Task.CommentView
    )
  );

  readonly canAddComment = computed(() =>
    this.permissionService.hasPermission(
      PERMISSIONS.Task.CommentAdd
    )
  );

  ngOnInit(): void {
    if (this.canViewComments()) {
      this.loadComments();
    }
  }

  loadComments(): void {
    if (!this.canViewComments()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskService
      .getComments(this.task().id)
      .subscribe({
        next: comments => {
          this.comments.set(comments);
          this.isLoading.set(false);
        },
        error: error => {
          this.comments.set([]);
          this.isLoading.set(false);
          this.errorMessage.set(
            error?.error?.message ?? 'Unable to load comments.'
          );
        }
      });
  }

  onCommentChange(value: string): void {
    this.commentText.set(value);
  }

  addComment(): void {
    if (!this.canAddComment()) {
      return;
    }

    const comment = this.commentText().trim();

    if (!this.task().isActive || this.isAdding()) {
      return;
    }

    if (!comment) {
      this.errorMessage.set('Please enter a comment.');
      return;
    }

    const request: AddTaskCommentRequest = {
      comment
    };

    this.isAdding.set(true);
    this.errorMessage.set(null);

    this.taskService
      .addComment(this.task().id, request)
      .subscribe({
        next: createdComment => {
          if (this.canViewComments()) {
            this.comments.update(comments => [
              ...comments,
              createdComment
            ]);
          }

          this.commentText.set('');
          this.isAdding.set(false);
        },
        error: error => {
          this.isAdding.set(false);
          this.errorMessage.set(
            error?.error?.message ?? 'Unable to add comment.'
          );
        }
      });
  }

  formatCommentDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date));
  }
}