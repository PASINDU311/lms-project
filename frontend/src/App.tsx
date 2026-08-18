import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import CourseDetail from './CourseDetail';
import CreateCourse from './CreateCourse';
import MyCourses from './MyCourses';
import CoursePlayer from './CoursePlayer';
import CourseBuilder from './CourseBuilder';

const App: React.FC = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/courses/:id" element={token ? <CourseDetail /> : <Navigate to="/" />} />
        <Route path="/create-course" element={token ? <CreateCourse /> : <Navigate to="/" />} />
        <Route path="/my-courses" element={token ? <MyCourses /> : <Navigate to="/" />} />
        <Route path="/learn/:id" element={token ? <CoursePlayer /> : <Navigate to="/" />} />
        <Route path="/builder/:id" element={token ? <CourseBuilder /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;