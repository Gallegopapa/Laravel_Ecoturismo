import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/react/context/AuthContext";
import { reviewsService, placesService } from "@/react/services/api";
import "./page.css";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import usuarioImg from "@/react/components/imagenes/usuario.jpg";

const Comments2Page = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
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
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

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

  const handleDelete = async (reviewId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta reseña?")) {
      return;
    }

    try {
      await reviewsService.delete(reviewId);
      setMessage("✅ Reseña eliminada correctamente");
      await loadData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error al eliminar reseña:", error);
      setMessage("❌ Error al eliminar la reseña");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((n) => (
      <i key={n} style={{ color: n <= rating ? '#ffc107' : '#ddd' }}>
        ★
      </i>
    ));
  };

  if (authLoading || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Header2 />

      <div className="contenedorTodo">
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
          {reviews.length === 0 ? (
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
                    <img src={usuarioImg} alt={review.usuario?.name || "Usuario"} />
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
                    {user && review.usuario && user.id === review.usuario.id && (
                      <button
                        onClick={() => handleDelete(review.id)}
                        style={{
                          marginTop: "10px",
                          padding: "5px 15px",
                          background: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "0.85rem"
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Formulario de comentarios */}
        <form className="comentaarios" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: "20px", color: "#2c3e50" }}>Deja tu reseña</h3>
          
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

          <div className="input-container textarea focus">
            <textarea
              name="comment"
              className="input"
              placeholder="Déjanos tu comentario:"
              value={formData.comment}
              onChange={handleInputChange}
              required
              disabled={submitting}
              maxLength={1000}
            ></textarea>
            <div style={{ 
              textAlign: "right", 
              fontSize: "0.85rem", 
              color: "#999",
              marginTop: "5px"
            }}>
              {formData.comment.length}/1000 caracteres
            </div>
          </div>
          
          <div className="buttons-container">
            <Link to="/pagLogueados">
              <button type="button" className="volver" disabled={submitting}>
                Volver
              </button>
            </Link>
            <input 
              type="submit" 
              value={submitting ? "Enviando..." : "Enviar"} 
              className="btn"
              disabled={submitting}
            />
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default Comments2Page;
