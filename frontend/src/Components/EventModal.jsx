import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function EventModal({ date, event, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [recurrence, setRecurrence] = useState('none');
  const [time, setTime] = useState('12:00');
  const [endTime, setEndTime] = useState('13:00');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customRecurrence, setCustomRecurrence] = useState({
    frequency: 'daily',
    interval: 1,
    daysOfWeek: [],
    endType: 'never',
    endDate: '',
    occurrences: 1
  });

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setColor(event.color || 'blue');
      setRecurrence(event.recurrence || 'none');
      setTime(format(new Date(event.date), 'HH:mm'));
      setEndTime(event.endTime || format(new Date(new Date(event.date).getTime() + 60 * 60 * 1000), 'HH:mm'));
      if (event.customRecurrence) {
        setCustomRecurrence(event.customRecurrence);
      }
    } else {
      setTitle('');
      setDescription('');
      setColor('blue');
      setRecurrence('none');
      setTime('12:00');
      setEndTime('13:00');
      setCustomRecurrence({
        frequency: 'daily',
        interval: 1,
        daysOfWeek: [],
        endType: 'never',
        endDate: '',
        occurrences: 1
      });
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventDate = new Date(date);
    const [hours, minutes] = time.split(':');
    eventDate.setHours(parseInt(hours, 10));
    eventDate.setMinutes(parseInt(minutes, 10));

    const eventData = {
      title,
      description,
      color,
      date: eventDate.toISOString(),
      endTime,
      ...(event && { id: event.id }),
      ...(event && { recurrenceId: event.recurrenceId }),
      ...(event && { isRecurring: event.isRecurring }),
      ...(event && { originalDate: event.originalDate || event.date })
    };

    if (event?.isRecurring) {
      eventData.recurrence = event.recurrence;
      eventData.customRecurrence = event.customRecurrence;
    } else if (recurrence === 'custom') {
      eventData.recurrence = 'custom';
      eventData.customRecurrence = customRecurrence;
    } else {
      eventData.recurrence = recurrence;
    }

    onSave(eventData);
  };

  const handleCustomRecurrenceChange = (field, value) => {
    setCustomRecurrence(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderCustomRecurrenceOptions = () => {
    if (recurrence !== 'custom') return null;

    return (
      <div className="custom-recurrence-options">
        <div className="form-group">
          <label>Frequency</label>
          <select
            value={customRecurrence.frequency}
            onChange={(e) => handleCustomRecurrenceChange('frequency', e.target.value)}
            className="form-select"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="form-group">
          <label>Repeat every</label>
          <div className="recurrence-interval">
            <input
              type="number"
              min="1"
              max="99"
              value={customRecurrence.interval}
              onChange={(e) => handleCustomRecurrenceChange('interval', parseInt(e.target.value))}
              className="form-input"
            />
            <span>{customRecurrence.frequency === 'daily' ? 'days' : 
                   customRecurrence.frequency === 'weekly' ? 'weeks' :
                   customRecurrence.frequency === 'monthly' ? 'months' : 'years'}</span>
          </div>
        </div>

        {customRecurrence.frequency === 'weekly' && (
          <div className="form-group">
            <label>Days of week</label>
            <div className="weekday-selector">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <label key={day} className="weekday-checkbox">
                  <input
                    type="checkbox"
                    checked={customRecurrence.daysOfWeek.includes(index)}
                    onChange={(e) => {
                      const newDays = e.target.checked
                        ? [...customRecurrence.daysOfWeek, index]
                        : customRecurrence.daysOfWeek.filter(d => d !== index);
                      handleCustomRecurrenceChange('daysOfWeek', newDays);
                    }}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Ends</label>
          <div className="recurrence-end-options">
            <label className="radio-option">
              <input
                type="radio"
                checked={customRecurrence.endType === 'never'}
                onChange={() => handleCustomRecurrenceChange('endType', 'never')}
              />
              Never
            </label>
            <label className="radio-option">
              <input
                type="radio"
                checked={customRecurrence.endType === 'on'}
                onChange={() => handleCustomRecurrenceChange('endType', 'on')}
              />
              On
              <input
                type="date"
                value={customRecurrence.endDate}
                onChange={(e) => handleCustomRecurrenceChange('endDate', e.target.value)}
                disabled={customRecurrence.endType !== 'on'}
                className="form-input"
              />
            </label>
            <label className="radio-option">
              <input
                type="radio"
                checked={customRecurrence.endType === 'after'}
                onChange={() => handleCustomRecurrenceChange('endType', 'after')}
              />
              After
              <input
                type="number"
                min="1"
                max="99"
                value={customRecurrence.occurrences}
                onChange={(e) => handleCustomRecurrenceChange('occurrences', parseInt(e.target.value))}
                disabled={customRecurrence.endType !== 'after'}
                className="form-input"
              />
              occurrences
            </label>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = (deleteAll) => {
    onDelete(event.id, deleteAll);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {event ? 'Edit Event' : 'Add Event'}
          </h2>
          <div className="modal-header-actions">
            {event && (
              <button
                type="button"
                className="delete-button"
                onClick={handleDeleteClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                Delete
              </button>
            )}
            <button className="modal-close-button" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div className="form-group time-group">
            <label htmlFor="time">Start Time</label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group time-group">
            <label htmlFor="endTime">End Time</label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Color</label>
            <select
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="form-select"
            >
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="purple">Purple</option>
            </select>
          </div>

          {!event && (
            <div className="form-group">
              <label htmlFor="recurrence">Recurrence</label>
              <select
                id="recurrence"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="form-select"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          )}

          {renderCustomRecurrenceOptions()}

          <div className="modal-actions">
            <div className="action-buttons">
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-button">
                {event ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h3>Delete Event</h3>
              <p>How would you like to delete this event?</p>
              <div className="delete-confirm-buttons">
                <button
                  className="delete-single-button"
                  onClick={() => handleDeleteConfirm(false)}
                >
                  Delete This Event Only
                </button>
                {event.isRecurring && (
                  <button
                    className="delete-all-button"
                    onClick={() => handleDeleteConfirm(true)}
                  >
                    Delete All Recurring Events
                  </button>
                )}
                <button
                  className="cancel-delete-button"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
