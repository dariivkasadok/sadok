import { Users, Home, UserCheck, Venus, Mars } from "lucide-react";
import { useAcademicYears } from "@/hooks/useAcademicYears";

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const StatCard = ({ icon, value, label, bgClass, borderClass, textClass }: StatCardProps) =>
<div className={`rounded-xl border-2 ${bgClass} ${borderClass} p-5`}>
    <div className={`mb-2 ${textClass}`}>{icon}</div>
    <p className={`text-4xl font-extrabold ${textClass}`}>{value}</p>
    <p className={`mt-1 text-sm font-semibold ${textClass}`}>{label}</p>
  </div>;


interface StatsData {
  total: number;
  girls: number;
  boys: number;
  groups: number;
  teachers: number;
}

interface StatsSectionProps {
  year: string;
  onYearChange: (year: string) => void;
  stats: StatsData;
}

const StatsSection = ({ year, onYearChange, stats }: StatsSectionProps) => {
  const { data: years = [] } = useAcademicYears();

  return (
    <div className="rounded-2xl bg-card p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-foreground">Навчальний рік</h2>
        <select
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className="rounded-lg border bg-card px-4 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring">

          {years.map((y) =>
          <option key={y} value={y}>
              {y}
            </option>
          )}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={<Users className="h-6 w-6" />}
          value={stats.total}
          label="Всього дітей"
          bgClass="bg-stat-purple"
          borderClass="border-stat-purple-border"
          textClass="text-stat-purple-text" />

        <StatCard
          icon={<Venus className="h-6 w-6" />}
          value={stats.girls}
          label="Дівчаток"
          bgClass="bg-stat-pink"
          borderClass="border-stat-pink-border"
          textClass="text-stat-pink-text" />

        <StatCard
          icon={<Mars className="h-6 w-6" />}
          value={stats.boys}
          label="Хлопчиків"
          bgClass="bg-stat-blue"
          borderClass="border-stat-blue-border"
          textClass="text-stat-blue-text" />

        <StatCard
          icon={<Home className="h-6 w-6" />}
          value={stats.groups}
          label="Груп"
          bgClass="bg-stat-green"
          borderClass="border-stat-green-border"
          textClass="text-stat-green-text" />

        <StatCard
          icon={<UserCheck className="h-6 w-6" />}
          value={stats.teachers}
          label="Вихователів"
          bgClass="bg-stat-yellow"
          borderClass="border-stat-yellow-border"
          textClass="text-stat-yellow-text" />

      </div>
    </div>);

};

export default StatsSection;