import React, { useState } from 'react';
import PlacesAdmin from './PlacesAdmin';
import UsersAdmin from './UsersAdmin';
import './admin.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('places');

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel ADMIN</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'places' ? 'active' : ''}
          onClick={() => setActiveTab('places')}
        >
          Lugares
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'places' && <PlacesAdmin />}
        {activeTab === 'users' && <UsersAdmin />}
      </div>
    </div>
  );
};

export default AdminPanel;

