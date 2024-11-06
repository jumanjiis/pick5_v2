import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import CreateMatch from './CreateMatch';
import ManageMatches from './ManageMatches';
import ManagePlayers from './ManagePlayers';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="matches/create" element={<CreateMatch />} />
      <Route path="matches" element={<ManageMatches />} />
      <Route path="players" element={<ManagePlayers />} />
    </Routes>
  );
};

export default AdminRoutes;