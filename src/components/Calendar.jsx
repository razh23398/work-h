import React, { useState, useEffect } from 'react';
    import {
      startOfMonth,
      endOfMonth,
      eachDayOfInterval,
      format,
      isSameDay,
      isBefore,
      isToday,
    } from 'date-fns';

    function Calendar({ onDateClick, selectedDate, shifts, userType }) {
      const [currentMonth, setCurrentMonth] = useState(new Date());
      const firstDayOfMonth = startOfMonth(currentMonth);
      const lastDayOfMonth = endOfMonth(currentMonth);
      const days = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
      const [today, setToday] = useState(new Date());

      useEffect(() => {
        setToday(new Date());
      }, []);

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
                const isPast = isBefore(day, today);
                const isTodayDate = isToday(day);
                const isDisabled = userType === 'manager' && isPast;
                rows[rows.length - 1].push(
                  <td
                    key={day}
                    onClick={() => !isDisabled && onDateClick(day)}
                    className={`${isSelected ? 'selected' : hasShifts ? 'selected' : ''} ${
                      isDisabled ? 'past' : ''
                    }`}
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
