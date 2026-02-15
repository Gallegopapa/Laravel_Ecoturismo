import React, { useState, useEffect } from "react";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import { reviewsService } from "../../services/api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header/Header";
import Header2 from "../../components/Header2/Header2";
import Footer from "../../components/Footer/Footer";
import "../../places/page.css";
import "./detail.css";

const EcohotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [ecohotel, setEcohotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average: null, count: 0 });

  console.log('🏨 Cargando ecohotel con ID:', id);


  useEffect(() => {
    loadEcohotelDetail();
    loadReviews();
  }, [id]);

  const loadReviews = async () => {
    try {
      const res = await reviewsService.getByEcohotel(id);
      setReviews(res.reviews || []);
      setReviewStats({ average: res.average, count: res.count });
    } catch (e) {
      setReviews([]);
      setReviewStats({ average: null, count: 0 });
    }
  };

  const loadEcohotelDetail = async () => {
    try {
      setLoading(true);
      console.log('🌐 Haciendo fetch a:', `/api/ecohotels/${id}`);
      const response = await fetch(`/api/ecohotels/${id}`);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error response:', errorData);
        throw new Error("Ecohotel no encontrado");
      }
      
      const data = await response.json();
      setEcohotel(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar ecohotel:", error);
      setError(error.message || "Error al cargar el ecohotel");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-layout">
        {isAuthenticated ? <Header2 /> : <Header />}
        <div className="page-content">
          <div className="loading">Cargando detalles del ecohotel...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !ecohotel) {
    return (
      <div className="page-layout">
        {isAuthenticated ? <Header2 /> : <Header />}
        <div className="page-content">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error || "Ecohotel no encontrado"}</p>
            <Link to="/ecohoteles" className="btn-back">
              Volver a Ecohoteles
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-layout">
      {isAuthenticated ? <Header2 /> : <Header />}
      <main className="page-content">
        <div className="detail-container">
          <div className="detail-header">
            <Link to="/ecohoteles" className="btn-back">
              ← Volver a Ecohoteles
            </Link>
            <h1>{ecohotel.name}</h1>
          </div>
          <div className="ecohotel-detail-content-grid">
            <div className="ecohotel-detail-left">
              <div className="detail-image">
                <img
                  src={ecohotel.image || "/imagenes/placeholder.jpg"}
                  alt={ecohotel.name}
                  onError={(e) => {
                    e.target.src = "/imagenes/placeholder.jpg";
                  }}
                />
              </div>
            </div>
            <div className="ecohotel-detail-right">
              <div className="detail-info">
                {/* Reseñas y promedio */}
                <div className="info-section" style={{ marginBottom: 32 }}>
                  <h2 style={{ marginBottom: 12 }}>Reseñas de visitantes</h2>
                  {reviewStats.count > 0 ? (
                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: 22, color: '#ffc107', fontWeight: 700 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < Math.round(reviewStats.average) ? '★' : '☆'}</span>
                        ))}
                      </span>
                      <span style={{ marginLeft: 12, color: '#333', fontWeight: 500 }}>
                        {reviewStats.average?.toFixed(1)} / 5 &nbsp;·&nbsp; {reviewStats.count} reseña{reviewStats.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ) : (
                    <div style={{ color: '#888', fontStyle: 'italic' }}>Aún no hay reseñas para este ecohotel.</div>
                  )}
                  <ReviewForm
                    ecohotelId={id}
                    user={user}
                    isAuthenticated={isAuthenticated}
                    onReviewAdded={loadReviews}
                  />
                  {/* Lista de reseñas */}
                  {reviews.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      {reviews.map((review) => (
                        <div key={review.id} style={{ borderBottom: '1px solid #eee', padding: '14px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={review.usuario?.foto_perfil || '/imagenes/usuario.jpg'} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <strong>{review.usuario?.name || 'Usuario'}</strong>
                              <div style={{ fontSize: 13, color: '#888' }}>{review.fecha_comentario ? new Date(review.fecha_comentario).toLocaleDateString() : ''}</div>
                            </div>
                          </div>
                          <div style={{ marginTop: 6, marginBottom: 4, color: '#ffc107', fontSize: 18 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
                          <div style={{ fontSize: 15, color: '#222', marginBottom: 4 }}>{review.comment}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="info-section">
                  <h2>Información General</h2>
                  {ecohotel.description && (
                    <div className="info-item">
                      <strong>Descripción:</strong>
                      <p>{ecohotel.description}</p>
                    </div>
                  )}
                  {ecohotel.location && (
                    <div className="info-item">
                      <strong>📍 Ubicación:</strong>
                      <p>{ecohotel.location}</p>
                    </div>
                  )}
                  {ecohotel.telefono ? (
                    <div className="info-item">
                      <strong>📞 Teléfono:</strong>
                      <p>
                        <a href={`tel:${ecohotel.telefono}`}>{ecohotel.telefono}</a>
                      </p>
                    </div>
                  ) : (
                    <div className="info-item">
                      <strong>📞 Teléfono:</strong>
                      <p className="no-info">No hay información disponible</p>
                    </div>
                  )}
                  {ecohotel.email ? (
                    <div className="info-item">
                      <strong>📧 Email:</strong>
                      <p>
                        <a href={`mailto:${ecohotel.email}`}>{ecohotel.email}</a>
                      </p>
                    </div>
                  ) : (
                    <div className="info-item">
                      <strong>📧 Email:</strong>
                      <p className="no-info">No hay información disponible</p>
                    </div>
                  )}
                  {ecohotel.sitio_web ? (
                    <div className="info-item">
                      <strong>🌐 Sitio Web:</strong>
                      <p>
                        <a href={ecohotel.sitio_web} target="_blank" rel="noopener noreferrer">
                          Visitar sitio web
                        </a>
                      </p>
                    </div>
                  ) : (
                    <div className="info-item">
                      <strong>🌐 Sitio Web:</strong>
                      <p className="no-info">No hay información disponible</p>
                    </div>
                  )}
                  {ecohotel.categories && ecohotel.categories.length > 0 && (
                    <div className="info-item">
                      <strong>Categorías:</strong>
                      <div className="categories-tags">
                        {ecohotel.categories.map((cat) => (
                          <span key={cat.id} className="category-tag">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {ecohotel.latitude && ecohotel.longitude && (
                  <div className="info-section">
                    <h2>Ubicación en el Mapa</h2>
                    <div className="map-container" style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,95,45,0.08)', marginBottom: 10 }}>
                      <iframe
                        src={`https://www.google.com/maps?q=${ecohotel.latitude},${ecohotel.longitude}&z=15&output=embed`}
                        width="100%"
                        height="260"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Mapa del ecohotel"
                      />
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${ecohotel.latitude},${ecohotel.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link-button"
                      style={{ display: 'inline-block', background: '#24a148', color: '#fff', padding: '10px 22px', borderRadius: 8, fontWeight: 600, textDecoration: 'none', marginTop: 2 }}
                    >
                      🚗 Cómo llegar
                    </a>
                  </div>
                )}
                {/* Lugares relacionados */}
                <div className="related-section">
                  <h2 style={{ marginTop: 40, marginBottom: 20, color: '#1c1c1a', borderBottom: '2px solid #24a148', paddingBottom: 10 }}>
                    🌄 Lugares cercanos
                  </h2>
                  {ecohotel.places && ecohotel.places.length > 0 ? (
                    <div className="related-cards-grid">
                      {ecohotel.places.map(place => (
                        <Link
                          to={`/lugares/${place.id}`}
                          key={place.id}
                          className="related-card"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <div className="related-card-image-wrapper">
                            <img
                              src={place.image || '/imagenes/placeholder.jpg'}
                              alt={place.name}
                              className="related-card-image"
                              onError={e => { e.target.src = '/imagenes/placeholder.jpg'; }}
                            />
                          </div>
                          <div className="related-card-title">{place.name}</div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#888', fontStyle: 'italic', marginTop: 12 }}>
                      No hay lugares relacionados para este ecohotel.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EcohotelDetailPage;
