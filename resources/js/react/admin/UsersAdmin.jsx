import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import './admin.css';

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    is_admin: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.users.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      showMessage('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      showMessage('Nombre y email son requeridos', 'error');
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        is_admin: formData.is_admin,
      };

      // Solo incluir contraseña si se proporciona (y no está vacía)
      if (formData.password.trim()) {
        userData.password = formData.password;
      }

      if (editingUser) {
        await adminService.users.update(editingUser.id, userData);
        showMessage('Usuario actualizado correctamente');
      } else {
        const response = await adminService.users.create(userData);
        
        // Si se generó una contraseña, mostrarla al admin
        if (response.generated_password) {
          const passwordMsg = `Usuario creado correctamente.\n\n` +
            `CONTRASEÑA GENERADA:\n${response.generated_password}\n\n` +
            `IMPORTANTE: Guarda esta contraseña y compártela con el usuario. No se mostrará nuevamente.`;
          alert(passwordMsg);
          showMessage('Usuario creado correctamente. Revisa la contraseña generada.');
        } else {
          showMessage('Usuario creado correctamente');
        }
      }
      
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      showMessage(
        error.response?.data?.message || 'Error al guardar usuario',
        'error'
      );
    }
  };

  const handleEdit = async (user) => {
    try {
      const userData = await adminService.users.getById(user.id);
      setEditingUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        password: '', // No mostrar contraseña al editar
        is_admin: userData.is_admin || false,
      });
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      showMessage('Error al cargar usuario', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de borrar este usuario?')) {
      return;
    }

    try {
      await adminService.users.delete(id);
      showMessage('Usuario eliminado correctamente');
      loadUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showMessage(
        error.response?.data?.message || 'Error al eliminar usuario',
        'error'
      );
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      is_admin: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="admin-panel">
      {message && (
        <div className={`admin-message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="admin-form-section">
        <h2>Usuarios</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Nombre <span className="required">*</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Email <span className="required">*</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Contraseña {!editingUser && <span style={{fontSize: '0.85em', color: '#666', fontWeight: 'normal'}}>(opcional)</span>}
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                minLength={6}
                placeholder={editingUser ? "Dejar vacío para mantener la contraseña actual" : "Dejar vacío para generar una contraseña aleatoria segura"}
              />
              {!editingUser && (
                <small style={{display: 'block', color: '#666', marginTop: '4px'}}>
                  Si no proporcionas una contraseña, se generará una automáticamente y se mostrará después de crear el usuario.
                </small>
              )}
            </label>
          </div>

          <div className="form-group">
            <label>
              Rol
              <select
                name="is_admin"
                value={formData.is_admin ? 'admin' : 'user'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_admin: e.target.value === 'admin',
                  }))
                }
              >
                <option value="user">Usuario</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingUser ? 'Actualizar usuario' : 'Guardar usuario'}
            </button>
            {editingUser && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-list-section">
        <h2>Lista de usuarios</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : users.length === 0 ? (
          <p>No hay usuarios registrados</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email || '-'}</td>
                  <td>{user.is_admin ? 'Admin' : 'Usuario'}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn-edit"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn-delete"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersAdmin;

