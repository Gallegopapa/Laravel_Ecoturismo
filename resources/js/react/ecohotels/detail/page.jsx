import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header/Header";
import Header2 from "../../components/Header2/Header2";
import Footer from "../../components/Footer/Footer";
import "./detail.css";

const EcohotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [ecohotel, setEcohotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log('🏨 Cargando ecohotel con ID:', id);

  useEffect(() => {
    loadEcohotelDetail();
  }, [id]);

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

          <div className="detail-content">
            <div className="detail-image">
              <img
                src={ecohotel.image || "/imagenes/placeholder.jpg"}
                alt={ecohotel.name}
                onError={(e) => {
                  e.target.src = "/imagenes/placeholder.jpg";
                }}
              />
            </div>

            <div className="detail-info">
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

                {ecohotel.telefono && (
                  <div className="info-item">
                    <strong>📞 Teléfono:</strong>
                    <p>
                      <a href={`tel:${ecohotel.telefono}`}>{ecohotel.telefono}</a>
                    </p>
                  </div>
                )}

                {ecohotel.email && (
                  <div className="info-item">
                    <strong>📧 Email:</strong>
                    <p>
                      <a href={`mailto:${ecohotel.email}`}>{ecohotel.email}</a>
                    </p>
                  </div>
                )}

                {ecohotel.sitio_web && (
                  <div className="info-item">
                    <strong>🌐 Sitio Web:</strong>
                    <p>
                      <a href={ecohotel.sitio_web} target="_blank" rel="noopener noreferrer">
                        Visitar sitio web
                      </a>
                    </p>
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
                  <div className="map-container">
                    <iframe
                      src={`https://www.google.com/maps?q=${ecohotel.latitude},${ecohotel.longitude}&z=15&output=embed`}
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EcohotelDetailPage;
