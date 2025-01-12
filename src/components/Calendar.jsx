import React, { useState } from 'react';
    import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';

    function Calendar({ onDateClick, selectedDate, shifts }) {
      const [currentMonth, setCurrentMonth] = useState(new Date());
      const firstDayOfMonth = startOfMonth(currentMonth);
      const lastDayOfMonth = endOfMonth(currentMonth);
      const days = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

      const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
      };

      const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
      };

      return (
        <div className="calendar-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <button onClick={handlePrevMonth}>Previous</button>
            <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={handleNextMonth}>Next</button>
          </div>
          <table className="calendar">
            <thead>
              <tr>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.reduce((rows, day, index) => {
                if (index % 7 === 0) {
                  rows.push([]);
                }
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasShifts = shifts && shifts[format(day, 'yyyy-MM-dd')];
                rows[rows.length - 1].push(
                  <td
                    key={day}
                    onClick={() => onDateClick(day)}
                    className={isSelected ? 'selected' : hasShifts ? 'selected' : ''}
                  >
                    <div style={{ padding: '5px' }}>{format(day, 'd')}</div>
                  </td>,
                );
                return rows;
              }, [])}
            </tbody>
          </table>
        </div>
      );
    }

    export default Calendar;
