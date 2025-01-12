import React, { useState, useEffect } from 'react';
    import Calendar from 'react-calendar';
    import 'react-calendar/dist/Calendar.css';
    import { format, isBefore, isToday } from 'date-fns';
    import { db } from '../firebase';
    import {
      collection,
      doc,
      setDoc,
      getDoc,
      onSnapshot,
      deleteDoc,
    } from 'firebase/firestore';

    function ManagerDashboard({ restaurantCode }) {
      const [selectedDate, setSelectedDate] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [shifts, setShifts] = useState({});
      const [morningShift, setMorningShift] = useState('');
      const [afternoonShift, setAfternoonShift] = useState('');
      const [eveningShift, setEveningShift] = useState('');
      const [notifications, setNotifications] = useState([]);

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

        const unsubscribe = onSnapshot(
          collection(db(), `restaurants/${restaurantCode}/applications`),
          (snapshot) => {
            const newNotifications = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setNotifications(newNotifications);
          },
        );

        return () => unsubscribe();
      }, [selectedDate, restaurantCode]);

      const handleDateClick = (date) => {
        if (!isBefore(date, new Date()) && !isToday(date)) {
          setSelectedDate(date);
          setIsModalOpen(true);
        }
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

      const handleConfirmApplication = async (id) => {
        await deleteDoc(doc(collection(db(), `restaurants/${restaurantCode}/applications`), id));
      };

      const handleDeleteApplication = async (id) => {
        await deleteDoc(doc(collection(db(), `restaurants/${restaurantCode}/applications`), id));
      };

      const tileClassName = ({ date, view }) => {
        if (view === 'month') {
          const formattedDate = format(date, 'yyyy-MM-dd');
          if (shifts[formattedDate]) {
            return 'react-calendar__tile--hasActive';
          }
          if (isBefore(date, new Date()) && !isToday(date)) {
            return 'react-calendar__tile--disabled';
          }
        }
        return null;
      };

      return (
        <div>
          <h2>Manager Dashboard</h2>
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
          {notifications.map((notification) => (
            <div key={notification.id} className="notification-line">
              <p>
                Employee {notification.id.split('-')[1]} applied for shifts on{' '}
                {notification.id.split('-')[0]}:{' '}
                {Array.isArray(notification.shift)
                  ? notification.shift.join(', ')
                  : 'No shifts selected'}
              </p>
              <button onClick={() => handleConfirmApplication(notification.id)}>Confirm</button>
              <button onClick={() => handleDeleteApplication(notification.id)}>Delete</button>
            </div>
          ))}
        </div>
      );
    }

    export default ManagerDashboard;
