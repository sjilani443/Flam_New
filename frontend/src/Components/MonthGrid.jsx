import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek
} from 'date-fns';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthGrid({ currentMonth, events, onDayClick, onEventClick, onEventDrag }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Split days into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Get events for a specific day
  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, day);
    });
  };

  const handleDragStart = (e, event) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(event));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetDay) => {
    e.preventDefault();
    const eventData = JSON.parse(e.dataTransfer.getData('text/plain'));
    onEventDrag(eventData, targetDay);
  };

  const renderEvents = (dayEvents, day) => {
    return (
      <div 
        className="events-container"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, day)}
      >
        {dayEvents.map((event) => (
          <div
            key={event.id}
            className={`event-item ${event.color}`}
            draggable
            onDragStart={(e) => handleDragStart(e, event)}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
          >
            <div className="event-time">
              {format(parseISO(event.date), 'h:mm a')}
            </div>
            <div className="event-title">{event.title}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="calendar-grid-container">
      <div className="weekday-header">
        {weekDays.map(day => (
          <div key={day} className="weekday-cell">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-week">
            {week.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`day-cell ${isCurrentDay ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                  onClick={() => onDayClick(day)}
                >
                  <div className="day-number">{format(day, 'd')}</div>
                  {renderEvents(dayEvents, day)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
