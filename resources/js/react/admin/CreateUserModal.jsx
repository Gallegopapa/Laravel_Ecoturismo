import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import './AdminModals.css';

const CreateUserModal = ({ isOpen, onClose, onUserCreated, places = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    tipo_usuario: 'normal',
    is_admin: false,
    lugares: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePlaceToggle = (placeId) => {
    setFormData(prev => {
      const lugares = prev.lugares || [];
      const existingPlace = lugares.find(p => p.place_id === placeId);
      
      if (existingPlace) {
        return {
          ...prev,
          lugares: lugares.filter(p => p.place_id !== placeId)
        };
      } else {
        return {
          ...prev,
          lugares: [...lugares, { place_id: placeId, rol: 'gerente', es_principal: false }]
        };
      }
    });
  };

  const handlePlaceRoleChange = (placeId, rol) => {
    setFormData(prev => ({
      ...prev,
      lugares: prev.lugares.map(p => 
        p.place_id === placeId ? { ...p, rol } : p
      )
    }));
  };

  const handlePlacePrincipalChange = (placeId) => {
    setFormData(prev => ({
      ...prev,
      lugares: prev.lugares.map(p => ({
        ...p,
        es_principal: p.place_id === placeId ? !p.es_principal : false
      }))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setGeneratedPassword('');

    try {
      setLoading(true);

      const userData = {
        name: formData.name,
        email: formData.email,
        tipo_usuario: formData.tipo_usuario,
        is_admin: formData.tipo_usuario === 'admin' ? true : formData.is_admin,
      };

      // Agregar contraseña solo si se proporcionó
      if (formData.password) {
        userData.password = formData.password;
      }

      // Agregar lugares si es usuario empresa
      if (formData.tipo_usuario === 'empresa' && formData.lugares.length > 0) {
        userData.lugares = formData.lugares;
      }

      const response = await adminService.users.create(userData);

      if (response.generated_password) {
        setGeneratedPassword(response.generated_password);
        setMessage('Usuario creado. Contraseña generada automáticamente.');
      } else {
        setMessage('Usuario creado correctamente');
      }

      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        password: '',
        tipo_usuario: 'normal',
        is_admin: false,
        lugares: [],
      });

      // Notificar al componente padre
      if (onUserCreated) {
        onUserCreated(response);
      }

      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error al crear usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nuevo Usuario</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {message && (
          <div className={`alert alert-${generatedPassword ? 'warning' : 'success'}`}>
            {message}
          </div>
        )}

        {generatedPassword && (
          <div className="generated-password-box">
            <strong>Contraseña generada:</strong>
            <div className="password-display">
              <code>{generatedPassword}</code>
              <button
                type="button"
                className="btn-copy"
                onClick={() => navigator.clipboard.writeText(generatedPassword)}
              >
                Copiar
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="user-form">
          {/* Nombre de usuario */}
          <div className="form-group">
            <label htmlFor="name">Nombre de Usuario *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="ej: usuario_123"
              className={errors.name ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.name && <small className="error-text">{errors.name[0]}</small>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="usuario@ejemplo.com"
              className={errors.email ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.email && <small className="error-text">{errors.email[0]}</small>}
          </div>

          {/* Tipo de Usuario */}
          <div className="form-group">
            <label htmlFor="tipo_usuario">Tipo de Usuario *</label>
            <select
              id="tipo_usuario"
              name="tipo_usuario"
              value={formData.tipo_usuario}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="normal">Usuario Normal</option>
              <option value="empresa">Usuario Empresa</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña (opcional)</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Dejar vacío para generar automáticamente"
              disabled={loading}
            />
            <small>Si deja vacío, se generará una contraseña segura automáticamente.</small>
          </div>

          {/* Lugares - Solo para usuarios empresa */}
          {formData.tipo_usuario === 'empresa' && (
            <div className="form-group">
              <label>Lugares Asignados</label>
              <div className="places-list">
                {places.length > 0 ? (
                  places.map(place => {
                    const selectedPlace = formData.lugares?.find(p => p.place_id === place.id);
                    return (
                      <div key={place.id} className="place-item">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={!!selectedPlace}
                            onChange={() => handlePlaceToggle(place.id)}
                            disabled={loading}
                          />
                          <span>{place.name}</span>
                        </label>
                        
                        {selectedPlace && (
                          <div className="place-options">
                            <select
                              value={selectedPlace.rol}
                              onChange={(e) => handlePlaceRoleChange(place.id, e.target.value)}
                              disabled={loading}
                            >
                              <option value="gerente">Gerente</option>
                              <option value="recepcionista">Recepcionista</option>
                              <option value="admin">Admin del Lugar</option>
                            </select>

                            <label className="principal-label">
                              <input
                                type="checkbox"
                                checked={selectedPlace.es_principal || false}
                                onChange={() => handlePlacePrincipalChange(place.id)}
                                disabled={loading}
                              />
                              <span>Principal</span>
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-places">No hay lugares disponibles</p>
                )}
              </div>
              {errors.lugares && <small className="error-text">{errors.lugares[0]}</small>}
            </div>
          )}

          {/* Admin Checkbox */}
          {formData.tipo_usuario !== 'admin' && (
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_admin"
                  checked={formData.is_admin}
                  onChange={handleInputChange}
                  disabled={loading || formData.tipo_usuario === 'admin'}
                />
                <span>Es Administrador</span>
              </label>
            </div>
          )}

          {/* Botones */}
          <div className="modal-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
