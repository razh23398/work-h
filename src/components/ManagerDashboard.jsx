import React, { useState, useEffect } from 'react';
    import Calendar from './Calendar';
    import { format } from 'date-fns';
    import { db } from '../firebase';
    import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

    function ManagerDashboard({ restaurantCode }) {
      const [selectedDate, setSelectedDate] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [shifts, setShifts] = useState({});
      const [morningShift, setMorningShift] = useState('');
      const [afternoonShift, setAfternoonShift] = useState('');
      const [eveningShift, setEveningShift] = useState('');

      useEffect(() => {
        const fetchShifts = async () => {
          if (selectedDate) {
            const shiftsRef = doc(
              collection(db(), `restaurants/${restaurantCode}/shifts`),
              format(selectedDate, 'yyyy-MM-dd'),
            );
            const shiftSnap = await getDoc(shiftsRef);
            if (shiftSnap.exists()) {
              setShifts((prevShifts) => ({
                ...prevShifts,
                [format(selectedDate, 'yyyy-MM-dd')]: shiftSnap.data(),
              }));
              setMorningShift(shiftSnap.data().morning || '');
              setAfternoonShift(shiftSnap.data().afternoon || '');
              setEveningShift(shiftSnap.data().evening || '');
            } else {
              setMorningShift('');
              setAfternoonShift('');
              setEveningShift('');
            }
          }
        };
        fetchShifts();
      }, [selectedDate, restaurantCode]);

      const handleDateClick = (day) => {
        setSelectedDate(day);
        setIsModalOpen(true);
      };

      const handleCloseModal = () => {
        setIsModalOpen(false);
      };

      const handleSaveShift = async () => {
        if (selectedDate) {
          const shiftsRef = doc(
            collection(db(), `restaurants/${restaurantCode}/shifts`),
            format(selectedDate, 'yyyy-MM-dd'),
          );
          await setDoc(shiftsRef, {
            morning: morningShift,
            afternoon: afternoonShift,
            evening: eveningShift,
          });
          setShifts((prevShifts) => ({
            ...prevShifts,
            [format(selectedDate, 'yyyy-MM-dd')]: {
              morning: morningShift,
              afternoon: afternoonShift,
              evening: eveningShift,
            },
          }));
        }
        setIsModalOpen(false);
      };

      return (
        <div>
          <h2>Manager Dashboard</h2>
          <Calendar
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
            shifts={shifts}
          />
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2>Shift Details for {format(selectedDate, 'yyyy-MM-dd')}</h2>
                <label>
                  Morning Shift:
                  <input
                    type="number"
                    value={morningShift}
                    onChange={(e) => setMorningShift(e.target.value)}
                  />
                </label>
                <label>
                  Afternoon Shift:
                  <input
                    type="number"
                    value={afternoonShift}
                    onChange={(e) => setAfternoonShift(e.target.value)}
                  />
                </label>
                <label>
                  Evening Shift:
                  <input
                    type="number"
                    value={eveningShift}
                    onChange={(e) => setEveningShift(e.target.value)}
                  />
                </label>
                <button onClick={handleSaveShift}>Save</button>
                <button onClick={handleCloseModal}>Cancel</button>
                {shifts[format(selectedDate, 'yyyy-MM-dd')] && (
                  <div className="shift-details">
                    <p>
                      Morning: {shifts[format(selectedDate, 'yyyy-MM-dd')].morning} employees
                    </p>
                    <p>
                      Afternoon: {shifts[format(selectedDate, 'yyyy-MM-dd')].afternoon} employees
                    </p>
                    <p>
                      Evening: {shifts[format(selectedDate, 'yyyy-MM-dd')].evening} employees
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    export default ManagerDashboard;
