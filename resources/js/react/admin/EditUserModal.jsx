import React, { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import './AdminModals.css';

const EditUserModal = ({ isOpen, onClose, userId, user, places = [], onUpdated }) => {
  const [formData, setFormData] = useState({
    tipo_usuario: 'normal',
    lugares: [],
  });
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (user) {
      setUserInfo({
        name: user.name || '',
        email: user.email || '',
      });
      setFormData((prev) => ({
        ...prev,
        tipo_usuario: user.tipo_usuario || (user.is_admin ? 'admin' : 'normal'),
      }));
    }
    if (userId) {
      loadUser();
    }
  }, [isOpen, userId, user]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await adminService.users.getById(userId);
      setUserInfo({
        name: data.name || '',
        email: data.email || '',
      });

      const lugaresAsignados = Array.isArray(data.lugares_asignados)
        ? data.lugares_asignados.map((item) => ({
            place_id: item.id,
            rol: item.rol || 'gerente',
            es_principal: !!item.es_principal,
          }))
        : [];

      setFormData({
        tipo_usuario: data.tipo_usuario || (data.is_admin ? 'admin' : 'normal'),
        lugares: lugaresAsignados,
      });
      setMessage('');
      setErrors({});
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      setMessage('Error al cargar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      tipo_usuario: value,
      lugares: value === 'empresa' ? prev.lugares : [],
    }));
  };

  const handlePlaceToggle = (placeId) => {
    setFormData((prev) => {
      const lugares = prev.lugares || [];
      const existingPlace = lugares.find((p) => p.place_id === placeId);

      if (existingPlace) {
        return {
          ...prev,
          lugares: lugares.filter((p) => p.place_id !== placeId),
        };
      }

      return {
        ...prev,
        lugares: [...lugares, { place_id: placeId, rol: 'gerente', es_principal: false }],
      };
    });
  };

  const handlePlaceRoleChange = (placeId, rol) => {
    setFormData((prev) => ({
      ...prev,
      lugares: prev.lugares.map((p) => (p.place_id === placeId ? { ...p, rol } : p)),
    }));
  };

  const handlePlacePrincipalChange = (placeId) => {
    setFormData((prev) => ({
      ...prev,
      lugares: prev.lugares.map((p) => ({
        ...p,
        es_principal: p.place_id === placeId ? !p.es_principal : false,
      })),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    // Validar que usuario empresa tenga al menos un lugar asignado
    console.log('Tipo usuario:', formData.tipo_usuario);
    console.log('Lugares:', formData.lugares);
    
    if (formData.tipo_usuario === 'empresa' && (!formData.lugares || formData.lugares.length === 0)) {
      console.log('Validación falló - no hay lugares asignados');
      setErrors({ lugares: ['Debe asignar al menos un lugar para usuario empresa'] });
      setMessage('Error: Usuario empresa debe tener al menos un lugar asignado');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        tipo_usuario: formData.tipo_usuario,
        is_admin: formData.tipo_usuario === 'admin',
        lugares: formData.tipo_usuario === 'empresa' ? formData.lugares : [],
      };

      await adminService.users.update(userId, payload);
      setMessage('Permisos actualizados correctamente');
      if (onUpdated) {
        onUpdated();
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage(error.response?.data?.message || 'Error al actualizar permisos');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar permisos</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {message && (
          <div className={`alert alert-${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label>Usuario</label>
            <div className="readonly-field">
              <strong>{userInfo.name || '-'}</strong>
              <span>{userInfo.email || '-'}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tipo_usuario">Tipo de Usuario *</label>
            <select
              id="tipo_usuario"
              value={formData.tipo_usuario}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="normal">Usuario Normal</option>
              <option value="empresa">Usuario Empresa</option>
              <option value="admin">Administrador</option>
            </select>
            {errors.tipo_usuario && <small className="error-text">{errors.tipo_usuario[0]}</small>}
          </div>

          {formData.tipo_usuario === 'empresa' && (
            <div className="form-group">
              <label>Lugares asignados *</label>
              <small style={{ color: '#dc3545', marginLeft: '8px' }}>Obligatorio para usuario empresa</small>
              {errors.lugares && <div className="error-text" style={{ marginTop: '8px' }}>{errors.lugares[0]}</div>}
              <div className="places-list">
                {places.length > 0 ? (
                  places.map((place) => {
                    const selectedPlace = formData.lugares?.find((p) => p.place_id === place.id);
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
                            <small className="helper-text">
                              Rol: define permisos dentro del lugar (no es admin del sistema).
                            </small>
                            <label className="principal-label">
                              <input
                                type="checkbox"
                                checked={selectedPlace.es_principal || false}
                                onChange={() => handlePlacePrincipalChange(place.id)}
                                disabled={loading}
                              />
                              <span>Principal</span>
                            </label>
                            <small className="helper-text">
                              Principal: responsable principal del lugar.
                            </small>
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

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
