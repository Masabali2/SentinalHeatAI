export interface Dashboard {

  statistics: DashboardStat[];

  priorityWork: DashboardTableRow[];

  charts: DashboardChart[];

 upcomingEvents: UpcomingEvent[];

  quickActions: DashboardAction[];

  activeEmployees: ActiveEmployee[];

}

export interface DashboardStat {

  key: string;

  title: string;

  value: number;

  description?: string | null;

}
export interface DashboardTableRow {
  id: string;
  onboardingId?: string | null;
  type: string;
  name: string;
  department: string;
  designation: string;
  status: string;
  priority: string;
  actionLabel: string;
  route: string;
}

export interface DashboardChart {

  key: string;

  title: string;

  type: string;

  data: DashboardChartData[];

}

export interface DashboardChartData {

  label: string;

  value: number;

}

export interface UpcomingEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  route: string;
}

export interface DashboardAction {

  key: string;

  label: string;

  route: string;

  permission?: string | null;

}

export interface ActiveEmployee {

  id: number;

  name: string;

  email: string;

  department: string;

  designation: string;

  role: string;

  isActive: boolean;

  createdAt: string;

}