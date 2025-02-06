export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  color?: string;
  startTime?: string;
  endTime?: string;
}

export interface Resource {
  id: string;
  title: string;
}

export interface DayCell {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
}