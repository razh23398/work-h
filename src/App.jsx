import React, { useState, useEffect } from 'react';
    import { Routes, Route, useNavigate } from 'react-router-dom';
    import EmployeeDashboard from './components/EmployeeDashboard';
    import ManagerDashboard from './components/ManagerDashboard';
    import { collection, getDocs, query, where } from 'firebase/firestore';
    import { db } from './firebase';

    function App() {
      const [loggedIn, setLoggedIn] = useState(false);
      const [userType, setUserType] = useState(null);
      const [restaurantCode, setRestaurantCode] = useState(null);
      const [loginError, setLoginError] = useState(null);
      const navigate = useNavigate();

      useEffect(() => {
        const checkInitialData = async () => {
          const restaurantsRef = collection(db(), 'restaurants');
          const restaurantsQuery = query(restaurantsRef, where('code', '==', '1'));
          const restaurantsSnapshot = await getDocs(restaurantsQuery);

          if (restaurantsSnapshot.empty) {
            console.log('Initial data not found, please add manually');
          }
        };
        checkInitialData();
      }, []);

      const handleLogin = async (e) => {
        e.preventDefault();
        const form = e.target;
        const username = form.username.value;
        const password = form.password.value;
        const userType = form.userType.value;
        const restaurantCode = form.restaurantCode.value;

        const usersRef = collection(db(), 'users');
        const q = query(
          usersRef,
          where('username', '==', username),
          where('password', '==', password),
          where('restaurantCode', '==', restaurantCode),
          where('userType', '==', userType),
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setUserType(userType);
          setRestaurantCode(restaurantCode);
          setLoggedIn(true);
          setLoginError(null);
          navigate(`/${userType}`);
        } else {
          setLoginError('Invalid credentials. Please try again.');
        }
      };

      if (!loggedIn) {
        return (
          <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <label>
                Username:
                <input type="text" name="username" required />
              </label>
              <label>
                Password:
                <input type="password" name="password" required />
              </label>
              <label>
                User Type:
                <select name="userType" required>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </label>
              <label>
                Restaurant Code:
                <input type="text" name="restaurantCode" required />
              </label>
              <button type="submit">Login</button>
              {loginError && <div className="error-message">{loginError}</div>}
            </form>
          </div>
        );
      }

      return (
        <Routes>
          <Route
            path="/employee"
            element={
              userType === 'employee' ? (
                <EmployeeDashboard restaurantCode={restaurantCode} />
              ) : (
                <div>Access Denied</div>
              )
            }
          />
          <Route
            path="/manager"
            element={
              userType === 'manager' ? (
                <ManagerDashboard restaurantCode={restaurantCode} />
              ) : (
                <div>Access Denied</div>
              )
            }
          />
        </Routes>
      );
    }

    export default App;
