import { NavigationItem } from './authorization.models';
import { PERMISSIONS } from './permission.constants';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    route: '/',
    icon: '▦'
  },
  {
    label: 'Employees',
    route: '/employees',
    icon: '👥',
    permission: PERMISSIONS.Employee.View
  },
  {
    label: 'Departments',
    route: '/departments',
    icon: '▣',
    permission: PERMISSIONS.Department.View
  },
  {
    label: 'Designations',
    route: '/designations',
    icon: '◆',
    permission: PERMISSIONS.Designation.View
  },
  {
    label: 'Hiring',
    route: '/hiring',
    icon: '＋',
    permission: PERMISSIONS.Employee.Invite
  },
  {
    label: 'Tasks',
    route: '/tasks',
    icon: '✓',
    permission: PERMISSIONS.Task.View
  },
 {
  label: 'Payroll',
  route: '/payroll',
  icon: '$',
  permission: PERMISSIONS.Payroll.View
},
  {
    label: 'Administration',
    route: '/administration/dashboard',
    icon: '⚙',
    permission: PERMISSIONS.User.View
  }
];