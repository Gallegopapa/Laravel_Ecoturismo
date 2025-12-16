import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { favoritesService } from '../services/api';
import Header2 from '../components/Header2/Header2';
import Footer from '../components/Footer/Footer';
import ReservationModal from '../components/ReservationModal';
import '../places2/paraisosAcuaticos/lugares.css';
import './page.css';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [reservationModal, setReservationModal] = useState({ isOpen: false, place: null });

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoritesService.getAll();
      let favoritesData = Array.isArray(data) ? data : [];
      
      // Priorizar imágenes locales sobre imágenes de API
      favoritesData = favoritesData.map((favorite) => {
        const place = favorite.place || {};
        const nombreOriginal = place.name || '';
        const nombreLugar = normalizarNombre(nombreOriginal);
        
        let imagenLocal = null;
        // Buscar en mapeo determinístico por nombre original
        imagenLocal = mapeoImagenesDeterministico[nombreOriginal];
        
        // Si no se encontró, buscar en mapeo normalizado
        if (!imagenLocal) {
          imagenLocal = mapeoImagenesLocales[nombreLugar];
        }
        
        return {
          ...favorite,
          place: {
            ...place,
            // PRIORIDAD: imagen local -> imagen local del item -> placeholder local (NUNCA imagen de API)
            imagen: imagenLocal || place.imagen || '/imagenes/placeholder.jpg',
            // Eliminar image de la API
            image: null,
          }
        };
      });
      
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setMessage('Error al cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favoriteId, placeId) => {
    try {
      await favoritesService.remove(placeId);
      setMessage('Eliminado de favoritos');
      await loadFavorites();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      setMessage('Error al eliminar favorito');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Header2 />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          marginTop: '100px'
        }}>
          <p>Cargando favoritos...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header2 />
      <div className="favorites-container" style={{ marginTop: '100px' }}>
        <h1>Mis Favoritos</h1>

        {message && (
          <div style={{
            padding: "12px 20px",
            margin: "20px 0",
            backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
            color: message.includes("✅") ? "#155724" : "#721c24",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500"
          }}>
            {message}
          </div>
        )}

        {favorites.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: '#f8f9fa',
            borderRadius: '12px',
            marginTop: '30px'
          }}>
            <p style={{ fontSize: '1.2em', color: '#666', marginBottom: '20px' }}>
              No tienes lugares favoritos aún
            </p>
            <button 
              onClick={() => navigate('/lugares')}
              style={{
                padding: '12px 24px',
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Explorar Lugares
            </button>
          </div>
        ) : (
          <div className="contenedor">
            <div className="cards">
              {favorites.map((favorite) => {
                const place = favorite.place || {};
                return (
                  <div className="card" key={favorite.id}>
                    <img 
                      src={place.imagen || place.image || "/imagenes/placeholder.jpg"} 
                      alt={place.name || "Lugar"}
                      onError={(e) => {
                        e.target.src = "/imagenes/placeholder.jpg";
                      }}
                    />
                    <h4>{place.name || "Lugar sin nombre"}</h4>
                    <p className="ubicacion-text">{place.location || "Sin ubicación"}</p>
                    <p className="descripcion">
                      {place.description 
                        ? (place.description.length > 150 
                            ? place.description.substring(0, 150) + "..." 
                            : place.description)
                        : "Sin descripción disponible"}
                    </p>

                    <div className="card-actions">
                      <div className="action-buttons">
                        <a 
                          href="/mapa" 
                          className="map-button"
                          title="Ver en mapa"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                          </svg>
                          <span>Mapa</span>
                        </a>
                        <button 
                          className="info-button"
                          onClick={() => {
                            if (place.id) {
                              setReservationModal({ isOpen: true, place: place });
                            }
                          }}
                        >
                          Reservar Visita
                        </button>
                      </div>
                      <button 
                        className="favorito favorito-active" 
                        onClick={() => handleRemove(favorite.id, place.id || favorite.place_id)}
                        title="Quitar de favoritos"
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link to="/lugares">
            <button className="volver2">Volver a Lugares</button>
          </Link>
        </div>
      </div>

      {/* Modal de reserva */}
      {reservationModal.isOpen && reservationModal.place && (
        <ReservationModal
          place={reservationModal.place}
          isOpen={reservationModal.isOpen}
          onClose={() => setReservationModal({ isOpen: false, place: null })}
          onSuccess={(reservation) => {
            setMessage(`Reserva creada para ${reservationModal.place.name}`);
            setTimeout(() => setMessage(""), 3000);
          }}
        />
      )}

      <Footer />
    </>
  );
};

export default FavoritesPage;

