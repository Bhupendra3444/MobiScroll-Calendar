import { useState } from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import { Resource } from "@/types/calendar";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const resources: Resource[] = [
    { id: "A", title: "Resource A" },
    { id: "B", title: "Resource B" },
    { id: "C", title: "Resource C" },
    { id: "D", title: "Resource D" },
    { id: "E", title: "Resource E" },
    { id: "F", title: "Resource F" },
    { id: "G", title: "Resource G" },
    { id: "H", title: "Resource H" },
    { id: "I", title: "Resource I" },
    { id: "J", title: "Resource J" },
    { id: "K", title: "Resource K" },
    { id: "L", title: "Resource L" },
    { id: "M", title: "Resource M" },
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <CalendarGrid currentDate={currentDate} resources={resources} />
    </div>
  );
};

export default Calendar;