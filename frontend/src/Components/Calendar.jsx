import React, { useState, useEffect } from 'react';
import {
  addMonths, subMonths, format,
  startOfMonth, endOfMonth, addDays,
  parseISO, getDay, getDate, eachDayOfInterval, isSameMonth, isToday
} from 'date-fns';
import MonthGrid from './MonthGrid';
import EventModal from './EventModal';
import '../styles/calendar.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Simple ID generator
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('calendarEvents');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    setSelectedEvent(event);
    setSelectedDate(new Date(event.date));
    setShowModal(true);
  };

  const checkEventConflict = (newEvent) => {
    const eventDate = new Date(newEvent.date);
    const eventTime = eventDate.getHours() * 60 + eventDate.getMinutes();
    const eventDuration = 60; // Default duration in minutes

    return events.some(event => {
      if (event.id === newEvent.id) return false; // Skip the event being edited
      
      const existingDate = new Date(event.date);
      if (existingDate.toDateString() !== eventDate.toDateString()) return false;

      const existingTime = existingDate.getHours() * 60 + existingDate.getMinutes();
      const existingDuration = 60; // Default duration in minutes

      return (
        (eventTime >= existingTime && eventTime < existingTime + existingDuration) ||
        (existingTime >= eventTime && existingTime < eventTime + eventDuration)
      );
    });
  };

  const handleSaveEvent = (eventData) => {
    if (checkEventConflict(eventData)) {
      alert('This time slot conflicts with an existing event!');
      return;
    }

    let updatedEvents;
    if (selectedEvent) {
      // If it's a recurring event, update all related events
      if (selectedEvent.isRecurring) {
        updatedEvents = events.map(event => 
          event.originalEventId === selectedEvent.originalEventId || event.id === selectedEvent.id
            ? { ...eventData, id: event.id, originalEventId: event.originalEventId }
            : event
        );
      } else {
        // Update single event
        updatedEvents = events.map(event => 
          event.id === selectedEvent.id ? { ...eventData, id: event.id } : event
        );
      }
    } else {
      // Create new event
      const newEvent = { ...eventData, id: generateId() };
      
      // Handle recurring events
      if (eventData.recurrence !== 'none') {
        const recurringEvents = generateRecurringEvents(newEvent);
        updatedEvents = [...events, ...recurringEvents];
      } else {
        updatedEvents = [...events, newEvent];
      }
    }

    setEvents(updatedEvents);
    setShowModal(false);
  };

  const generateRecurringEvents = (eventData) => {
    const recurringEvents = [];
    const startDate = new Date(eventData.date);
    const endDate = new Date(currentMonth);
    endDate.setMonth(endDate.getMonth() + 3); // Generate events for next 3 months

    switch (eventData.recurrence) {
      case 'daily':
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          recurringEvents.push({
            ...eventData,
            id: generateId(),
            date: new Date(date).toISOString(),
            isRecurring: true,
            originalEventId: eventData.id
          });
        }
        break;

      case 'weekly':
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          if (date.getDay() === startDate.getDay()) {
            recurringEvents.push({
              ...eventData,
              id: generateId(),
              date: new Date(date).toISOString(),
              isRecurring: true,
              originalEventId: eventData.id
            });
          }
        }
        break;

      case 'monthly':
        for (let date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
          recurringEvents.push({
            ...eventData,
            id: generateId(),
            date: new Date(date).toISOString(),
            isRecurring: true,
            originalEventId: eventData.id
          });
        }
        break;
    }

    return recurringEvents;
  };

  const handleDeleteEvent = (eventId, deleteAll = false) => {
    const eventToDelete = events.find(event => event.id === eventId);
    
    let updatedEvents;
    if (deleteAll && eventToDelete.isRecurring) {
      // Delete all related recurring events
      updatedEvents = events.filter(event => 
        event.originalEventId !== eventToDelete.originalEventId && event.id !== eventId
      );
    } else {
      // Delete single event
      updatedEvents = events.filter(event => event.id !== eventId);
    }

    setEvents(updatedEvents);
    setShowModal(false);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.color === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventDrag = (event, targetDay) => {
    try {
      // Calculate the time difference between the original date and target date
      const originalDate = new Date(event.date);
      const targetDate = new Date(targetDay);
      
      // Preserve the time from the original event
      targetDate.setHours(originalDate.getHours());
      targetDate.setMinutes(originalDate.getMinutes());
      
      // Create the updated event
      const updatedEvent = {
        ...event,
        date: targetDate.toISOString()
      };

      // Check for conflicts
      if (checkEventConflict(updatedEvent)) {
        alert('Cannot move event: Time slot conflicts with an existing event!');
        return;
      }

      // Update events
      let updatedEvents;
      if (event.isRecurring) {
        // Update all related recurring events
        updatedEvents = events.map(event => {
          if (event.originalEventId === updatedEvent.originalEventId || 
              event.id === updatedEvent.id) {
            const eventDate = new Date(event.date);
            const timeDiff = targetDate.getTime() - originalDate.getTime();
            const newEventDate = new Date(eventDate.getTime() + timeDiff);
            return {
              ...event,
              date: newEventDate.toISOString()
            };
          }
          return event;
        });
      } else {
        // Update single event
        updatedEvents = events.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        );
      }

      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error handling event drag:', error);
      alert('An error occurred while moving the event. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 sm:px-10">
      <div className="calendar-container max-w-5xl mx-auto rounded-3xl p-8">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button className="calendar-nav-button" onClick={handlePrevMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="calendar-title">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button className="calendar-nav-button" onClick={handleNextMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="blue">Blue</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="purple">Purple</option>
          </select>
        </div>

        <div className="calendar-grid">
      <MonthGrid
        currentMonth={currentMonth}
            events={filteredEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onEventDrag={handleEventDrag}
          />
        </div>

        {/* Modal */}
        {showModal && (
        <EventModal
          date={selectedDate}
          event={selectedEvent}
            onClose={() => setShowModal(false)}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>
    </div>
  );
}
