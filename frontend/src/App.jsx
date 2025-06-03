import React from 'react';
import Calendar from './Components/Calendar';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="app-title">My Calendar</h1>
      <Calendar />
    </div>
  );
}
