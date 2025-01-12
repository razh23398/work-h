import React, { useState, useEffect } from 'react';
    import Calendar from 'react-calendar';
    import 'react-calendar/dist/Calendar.css';
    import { format } from 'date-fns';
    import { db } from '../firebase';
    import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

    function EmployeeDashboard({ restaurantCode }) {
      const [selectedDate, setSelectedDate] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [shifts, setShifts] = useState({});
      const [appliedShifts, setAppliedShifts] = useState([]);
      const [submittedDays, setSubmittedDays] = useState({});

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
              setAppliedShifts(applicationSnap.data().shift);
            } else {
              setAppliedShifts([]);
            }
          }
        };
        fetchShifts();
      }, [selectedDate, restaurantCode]);

      const handleDateClick = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
      };

      const handleCloseModal = () => {
        setIsModalOpen(false);
      };

      const handleApplyShift = async () => {
        if (selectedDate) {
          const applicationsRef = doc(
            collection(db(), `restaurants/${restaurantCode}/applications`),
            `${format(selectedDate, 'yyyy-MM-dd')}-employee`,
          );
          await setDoc(applicationsRef, { shift: appliedShifts });
          setSubmittedDays((prevDays) => ({
            ...prevDays,
            [format(selectedDate, 'yyyy-MM-dd')]: true,
          }));
        }
        setIsModalOpen(false);
      };

      const handleShiftChange = (shift, isChecked) => {
        if (isChecked) {
          setAppliedShifts([...appliedShifts, shift]);
        } else {
          setAppliedShifts(appliedShifts.filter((s) => s !== shift));
        }
      };

      const tileClassName = ({ date, view }) => {
        if (view === 'month') {
          const formattedDate = format(date, 'yyyy-MM-dd');
          if (submittedDays[formattedDate]) {
            return 'react-calendar__tile--active';
          }
          if (shifts[formattedDate]) {
            return 'react-calendar__tile--hasActive';
          }
        }
        return null;
      };

      return (
        <div>
          <h2>Employee Dashboard</h2>
          <div className="calendar-container">
            <Calendar
              onClickDay={handleDateClick}
              value={selectedDate}
              tileClassName={tileClassName}
            />
          </div>
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
                      <label>
                        <input
                          type="checkbox"
                          checked={appliedShifts.includes('morning')}
                          onChange={(e) => handleShiftChange('morning', e.target.checked)}
                        />
                        Morning
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={appliedShifts.includes('afternoon')}
                          onChange={(e) => handleShiftChange('afternoon', e.target.checked)}
                        />
                        Afternoon
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={appliedShifts.includes('evening')}
                          onChange={(e) => handleShiftChange('evening', e.target.checked)}
                        />
                        Evening
                      </label>
                    </div>
                    <button onClick={handleApplyShift}>Apply</button>
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
