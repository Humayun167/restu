import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminDashboard from '../../components/admin/AdminDashboard';

const AdminLayout = () => {
    return <AdminDashboard />;
};

export default AdminLayout;