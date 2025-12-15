import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/react/context/AuthContext';
import { placesService, favoritesService, reviewsService } from '@/react/services/api';
import Header from '@/react/components/Header/Header';
import Header2 from '@/react/components/Header2/Header2';
import Footer from '@/react/components/Footer/Footer';
import ReservationModal from '@/react/components/ReservationModal';
import usuarioImg from '@/react/components/imagenes/usuario.jpg';
import './page.css';

const PlaceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    'Reserva Natural DMI Agualinda': '/imagenes/dmi2.jpg',
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
    'reserva natural dmi agualinda': '/imagenes/dmi2.jpg',
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
    if (id) {
      loadPlace();
      if (isAuthenticated) {
        checkFavorite();
      }
    }
  }, [id, isAuthenticated]);

  const loadPlace = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await placesService.getById(id);
      // El API puede devolver { place: {...} } o directamente el lugar
      let placeData = response.place || response;
      
      // Priorizar imágenes locales sobre imágenes de API
      const nombreOriginal = placeData.name || '';
      const nombreLugar = normalizarNombre(nombreOriginal);
      
      let imagenLocal = null;
      // Buscar en mapeo determinístico por nombre original
      imagenLocal = mapeoImagenesDeterministico[nombreOriginal];
      
      // Si no se encontró, buscar en mapeo normalizado
      if (!imagenLocal) {
        imagenLocal = mapeoImagenesLocales[nombreLugar];
      }
      
      // Asignar imagen local prioritaria
      placeData = {
        ...placeData,
        imagen: imagenLocal || placeData.imagen || '/imagenes/placeholder.jpg',
        image: null, // Eliminar imagen de API
      };
      
      setPlace(placeData);
      await loadReviews(placeData.id);
    } catch (err) {
      console.error('Error al cargar lugar:', err);
      setError('No se pudo cargar la información del lugar.');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (placeId) => {
    try {
      const data = await reviewsService.getByPlace(placeId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar reseñas:', err);
    }
  };

  const checkFavorite = async () => {
    try {
      const favorite = await favoritesService.check(id);
      setIsFavorite(favorite);
    } catch (err) {
      console.error('Error al verificar favorito:', err);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setMessage('Debes iniciar sesión para agregar a favoritos');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      if (isFavorite) {
        await favoritesService.remove(id);
        setIsFavorite(false);
        setMessage('Eliminado de favoritos');
      } else {
        await favoritesService.add(id);
        setIsFavorite(true);
        setMessage('Agregado a favoritos');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
      setMessage('Error al actualizar favorito');
      setTimeout(() => setMessage(''), 3000);
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
          <p>Cargando información del lugar...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !place) {
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
          <p style={{ color: '#e74c3c', fontSize: '18px' }}>
            {error || 'Lugar no encontrado'}
          </p>
          <Link 
            to="/lugares"
            style={{
              padding: '10px 20px',
              background: '#2ecc71',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          >
            Volver a Lugares
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {isAuthenticated && user ? <Header2 /> : <Header />}
      <div className="place-detail-container" style={{ marginTop: '100px' }}>
        {message && (
          <div className={`detail-message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="place-detail-header">
          <Link to="/lugares" className="back-button">
            ← Volver a Lugares
          </Link>
          <div className="place-header-actions">
            {isAuthenticated && (
              <button 
                onClick={toggleFavorite}
                className={`favorite-button ${isFavorite ? 'active' : ''}`}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                {isFavorite ? '❤️' : '🤍'} {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
              </button>
            )}
            {place.latitude && place.longitude && (
              <a 
                href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="map-link-button"
              >
                🗺️ Ver en Google Maps
              </a>
            )}
          </div>
        </div>

        <div className="place-detail-content">
          <div className="place-detail-main">
            <div className="place-image-section">
              <img 
                src={place.imagen || place.image || '/imagenes/placeholder.jpg'} 
                alt={place.name}
                className="place-main-image"
                onError={(e) => {
                  e.target.src = '/imagenes/placeholder.jpg';
                }}
              />
            </div>

            <div className="place-info-section">
              <h1 className="place-title">{place.name}</h1>
              
              {place.location && (
                <div className="place-location">
                  <span className="location-icon">📍</span>
                  <span>{place.location}</span>
                </div>
              )}

              {place.latitude && place.longitude && (
                <div className="place-coordinates">
                  <span className="coords-label">Coordenadas:</span>
                  <span className="coords-value">
                    {parseFloat(place.latitude).toFixed(6)}, {parseFloat(place.longitude).toFixed(6)}
                  </span>
                </div>
              )}

              {place.categories && place.categories.length > 0 && (
                <div className="place-categories">
                  {place.categories.map(cat => (
                    <span key={cat.id} className="category-badge">
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {place.description && (
                <div className="place-description">
                  <h2>Descripción</h2>
                  <p>{place.description}</p>
                </div>
              )}

              <div className="place-actions">
                <button 
                  onClick={() => {
                    if (isAuthenticated) {
                      setReservationModal({ isOpen: true, place: place });
                    } else {
                      setMessage('Debes iniciar sesión para reservar');
                      setTimeout(() => navigate('/login'), 1500);
                    }
                  }}
                  className="reserve-button"
                >
                  📅 Reservar Visita
                </button>
              </div>
            </div>
          </div>

          {/* Sección de Reseñas */}
          <div className="place-reviews-section">
            <h2>Reseñas y Comentarios</h2>
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <p>No hay reseñas aún. ¡Sé el primero en comentar!</p>
                {isAuthenticated && (
                  <Link to="/comentarios2" className="add-review-link">
                    Agregar Reseña
                  </Link>
                )}
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <img 
                        src={review.usuario?.foto_perfil || usuarioImg} 
                        alt={review.usuario?.name || 'Usuario'}
                        className="review-avatar"
                        onError={(e) => {
                          e.target.src = usuarioImg;
                        }}
                      />
                      <div className="review-user-info">
                        <h4>{review.usuario?.name || 'Usuario Anónimo'}</h4>
                        <div className="review-rating">
                          {'⭐'.repeat(review.rating || 0)}
                        </div>
                        {review.fecha_comentario && (
                          <span className="review-date">
                            {new Date(review.fecha_comentario).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
                {reviews.length > 5 && (
                  <Link to="/comentarios2" className="view-all-reviews">
                    Ver todas las reseñas ({reviews.length})
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Reserva */}
      {reservationModal.isOpen && reservationModal.place && (
        <ReservationModal
          place={reservationModal.place}
          isOpen={reservationModal.isOpen}
          onClose={() => setReservationModal({ isOpen: false, place: null })}
        />
      )}

      <Footer />
    </>
  );
};

export default PlaceDetailPage;

