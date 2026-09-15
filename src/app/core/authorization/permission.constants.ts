export const PERMISSIONS = {
  Employee: {
    View: 'Employee.View',
    Create: 'Employee.Create',
    Update: 'Employee.Update',
    Delete: 'Employee.Delete',
    ProfileView: 'Employee.Profile.View',
    ProfileUpdate: 'Employee.Profile.Update',
    Invite: 'Employee.Invite'
  },

  Attendance: {
    View: 'Attendance.View',
    Manage: 'Attendance.Manage'
  },

  Leave: {
    View: 'Leave.View',
    Create: 'Leave.Create',
    Approve: 'Leave.Approve',
    Reject: 'Leave.Reject'
  },

  Task: {
    View: 'Task.View',
    Create: 'Task.Create',
    Update: 'Task.Update',
    Delete: 'Task.Delete',
    Assign: 'Task.Assign',
    Reassign: 'Task.Reassign',
    StatusUpdate: 'Task.StatusUpdate',
    Activate: 'Task.Activate',
    Deactivate: 'Task.Deactivate',
    CollaboratorManage: 'Task.Collaborator.Manage',
    CommentAdd: 'Task.Comment.Add',
    CommentView: 'Task.Comment.View',
    HistoryView: 'Task.History.View'
  },

  Permission: {
    View: 'Permission.View',
    Create: 'Permission.Create',
    Update: 'Permission.Update',
    Delete: 'Permission.Delete'
  },

  Role: {
    View: 'Role.View',
    Create: 'Role.Create',
    Update: 'Role.Update',
    Delete: 'Role.Delete',
    PermissionManage: 'Role.PermissionManage',
    Manage: 'Role.Manage'
  },

  Payroll: {
    View: 'Payroll.View',
    Manage: 'Payroll.Manage'
  },

  User: {
    View: 'User.View',
    Manage: 'User.Manage'
  },

  Department: {
    View: 'Department.View',
    Create: 'Department.Create',
    Update: 'Department.Update',
    Delete: 'Department.Delete'
  },

  Designation: {
    View: 'Designation.View',
    Create: 'Designation.Create',
    Update: 'Designation.Update',
    Delete: 'Designation.Delete'
  }
} as const;