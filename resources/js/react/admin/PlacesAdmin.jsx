import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import './admin.css';

const PlacesAdmin = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingPlace, setEditingPlace] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image: null,
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const data = await adminService.places.getAll();
      setPlaces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar lugares:', error);
      showMessage('Error al cargar lugares', 'error');
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
    
    if (!formData.name.trim()) {
      showMessage('El nombre es requerido', 'error');
      return;
    }

    try {
      if (editingPlace) {
        const result = await adminService.places.update(editingPlace.id, formData);
        showMessage(result.message || 'Lugar actualizado correctamente');
      } else {
        const result = await adminService.places.create(formData);
        showMessage(result.message || 'Lugar creado correctamente');
      }
      
      resetForm();
      await loadPlaces();
    } catch (error) {
      console.error('Error al guardar lugar:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.name?.[0]
        || error.message 
        || 'Error al guardar lugar';
      showMessage(errorMessage, 'error');
    }
  };

  const handleEdit = async (place) => {
    try {
      const response = await adminService.places.getById(place.id);
      // El controlador devuelve el lugar directamente, pero verificar si está anidado
      const placeData = response.place || response;
      setEditingPlace(placeData);
      setFormData({
        name: placeData.name || '',
        location: placeData.location || '',
        description: placeData.description || '',
        latitude: placeData.latitude || '',
        longitude: placeData.longitude || '',
        image: null,
      });
      // Scroll al formulario
      document.querySelector('.admin-form-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error al cargar lugar:', error);
      showMessage('Error al cargar lugar: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de borrar este lugar?')) {
      return;
    }

    try {
      await adminService.places.delete(id);
      showMessage('Lugar eliminado correctamente');
      loadPlaces();
    } catch (error) {
      console.error('Error al eliminar lugar:', error);
      showMessage('Error al eliminar lugar', 'error');
    }
  };

  const resetForm = () => {
    setEditingPlace(null);
    setFormData({
      name: '',
      location: '',
      description: '',
      image: null,
      latitude: '',
      longitude: '',
    });
    // Reset file input
    const fileInput = document.getElementById('place-image');
    if (fileInput) fileInput.value = '';
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
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
        <h2>{editingPlace ? 'Editar lugar' : 'Crear lugar'}</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
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
              Ubicación (dirección o descripción)
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ej: Pereira, Risaralda"
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Coordenadas (para el mapa)
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="Latitud (ej: 4.814)"
                  step="any"
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="Longitud (ej: -75.694)"
                  step="any"
                  style={{ flex: 1 }}
                />
              </div>
              <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                💡 Puedes obtener las coordenadas desde{' '}
                <a 
                  href="https://www.google.com/maps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#2ecc71' }}
                >
                  Google Maps
                </a>
                {' '}haciendo clic derecho en el lugar → "¿Qué hay aquí?"
              </small>
            </label>
          </div>

          <div className="form-group">
            <label>
              Descripción
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Imagen
              <input
                id="place-image"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingPlace ? 'Actualizar' : 'Guardar'}
            </button>
            {editingPlace && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-list-section">
        <h2>Lista de lugares</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : places.length === 0 ? (
          <p>No hay lugares registrados</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {places.map((place) => (
                <tr key={place.id}>
                  <td>
                    {place.image ? (
                      <img src={place.image} alt={place.name} className="thumb" />
                    ) : (
                      <span className="no-image">Sin imagen</span>
                    )}
                  </td>
                  <td>{place.name}</td>
                  <td>{place.location || '-'}</td>
                  <td>
                    {place.latitude && place.longitude ? (
                      <span style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {parseFloat(place.latitude).toFixed(6)}, {parseFloat(place.longitude).toFixed(6)}
                      </span>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.85rem' }}>Sin coordenadas</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(place)}
                      className="btn-edit"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(place.id)}
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

export default PlacesAdmin;

