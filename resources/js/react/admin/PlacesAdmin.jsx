import React, { useState, useEffect } from 'react';
import { adminService, categoriesService } from '../services/api';
import PlaceSchedulesManager from './PlaceSchedulesManager';
import './admin.css';

const PlacesAdmin = () => {
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ecohotels, setEcohotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingPlace, setEditingPlace] = useState(null);
  const [managingSchedulesPlace, setManagingSchedulesPlace] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image: null,
    latitude: '',
    longitude: '',
    categories: [],
    ecohoteles: [],
  });

  // Mapeo determinístico: nombre exacto -> imagen local
  const mapeoImagenesDeterministico = {
    'Lago De La Pradera': '/imagenes/Lago.jpeg',
    'La Laguna Del Otún': '/imagenes/laguna.jpg',
    'Laguna Del Otún': '/imagenes/laguna.jpg',
    'Chorros De Don Lolo': '/imagenes/lolo-2.jpg',
    'Termales de Santa Rosa': '/imagenes/termaales.jpg',
    'Parque Acuático Consota': '/imagenes/consota.jpg',
    'Balneario Los Farallones': '/imagenes/farallones.jpeg',
    'Cascada Los Frailes': '/imagenes/frailes3.jpg',
    'Río San José': '/imagenes/sanjose3.jpg',
    'Rio San Jose': '/imagenes/sanjose3.jpg',
    'Alto Del Nudo': '/imagenes/nudo.jpg',
    'Alto Del Toro': '/imagenes/toro.jpg',
    'La Divisa De Don Juan': '/imagenes/divisa3.jpeg',
    'Cerro Batero': '/imagenes/batero.jpg',
    'Reserva Forestal La Nona': '/imagenes/lanona5.jpg',
    'Reserva Natural Cerro Gobia': '/imagenes/gobia.jpg',
    'Kaukitá Bosque Reserva': '/imagenes/kaukita3.jpg',
    'Kaukita Bosque Reserva': '/imagenes/kaukita3.jpg',
    'Reserva Natural DMI Agualinda': '/imagenes/distritomanejo8.jpg',
    'Parque Nacional Natural Tatamá': '/imagenes/tatama.jpg',
    'Parque Nacional Natural Tatama': '/imagenes/tatama.jpg',
    'Parque Las Araucarias': '/imagenes/araucarias.jpg',
    'Parque Regional Natural Cuchilla de San Juan': '/imagenes/cuchilla.jpg',
    'Parque Natural Regional Santa Emilia': '/imagenes/santaemilia2.jpg',
    'Jardín Botánico UTP': '/imagenes/jardin.jpeg',
    'Jardin Botanico UTP': '/imagenes/jardin.jpeg',
    'Jardín Botánico De Marsella': '/imagenes/jardinmarsella2.jpg',
    'Jardin Botanico De Marsella': '/imagenes/jardinmarsella2.jpg',
  };

  const normalizarNombre = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const mapeoImagenesLocales = {
    'lago de la pradera': '/imagenes/Lago.jpeg',
    'la laguna del otún': '/imagenes/laguna.jpg',
    'laguna del otún': '/imagenes/laguna.jpg',
    'chorros de don lolo': '/imagenes/lolo-2.jpg',
    'termales de santa rosa': '/imagenes/termaales.jpg',
    'parque acuático consota': '/imagenes/consota.jpg',
    'balneario los farallones': '/imagenes/farallones.jpeg',
    'cascada los frailes': '/imagenes/frailes3.jpg',
    'río san josé': '/imagenes/sanjose3.jpg',
    'rio san jose': '/imagenes/sanjose3.jpg',
    'alto del nudo': '/imagenes/nudo.jpg',
    'alto del toro': '/imagenes/toro.jpg',
    'la divisa de don juan': '/imagenes/divisa3.jpeg',
    'cerro batero': '/imagenes/batero.jpg',
    'reserva forestal la nona': '/imagenes/lanona5.jpg',
    'reserva natural cerro gobia': '/imagenes/gobia.jpg',
    'kaukita bosque reserva': '/imagenes/kaukita3.jpg',
    'kaukitá bosque reserva': '/imagenes/kaukita3.jpg',
    'reserva natural dmi agualinda': '/imagenes/distritomanejo8.jpg',
    'parque nacional natural tatamá': '/imagenes/tatama.jpg',
    'parque nacional natural tatama': '/imagenes/tatama.jpg',
    'parque las araucarias': '/imagenes/araucarias.jpg',
    'parque regional natural cuchilla de san juan': '/imagenes/cuchilla.jpg',
    'parque natural regional santa emilia': '/imagenes/santaemilia2.jpg',
    'jardín botánico utp': '/imagenes/jardin.jpeg',
    'jardin botanico utp': '/imagenes/jardin.jpeg',
    'jardín botánico de marsella': '/imagenes/jardinmarsella2.jpg',
    'jardin botanico de marsella': '/imagenes/jardinmarsella2.jpg',
  };

  useEffect(() => {
    loadPlaces();
    loadCategories();
    loadEcohotels();
  }, []);

  const loadEcohotels = async () => {
    try {
      const data = await adminService.ecohotels.getAll();
      setEcohotels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar ecohoteles:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const data = await adminService.places.getAll();
      let placesData = Array.isArray(data) ? data : [];
      
      // PRIORIDAD: Imágenes subidas -> Imágenes locales del mapeo -> Placeholder
      placesData = placesData.map((place) => {
        const nombreOriginal = place.name || '';
        const nombreLugar = normalizarNombre(nombreOriginal);
        
        // PRIMERO: Verificar si hay imagen subida (desde storage)
        // El accessor del modelo convierte /storage/... a URL completa, así que verificamos ambas opciones
        const imagenSubida = place.image && (
          place.image.includes('/storage/places/') || 
          place.image.startsWith('/storage/') ||
          place.image.includes('storage/places') ||
          (place.image.startsWith('http') && place.image.includes('/storage/places/'))
        ) ? place.image : null;
        
        // SEGUNDO: Si no hay imagen subida, buscar en mapeo local
        let imagenLocal = null;
        if (!imagenSubida) {
          // Buscar en mapeo determinístico por nombre original
          imagenLocal = mapeoImagenesDeterministico[nombreOriginal];
          
          // Si no se encontró, buscar en mapeo normalizado
          if (!imagenLocal) {
            imagenLocal = mapeoImagenesLocales[nombreLugar];
          }
        }
        
        return {
          ...place,
          // PRIORIDAD: imagen subida -> imagen local del mapeo -> placeholder (NUNCA imagen aleatoria de API)
          imagen: imagenSubida || imagenLocal || '/imagenes/placeholder.jpg',
          // Mantener image solo si es una imagen subida válida
          image: imagenSubida || null,
        };
      });
      
      setPlaces(placesData);
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
        categories: placeData.categories ? placeData.categories.map(cat => cat.id) : [],
        ecohoteles: placeData.ecohoteles ? placeData.ecohoteles.map(e => e.id) : [],
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
      categories: [],
      ecohoteles: [],
    });
    // Reset file input
    const fileInput = document.getElementById('place-image');
    if (fileInput) fileInput.value = '';
    // Reset category checkboxes
    document.querySelectorAll('input[type="checkbox"][name="categories"]').forEach(cb => {
      cb.checked = false;
    });
  };

  const handleInputChange = (e) => {
    const { name, value, files, type, checked, multiple, options } = e.target;
    if (type === 'checkbox' && name === 'categories') {
      // Manejar checkboxes de categorías
      const categoryId = parseInt(value);
      setFormData((prev) => {
        const currentCategories = prev.categories || [];
        if (checked) {
          return {
            ...prev,
            categories: [...currentCategories, categoryId],
          };
        } else {
          return {
            ...prev,
            categories: currentCategories.filter(id => id !== categoryId),
          };
        }
      });
    } else if (name === 'ecohoteles') {
      // Manejar select múltiple de ecohoteles
      const selected = Array.from(options).filter(o => o.selected).map(o => parseInt(o.value));
      setFormData((prev) => ({
        ...prev,
        ecohoteles: selected,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    }
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
                Puedes obtener las coordenadas desde{' '}
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


          <div className="form-group">
            <label>
              Categorías
              <div className="categories-checkboxes">
                {categories.length === 0 ? (
                  <p className="categories-empty-message">
                    No hay categorías disponibles. Crea categorías primero.
                  </p>
                ) : (
                  categories.map((category) => (
                    <label key={category.id} className="category-checkbox-label">
                      <input
                        type="checkbox"
                        name="categories"
                        value={category.id}
                        checked={formData.categories?.includes(category.id) || false}
                        onChange={handleInputChange}
                        className="category-checkbox"
                      />
                      <span className="category-checkbox-text">{category.name}</span>
                    </label>
                  ))
                )}
              </div>
            </label>
          </div>

          <div className="form-group">
            <label>
              Ecohoteles relacionados
              <select
                name="ecohoteles"
                multiple
                value={formData.ecohoteles}
                onChange={handleInputChange}
                className="ecohoteles-multiselect"
                style={{ minHeight: '80px', width: '100%' }}
              >
                {ecohotels.length === 0 ? (
                  <option value="" disabled>No hay ecohoteles disponibles</option>
                ) : (
                  ecohotels.map((ecohotel) => (
                    <option key={ecohotel.id} value={ecohotel.id}>
                      {ecohotel.name}
                    </option>
                  ))
                )}
              </select>
              <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                Puedes asociar uno o varios ecohoteles a este lugar.
              </small>
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
                <th>Coordenadas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {places.map((place) => (
                <tr key={place.id}>
                  <td data-label="Imagen">
                    {place.imagen && place.imagen !== '/imagenes/placeholder.jpg' ? (
                      <img 
                        src={place.imagen} 
                        alt={place.name} 
                        className="thumb"
                        onError={(e) => {
                          console.error('Error al cargar imagen:', place.imagen, 'para lugar:', place.name);
                          e.target.src = '/imagenes/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <span className="no-image">Sin imagen</span>
                    )}
                  </td>
                  <td data-label="Nombre">{place.name}</td>
                  <td data-label="Ubicación">{place.location || '-'}</td>
                  <td data-label="Coordenadas">
                    {place.latitude && place.longitude ? (
                      <span style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {parseFloat(place.latitude).toFixed(6)}, {parseFloat(place.longitude).toFixed(6)}
                      </span>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.85rem' }}>Sin coordenadas</span>
                    )}
                  </td>
                  <td data-label="Acciones">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                      <button
                        onClick={() => handleEdit(place)}
                        className="btn-edit"
                        title="Editar lugar"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setManagingSchedulesPlace(place)}
                        className="btn-schedule"
                        title="Gestionar horarios"
                      >
                        📅 Horarios
                      </button>
                      <button
                        onClick={() => handleDelete(place.id)}
                        className="btn-delete"
                        title="Eliminar lugar"
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de gestión de horarios */}
      {managingSchedulesPlace && (
        <PlaceSchedulesManager
          placeId={managingSchedulesPlace.id}
          placeName={managingSchedulesPlace.name}
          onClose={() => setManagingSchedulesPlace(null)}
        />
      )}
    </div>
  );
};

export default PlacesAdmin;

