import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { placesService, categoriesService } from '../services/api';
import Header from '../components/Header/Header';
import Header2 from '../components/Header2/Header2';
import Footer from '../components/Footer/Footer';
import MapView from './MapView';
import './page.css';

const MapPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlaces();
  }, []);

  // Mapeo de imágenes locales (mismo que en places/page.jsx)
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

  const loadPlaces = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener todos los lugares con sus categorías
      const data = await placesService.getAll();
      
      // Filtrar solo los lugares que tienen coordenadas
      let placesWithCoords = Array.isArray(data) 
        ? data.filter(place => place.latitude && place.longitude)
        : [];
      
      // PRIORIDAD: Imágenes subidas -> Imágenes locales del mapeo -> Placeholder
      placesWithCoords = placesWithCoords.map((place) => {
        const nombreOriginal = place.name || '';
        const nombreLugar = normalizarNombre(nombreOriginal);
        
        // PRIMERO: Verificar si hay imagen subida (desde storage) - PRIORIDAD MÁXIMA
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
          imagen: imagenSubida || imagenLocal || place.imagen || '/imagenes/placeholder.jpg',
          // Mantener image solo si es una imagen subida válida
          image: imagenSubida || null,
        };
      });
      
      setLocations(placesWithCoords);
    } catch (err) {
      console.error('Error al cargar lugares para el mapa:', err);
      setError('Error al cargar los lugares. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-layout">
        {isAuthenticated && user ? <Header2 /> : <Header />}
        <div className="page-content" style={{ marginTop: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px' }}>
          <div className="loading-spinner"></div>
          <p>Cargando mapa...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-layout">
        {isAuthenticated && user ? <Header2 /> : <Header />}
        <div className="page-content" style={{ marginTop: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', padding: '20px' }}>
          <p style={{ color: '#e74c3c', fontSize: '18px' }}>{error}</p>
          <button 
            onClick={loadPlaces}
            style={{
              padding: '10px 20px',
              background: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reintentar
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-layout">
      {isAuthenticated && user ? <Header2 /> : <Header />}
      <div className="page-content map-page-container">
        <div className="map-page-header">
          <h1>Mapa Interactivo de Lugares</h1>
          <p>Explora los lugares ecoturísticos de Risaralda en el mapa</p>
          {locations.length === 0 && (
            <div className="map-warning">
              <p>⚠️ No hay lugares con coordenadas disponibles en este momento.</p>
              <p>Los administradores pueden agregar coordenadas desde el panel de administración.</p>
            </div>
          )}
        </div>
        <MapView locations={locations} />
      </div>
      <Footer />
    </div>
  );
};

export default MapPage;

