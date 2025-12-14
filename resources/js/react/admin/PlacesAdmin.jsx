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
        await adminService.places.update(editingPlace.id, formData);
        showMessage('Lugar actualizado correctamente');
      } else {
        await adminService.places.create(formData);
        showMessage('Lugar creado correctamente');
      }
      
      resetForm();
      loadPlaces();
    } catch (error) {
      console.error('Error al guardar lugar:', error);
      showMessage(
        error.response?.data?.message || 'Error al guardar lugar',
        'error'
      );
    }
  };

  const handleEdit = async (place) => {
    try {
      const placeData = await adminService.places.getById(place.id);
      setEditingPlace(placeData);
      setFormData({
        name: placeData.name || '',
        location: placeData.location || '',
        description: placeData.description || '',
        image: null,
      });
    } catch (error) {
      console.error('Error al cargar lugar:', error);
      showMessage('Error al cargar lugar', 'error');
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
              Ubicación
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
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

