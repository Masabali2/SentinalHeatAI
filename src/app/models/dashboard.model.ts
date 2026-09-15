export interface Dashboard {
  statistics: DashboardStat[];
  priorityWork: DashboardTableRow[];
  charts: DashboardChart[];
  recentActivities: DashboardActivity[];
  quickActions: DashboardAction[];
}

export interface DashboardStat {
  key: string;
  title: string;
  value: number;
  description?: string | null;
}

export interface DashboardTableRow {
  id: string;
  name: string;
  department: string;
  designation: string;
  status: string;
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

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardAction {
  key: string;
  label: string;
  route: string;
  permission?: string | null;
}