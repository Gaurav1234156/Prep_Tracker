import {
  Layers,
  Building2,
  TrendingUp,
  BarChart2,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";

export const ANALYTICS_TABS = [
  { href: "/admin/analytics", label: "Overview", icon: BarChart2 },
  { href: "/admin/analytics/topics", label: "Topics", icon: Layers },
  { href: "/admin/analytics/companies", label: "Companies", icon: Building2 },
  { href: "/admin/analytics/role-levels", label: "Role Levels", icon: GraduationCap },
  { href: "/admin/analytics/coverage-gaps", label: "Coverage Gaps", icon: AlertTriangle },
  { href: "/admin/analytics/trends", label: "Trends", icon: TrendingUp },
];
