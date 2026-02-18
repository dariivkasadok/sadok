import { useState } from "react";
import Navbar from "@/components/Navbar";
import InstitutionCard from "@/components/InstitutionCard";
import StatsSection from "@/components/StatsSection";
import CalendarSection from "@/components/CalendarSection";
import { useStats } from "@/hooks/useStats";

const Index = () => {
  const [year, setYear] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
  });
  const { data: stats } = useStats(year);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto space-y-6 px-6 py-8">
        <InstitutionCard />
        <StatsSection
          year={year}
          onYearChange={setYear}
          stats={stats ?? { total: 0, girls: 0, boys: 0, groups: 0, teachers: 0 }}
        />
        <CalendarSection />
      </main>
    </div>
  );
};

export default Index;
