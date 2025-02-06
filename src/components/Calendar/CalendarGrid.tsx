import React, { useEffect, useState, useRef } from "react";
import { CalendarEvent, Resource } from "@/types/calendar";
import { getDaysInMonth, isToday } from "@/utils/calendar";
import { getRandomColor } from "@/utils/calendar";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CalendarGridProps {
  currentDate: Date;
  resources: Resource[];
}

const CalendarGrid = ({ currentDate, resources }: CalendarGridProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const stored = localStorage.getItem('calendar-events');
    if (stored) {
      const parsedEvents = JSON.parse(stored);
      return parsedEvents.map((event: CalendarEvent) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
    }
    return [];
  });
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [resizingEvent, setResizingEvent] = useState<{
    event: CalendarEvent;
    edge: 'start' | 'end';
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const days = getDaysInMonth(currentDate);

  useEffect(() => {
    const eventsForStorage = events.map(event => ({
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString()
    }));
    localStorage.setItem('calendar-events', JSON.stringify(eventsForStorage));
  }, [events]);

  const handleDayClick = (date: Date, resourceId: string) => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Event ${events.length + 1}`,
      start: startDate,
      end: endDate,
      resourceId,
      color: getRandomColor(),
      startTime: "00:00",
      endTime: "23:59"
    };
    setEvents([...events, newEvent]);
  };

  const handleDeleteClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedEventId) {
      setEvents(events.filter(event => event.id !== selectedEventId));
      setShowDeleteDialog(false);
      setSelectedEventId(null);
    }
  };

  const handleResizeStart = (event: CalendarEvent, edge: 'start' | 'end', e: React.MouseEvent) => {
    e.stopPropagation();
    setResizingEvent({ event, edge });
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;
      
      const gridRect = gridRef.current.getBoundingClientRect();
      const cellWidth = gridRect.width / days.length;
      const dayIndex = Math.floor((e.clientX - gridRect.left) / cellWidth);
      
      if (dayIndex >= 0 && dayIndex < days.length) {
        const cellLeft = gridRect.left + (dayIndex * cellWidth);
        const positionInCell = e.clientX - cellLeft;
        const percentageInDay = Math.max(0, Math.min(100, (positionInCell / cellWidth) * 100));
        
        const totalMinutes = Math.round((percentageInDay / 100) * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        const newDate = new Date(days[dayIndex]);
        newDate.setHours(hours, minutes, 0, 0);
        
        setEvents(prevEvents =>
          prevEvents.map(evt => {
            if (evt.id === event.id) {
              if (edge === 'start') {
                return {
                  ...evt,
                  start: newDate,
                  startTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
                };
              } else {
                return {
                  ...evt,
                  end: newDate,
                  endTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
                };
              }
            }
            return evt;
          })
        );
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setResizingEvent(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent) => {
    if (resizingEvent) return; // Prevent drag if resizing
    e.dataTransfer.setData('text/plain', '');
    setDraggedEvent({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    });
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (date: Date, resourceId: string) => {
    if (draggedEvent) {
      const timeDiff = draggedEvent.end.getTime() - draggedEvent.start.getTime();
      const newStart = new Date(date);
      const newEnd = new Date(newStart.getTime() + timeDiff);
      
      setEvents(events.map(event => 
        event.id === draggedEvent.id 
          ? { ...event, start: newStart, end: newEnd, resourceId }
          : event
      ));
      setDraggedEvent(null);
      setIsDragging(false);
    }
  };

  const calculateEventStyle = (event: CalendarEvent, day: Date) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const dayStart = new Date(day);
    const dayEnd = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    dayEnd.setHours(23, 59, 59, 999);

    let startPercent = 0;
    if (eventStart >= dayStart && eventStart <= dayEnd) {
      const minutesSinceStartOfDay = (eventStart.getHours() * 60) + eventStart.getMinutes();
      startPercent = (minutesSinceStartOfDay / (24 * 60)) * 100;
    }

    let endPercent = 100;
    if (eventEnd >= dayStart && eventEnd <= dayEnd) {
      const minutesSinceStartOfDay = (eventEnd.getHours() * 60) + eventEnd.getMinutes();
      endPercent = (minutesSinceStartOfDay / (24 * 60)) * 100;
    }

    return {
      left: `${startPercent}%`,
      width: `${endPercent - startPercent}%`,
    };
  };

  const isEventInDay = (event: CalendarEvent, day: Date) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const dayStart = new Date(day);
    const dayEnd = new Date(day);
    
    dayStart.setHours(0, 0, 0, 0);
    dayEnd.setHours(23, 59, 59, 999);
    
    return eventStart <= dayEnd && eventEnd >= dayStart;
  };

  const isEventStart = (event: CalendarEvent, day: Date) => {
    const eventStart = new Date(event.start);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    return eventStart >= dayStart && eventStart <= dayEnd;
  };

  return (
    <div className="grid grid-cols-[200px_1fr] flex-1 overflow-auto border-t border-gray-200">
      <div className="bg-white border-r border-gray-200">
        <div className="h-10 border-b border-gray-200"></div>
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="px-4 py-2 border-b border-gray-200 h-20 flex items-center"
          >
            {resource.title}
          </div>
        ))}
      </div>

      <div className="flex-1" ref={gridRef}>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(150px, 1fr))` }}>
          {days.map((day) => (
            <div
              key={day.getTime()}
              className="z-0 h-10 px-2 flex flex-col items-center justify-center border-b border-r border-gray-200 text-sm"
            >
              <span className="font-medium">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span>{day.getDate()}</span>
            </div>
          ))}

          {resources.map((resource) => (
            <React.Fragment key={resource.id}>
              {days.map((day) => (
                <div
                  key={`${resource.id}-${day.getTime()}`}
                  className={`h-20 border-b border-r border-gray-200 p-1 relative ${
                    isToday(day) ? 'bg-blue-50' : 'bg-white'
                  }`}
                  onDoubleClick={() => handleDayClick(day, resource.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(day, resource.id)}
                >
                  {events
                    .filter(event => event.resourceId === resource.id && isEventInDay(event, day))
                    .map((event) => {
                      const style = calculateEventStyle(event, day);
                      
                      return (
                        <div
                          key={event.id}
                          className="absolute text-xs p-1 mb-1 rounded shadow-sm group cursor-move"
                          style={{
                            ...style,
                            backgroundColor: event.color,
                            opacity: 0.9,
                            top: '0',
                            height: '100%',
                            zIndex: isDragging ? 30 : 20
                          }}
                          draggable={!resizingEvent}
                          onDragStart={(e) => handleDragStart(event, e)}
                        >
                          {isEventStart(event, day) && (
                            <>
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-[10px] truncate">
                                {event.startTime} - {event.endTime}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(event.id);
                                }}
                                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-500" />
                              </button>
                            </>
                          )}
                          <div
                            className="absolute left-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/10 rounded-l"
                            onMouseDown={(e) => handleResizeStart(event, 'start', e)}
                          />
                          <div
                            className="absolute right-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/10 rounded-r"
                            onMouseDown={(e) => handleResizeStart(event, 'end', e)}
                          />
                        </div>
                      );
                    })}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarGrid;
