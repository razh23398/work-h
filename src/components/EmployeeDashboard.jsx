import React, { useState, useEffect } from 'react';
    import Calendar from './Calendar';
    import { format } from 'date-fns';
    import { db } from '../firebase';
    import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

    function EmployeeDashboard({ restaurantCode }) {
      const [selectedDate, setSelectedDate] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [shifts, setShifts] = useState({});
      const [appliedShift, setAppliedShift] = useState(null);

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
            }
            const applicationsRef = doc(
              collection(db(), `restaurants/${restaurantCode}/applications`),
              `${format(selectedDate, 'yyyy-MM-dd')}-employee`,
            );
            const applicationSnap = await getDoc(applicationsRef);
            if (applicationSnap.exists()) {
              setAppliedShift(applicationSnap.data().shift);
            } else {
              setAppliedShift(null);
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

      const handleApplyShift = async (shift) => {
        if (selectedDate) {
          const applicationsRef = doc(
            collection(db(), `restaurants/${restaurantCode}/applications`),
            `${format(selectedDate, 'yyyy-MM-dd')}-employee`,
          );
          await setDoc(applicationsRef, { shift });
          setAppliedShift(shift);
        }
        setIsModalOpen(false);
      };

      return (
        <div>
          <h2>Employee Dashboard</h2>
          <Calendar
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
            shifts={shifts}
          />
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2>Shift Details for {format(selectedDate, 'yyyy-MM-dd')}</h2>
                {shifts[format(selectedDate, 'yyyy-MM-dd')] ? (
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
                    <div>
                      <button onClick={() => handleApplyShift('morning')}>Apply Morning</button>
                      <button onClick={() => handleApplyShift('afternoon')}>Apply Afternoon</button>
                      <button onClick={() => handleApplyShift('evening')}>Apply Evening</button>
                    </div>
                    {appliedShift && <p>You have applied for: {appliedShift} shift</p>}
                  </div>
                ) : (
                  <p>No shifts available for this day.</p>
                )}
                <button onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          )}
        </div>
      );
    }

    export default EmployeeDashboard;
