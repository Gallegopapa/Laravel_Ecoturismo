import React, { useState, useEffect } from 'react';
import { adminService, categoriesService } from '../services/api';
import './admin.css';

const EcohotelsAdmin = () => {
  const [ecohotels, setEcohotels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingEcohotel, setEditingEcohotel] = useState(null);
  const [viewingEcohotel, setViewingEcohotel] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image: null,
    latitude: '',
    longitude: '',
    telefono: '',
    email: '',
    sitio_web: '',
    categories: [],
  });

  useEffect(() => {
    loadEcohotels();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadEcohotels = async () => {
    try {
      setLoading(true);
      const data = await adminService.ecohotels.getAll();
      setEcohotels(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar ecohoteles:', error);
      setMessage('Error al cargar ecohoteles');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) {
        setMessage('La imagen no puede exceder 5MB');
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => {
      const isSelected = prev.categories.includes(categoryId);
      return {
        ...prev,
        categories: isSelected
          ? prev.categories.filter((id) => id !== categoryId)
          : [...prev.categories, categoryId],
      };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminService.ecohotels.create(formData);
      setMessage('Ecohotel creado correctamente');
      setShowCreateModal(false);
      resetForm();
      loadEcohotels();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al crear el ecohotel');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await adminService.ecohotels.update(editingEcohotel.id, formData);
      setMessage('Ecohotel actualizado correctamente');
      setEditingEcohotel(null);
      resetForm();
      loadEcohotels();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al actualizar el ecohotel');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este ecohotel?')) return;
    
    try {
      await adminService.ecohotels.delete(id);
      setMessage('Ecohotel eliminado correctamente');
      loadEcohotels();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al eliminar el ecohotel');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (ecohotel) => {
    setEditingEcohotel(ecohotel);
    setFormData({
      name: ecohotel.name || '',
      location: ecohotel.location || '',
      description: ecohotel.description || '',
      image: null,
      latitude: ecohotel.latitude || '',
      longitude: ecohotel.longitude || '',
      telefono: ecohotel.telefono || '',
      email: ecohotel.email || '',
      sitio_web: ecohotel.sitio_web || '',
      categories: ecohotel.categories ? ecohotel.categories.map((cat) => cat.id) : [],
    });
  };

  const openViewModal = (ecohotel) => {
    setViewingEcohotel(ecohotel);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      description: '',
      image: null,
      latitude: '',
      longitude: '',
      telefono: '',
      email: '',
      sitio_web: '',
      categories: [],
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingEcohotel(null);
    setViewingEcohotel(null);
    resetForm();
  };

  if (loading) {
    return <div className="loading">Cargando ecohoteles...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Gestión de Ecohoteles</h2>
        <button className="btn-primary" onClick={openCreateModal}>
          Crear Ecohotel
        </button>
      </div>

      {message && (
        <div className={`message ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
          {message}
          <button className="close-btn" onClick={() => setMessage('')}>×</button>
        </div>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Categorías</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ecohotels.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No hay ecohoteles registrados
                </td>
              </tr>
            ) : (
              ecohotels.map((ecohotel) => (
                <tr key={ecohotel.id}>
                  <td data-label="ID">{ecohotel.id}</td>
                  <td data-label="Nombre">{ecohotel.name}</td>
                  <td data-label="Ubicación">{ecohotel.location || 'N/A'}</td>
                  <td data-label="Teléfono">{ecohotel.telefono || 'N/A'}</td>
                  <td data-label="Email">{ecohotel.email || 'N/A'}</td>
                  <td data-label="Categorías">
                    {ecohotel.categories && ecohotel.categories.length > 0
                      ? ecohotel.categories.map((cat) => cat.name).join(', ')
                      : 'Sin categorías'}
                  </td>
                  <td data-label="Acciones">
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => openViewModal(ecohotel)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => openEditModal(ecohotel)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(ecohotel.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); closeModals(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Ecohotel</h3>
              <button type="button" className="close-btn" onClick={closeModals}>×</button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Ubicación</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitud</label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="any"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">Longitud</label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    step="any"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sitio_web">Sitio Web</label>
                <input
                  type="url"
                  id="sitio_web"
                  name="sitio_web"
                  value={formData.sitio_web}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Imagen (máx. 5MB)</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>

              <div className="form-group">
                <label>Categorías</label>
                <div className="categories-checkbox">
                  {categories.map((category) => (
                    <label key={category.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editingEcohotel && (
        <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); closeModals(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Ecohotel</h3>
              <button type="button" className="close-btn" onClick={closeModals}>×</button>
            </div>
            <form onSubmit={handleEdit} className="modal-form">
              <div className="form-group">
                <label htmlFor="edit-name">Nombre *</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-location">Ubicación</label>
                <input
                  type="text"
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Descripción</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-latitude">Latitud</label>
                  <input
                    type="number"
                    id="edit-latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="any"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-longitude">Longitud</label>
                  <input
                    type="number"
                    id="edit-longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    step="any"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-telefono">Teléfono</label>
                <input
                  type="text"
                  id="edit-telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-email">Email</label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-sitio_web">Sitio Web</label>
                <input
                  type="url"
                  id="edit-sitio_web"
                  name="sitio_web"
                  value={formData.sitio_web}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com"
                />
              </div>

              {editingEcohotel.image && (
                <div className="form-group">
                  <label>Imagen actual</label>
                  <img
                    src={editingEcohotel.image}
                    alt={editingEcohotel.name}
                    style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="edit-image">Nueva Imagen (máx. 5MB)</label>
                <input
                  type="file"
                  id="edit-image"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>

              <div className="form-group">
                <label>Categorías</label>
                <div className="categories-checkbox">
                  {categories.map((category) => (
                    <label key={category.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {viewingEcohotel && (
        <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); closeModals(); }}>
          <div className="modal-content modal-view" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Ecohotel</h3>
              <button type="button" className="close-btn" onClick={closeModals}>×</button>
            </div>
            <div className="modal-body">
              {viewingEcohotel.image && (
                <img
                  src={viewingEcohotel.image}
                  alt={viewingEcohotel.name}
                  className="detail-image"
                />
              )}
              <div className="detail-item">
                <strong>Nombre:</strong> {viewingEcohotel.name}
              </div>
              <div className="detail-item">
                <strong>Ubicación:</strong> {viewingEcohotel.location || 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Descripción:</strong> {viewingEcohotel.description || 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Teléfono:</strong> {viewingEcohotel.telefono || 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Email:</strong> {viewingEcohotel.email || 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Sitio Web:</strong>{' '}
                {viewingEcohotel.sitio_web ? (
                  <a href={viewingEcohotel.sitio_web} target="_blank" rel="noopener noreferrer">
                    {viewingEcohotel.sitio_web}
                  </a>
                ) : (
                  'N/A'
                )}
              </div>
              <div className="detail-item">
                <strong>Coordenadas:</strong>{' '}
                {viewingEcohotel.latitude && viewingEcohotel.longitude
                  ? `${viewingEcohotel.latitude}, ${viewingEcohotel.longitude}`
                  : 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Categorías:</strong>{' '}
                {viewingEcohotel.categories && viewingEcohotel.categories.length > 0
                  ? viewingEcohotel.categories.map((cat) => cat.name).join(', ')
                  : 'Sin categorías'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcohotelsAdmin;
