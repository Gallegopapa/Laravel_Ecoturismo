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

  const loadPlaces = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener todos los lugares con sus categorías
      const data = await placesService.getAll();
      
      // Filtrar solo los lugares que tienen coordenadas
      const placesWithCoords = Array.isArray(data) 
        ? data.filter(place => place.latitude && place.longitude)
        : [];
      
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
      <>
        {isAuthenticated && user ? <Header2 /> : <Header />}
        <div style={{ 
          marginTop: '100px',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 200px)',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="loading-spinner"></div>
          <p>Cargando mapa...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        {isAuthenticated && user ? <Header2 /> : <Header />}
        <div style={{ 
          marginTop: '100px',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 200px)',
          flexDirection: 'column',
          gap: '20px',
          padding: '20px'
        }}>
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
      </>
    );
  }

  return (
    <>
      {isAuthenticated && user ? <Header2 /> : <Header />}
      <div className="map-page-container">
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
    </>
  );
};

export default MapPage;

