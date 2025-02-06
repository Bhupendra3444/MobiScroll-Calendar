import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/utils/calendar";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth }: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-calendar-header text-white">
      <button
        onClick={onPrevMonth}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h2 className="text-xl font-semibold">{formatDate(currentDate)}</h2>
      <button
        onClick={onNextMonth}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CalendarHeader;