import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/react/context/AuthContext";
import { reviewsService, placesService } from "@/react/services/api";
import "./page.css";
import Header from "@/react/components/Header/Header";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import usuarioImg from "@/react/components/imagenes/usuario.jpg";

const CommentsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    place_id: "",
    rating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, placesData] = await Promise.all([
        reviewsService.getAll(),
        placesService.getAll(),
      ]);
      setReviews(reviewsData || []);
      setPlaces(placesData || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setMessage("Error al cargar las reseñas");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setMessage("Debes iniciar sesión para dejar una reseña");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    if (!formData.place_id) {
      setMessage("Por favor selecciona un lugar");
      return;
    }

    if (!formData.comment.trim()) {
      setMessage("Por favor escribe un comentario");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await reviewsService.create(formData);
      setMessage("✅ Reseña creada correctamente");
      setFormData({
        place_id: "",
        rating: 5,
        comment: "",
      });
      await loadData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error al crear reseña:", error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.place_id?.[0]
        || error.response?.data?.errors?.rating?.[0]
        || error.response?.data?.errors?.comment?.[0]
        || "Error al crear la reseña";
      setMessage(`❌ ${errorMessage}`);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((n) => (
      <i key={n} style={{ color: n <= rating ? '#ffc107' : '#ddd' }}>
        ★
      </i>
    ));
  };

  return (
    <div className="page-layout">
      {isAuthenticated && user ? <Header2 /> : <Header />}

      <div className="page-content contenedorTodo">
        {/* Sección de título */}
        <section className="review" id="review">
          <div className="middle-text">
            <h4>Nuestros Clientes</h4>
            <h2>Reseñas y Comentarios</h2>
          </div>
        </section>

        {message && (
          <div style={{
            padding: "12px 20px",
            margin: "20px 0",
            backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
            color: message.includes("✅") ? "#155724" : "#721c24",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
            animation: "slideDown 0.3s ease"
          }}>
            {message}
          </div>
        )}

        {/* Sección de reseñas */}
        <section className="review-content">
          {loading ? (
            <div style={{ 
              gridColumn: "1 / -1", 
              textAlign: "center", 
              padding: "40px",
              color: "#666"
            }}>
              <p>Cargando reseñas...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ 
              gridColumn: "1 / -1", 
              textAlign: "center", 
              padding: "40px",
              color: "#666"
            }}>
              <p style={{ fontSize: "1.2em" }}>Aún no hay reseñas. ¡Sé el primero en comentar!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div className="box" key={review.id}>
                <p>
                  {review.comment || "Sin comentario"}
                </p>
                {review.place && (
                  <p style={{ 
                    fontSize: "0.85rem", 
                    color: "#2ecc71", 
                    marginBottom: "10px",
                    fontWeight: "500"
                  }}>
                    📍 {review.place.name}
                    {review.place.location && ` - ${review.place.location}`}
                  </p>
                )}
                <div className="in-box">
                  <div className="bx-img">
                    <img 
                      src={review.usuario?.foto_perfil || usuarioImg} 
                      alt={review.usuario?.name || "Usuario"}
                      onError={(e) => {
                        e.target.src = usuarioImg;
                      }}
                    />
                  </div>
                  <div className="bxx-text">
                    <h4>{review.usuario?.name || "Usuario"}</h4>
                    <h5>
                      {review.comment 
                        ? (review.comment.length > 60 
                            ? review.comment.substring(0, 60) + "..." 
                            : review.comment)
                        : "Sin comentario"}
                    </h5>
                    <div className="ratings">
                      {renderStars(review.rating)}
                    </div>
                    {review.fecha_comentario && (
                      <p style={{ 
                        fontSize: "0.75rem", 
                        color: "#999", 
                        marginTop: "5px" 
                      }}>
                        {new Date(review.fecha_comentario).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Formulario de comentarios */}
        <form className="comentaarios" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: "20px", color: "#2c3e50" }}>
            {isAuthenticated ? "Deja tu reseña" : "Inicia sesión para dejar una reseña"}
          </h3>
          
          {isAuthenticated && (
            <>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="place_id" style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontWeight: "600",
                  color: "#2c3e50"
                }}>
                  Selecciona un lugar <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <select
                  id="place_id"
                  name="place_id"
                  value={formData.place_id}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    background: "#fff"
                  }}
                >
                  <option value="">-- Selecciona un lugar --</option>
                  {places.map(place => (
                    <option key={place.id} value={place.id}>
                      {place.name} {place.location ? `- ${place.location}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontWeight: "600",
                  color: "#2c3e50"
                }}>
                  Calificación <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} style={{ cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="rating"
                        value={n}
                        checked={formData.rating === n}
                        onChange={handleInputChange}
                        disabled={submitting}
                        style={{ display: "none" }}
                      />
                      <i style={{ 
                        fontSize: "2rem", 
                        color: formData.rating >= n ? "#ffc107" : "#ddd",
                        transition: "color 0.2s"
                      }}>
                        ★
                      </i>
                    </label>
                  ))}
                  <span style={{ marginLeft: "10px", color: "#666" }}>
                    {formData.rating} estrella{formData.rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="input-container textarea focus">
            <textarea
              name="comment"
              className="input"
              placeholder={isAuthenticated ? "Déjanos tu comentario:" : "Inicia sesión para dejar un comentario"}
              value={formData.comment}
              onChange={handleInputChange}
              required={isAuthenticated}
              disabled={submitting || !isAuthenticated}
              maxLength={500}
            ></textarea>
            {isAuthenticated && (
              <div style={{ 
                textAlign: "right", 
                fontSize: "0.85rem", 
                color: formData.comment.length > 500 ? '#d7263c' : '#999',
                marginTop: "5px"
              }}>
                {formData.comment.length}/500 caracteres
              </div>
            )}
          </div>
          
          <div className="buttons-container">
            <Link to="/">
              <button type="button" className="volver" disabled={submitting}>
                Volver
              </button>
            </Link>
<<<<<<< Updated upstream
            <button
              type="submit"
              className="btn"
=======
            <input 
              type="submit" 
              value={submitting ? "Enviando..." : (isAuthenticated ? "Enviar" : "Iniciar Sesión")} 
              className="btn-enviar"
>>>>>>> Stashed changes
              disabled={submitting}
              aria-disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Enviando...
                </>
              ) : (
                (isAuthenticated ? "Enviar" : "Iniciar Sesión")
              )}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CommentsPage;
