# Calendar App

A modern calendar application built with React that allows users to create, edit, and manage events with custom recurrence options.

## Features

- Create and manage events
- Custom recurrence patterns (daily, weekly, monthly, yearly)
- Event color coding
- Search and filter events
- Responsive design
- Drag and drop event management

## Prerequisites

Before running this project, make sure you have:
- Node.js installed (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Unzip the project folder
2. Open a terminal/command prompt
3. Navigate to the project directory:
   ```bash
   cd my-calendar-app
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Running the Project

1. Start the development server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

- `src/components/` - React components
  - `Calendar.jsx` - Main calendar component
  - `EventModal.jsx` - Event creation/editing modal
  - `MonthGrid.jsx` - Month view grid
- `src/styles/` - CSS styles
  - `calendar.css` - Main stylesheet

## Dependencies

- React
- date-fns (for date manipulation)
- react-beautiful-dnd (for drag and drop functionality)

## Browser Support

The application works best in modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
