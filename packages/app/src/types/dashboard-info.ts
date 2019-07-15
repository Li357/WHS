export interface DashboardInfo {
  title: string;
  subtitle: string;
  name: string;
}

export type DashboardInfoGetter = () => DashboardInfo;
