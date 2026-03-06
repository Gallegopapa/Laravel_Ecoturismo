import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
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
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    place_id: "",
    rating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({
    place_id: "",
    rating: 5,
    comment: "",
  });
  const textareaRef = useRef(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    loadData();
  }, [isAuthenticated, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsResult, placesResult] = await Promise.allSettled([
        reviewsService.getAll(),
        placesService.getOptions(),
      ]);

      const nextReviews =
        reviewsResult.status === "fulfilled" && Array.isArray(reviewsResult.value)
          ? reviewsResult.value
          : [];

      const rawPlaces =
        placesResult.status === "fulfilled" && Array.isArray(placesResult.value)
          ? placesResult.value
          : [];

      const normalizedPlaces = rawPlaces
        .map((place) => ({
          id: place?.id ?? place?.place_id ?? "",
          name: place?.name ?? place?.nombre ?? "",
          location: place?.location ?? place?.ubicacion ?? "",
        }))
        .filter((place) => place.id && place.name);

      const fallbackPlacesFromReviews = Array.from(
        new Map(
          nextReviews
            .filter((review) => review?.place?.id && review?.place?.name)
            .map((review) => [
              review.place.id,
              {
                id: review.place.id,
                name: review.place.name,
                location: review.place.location ?? "",
              },
            ])
        ).values()
      );

      setReviews(nextReviews);
      setPlaces(normalizedPlaces.length > 0 ? normalizedPlaces : fallbackPlacesFromReviews);

      if (placesResult.status === "rejected") {
        console.error("Error al cargar lugares:", placesResult.reason);
        setFormError("No se pudieron cargar los lugares. Intenta recargar la página.");
      }

      if (reviewsResult.status === "rejected") {
        console.error("Error al cargar reseñas:", reviewsResult.reason);
        if (placesResult.status !== "rejected") {
          setMessage("No se pudieron cargar algunas reseñas, pero puedes crear una nueva.");
        } else {
          setMessage("Error al cargar las reseñas");
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setMessage("Error al cargar las reseñas");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormError("");
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.place_id) {
      setFormError("Por favor selecciona un lugar");
      return;
    }

    if (!formData.comment.trim()) {
      setFormError("Por favor escribe un comentario");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setFormError("");

    try {
      await reviewsService.create(formData);
      setMessage("✅ Reseña creada correctamente");
      setFormError("");
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
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (review) => {
    setEditingReviewId(review.id);
    setEditForm({
      place_id: review.place_id || review.place?.id || "",
      rating: review.rating || 5,
      comment: review.comment || "",
    });
    setFormError("");
    setMessage("");
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormError("");
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingReviewId) return;

    if (!editForm.place_id) {
      setFormError("Por favor selecciona un lugar");
      return;
    }

    if (!editForm.comment.trim()) {
      setFormError("Por favor escribe un comentario");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setFormError("");

    try {
      await reviewsService.update(editingReviewId, {
        place_id: editForm.place_id,
        rating: editForm.rating,
        comment: editForm.comment,
      });
      setMessage("✅ Reseña actualizada correctamente");
      setFormError("");
      setEditingReviewId(null);
      await loadData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error al actualizar reseña:", error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.place_id?.[0]
        || error.response?.data?.errors?.rating?.[0]
        || error.response?.data?.errors?.comment?.[0]
        || "Error al actualizar la reseña";
      setFormError(errorMessage);
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
      const errorMessage = error.response?.data?.message || "Error al eliminar la reseña";
      setMessage(`❌ ${errorMessage}`);
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

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="page-layout">
        <Header2 />
        <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>Cargando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const activeForm = editingReviewId ? editForm : formData;
  const activeRating = editingReviewId ? editForm.rating : formData.rating;

  return (
    <div className="page-layout">
      <Header2 />

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
                {/* Título: nombre del lugar/ecohotel, clickeable */}
                {review.place && (
                  <h3 style={{
                    margin: "0 0 8px 0",
                    color: "#1976d2",
                    fontSize: "1.15rem",
                    fontWeight: "700",
                  }}>
                    <Link to={`/lugares/${review.place.id}`} style={{color:'#1976d2',textDecoration:'none',cursor:'pointer'}}>{review.place.name}</Link>
                    {review.place.location && (
                      <span style={{color:'#2ecc71',fontWeight:500,fontSize:'0.95rem'}}> - {review.place.location}</span>
                    )}
                  </h3>
                )}
                {review.ecohotel && (
                  <h3 style={{
                    margin: "0 0 8px 0",
                    color: "#1976d2",
                    fontSize: "1.15rem",
                    fontWeight: "700",
                  }}>
                    <Link to={`/ecohoteles/${review.ecohotel.id}`} style={{color:'#1976d2',textDecoration:'underline',cursor:'pointer'}}>{review.ecohotel.name}</Link>
                    {review.ecohotel.location && (
                      <span style={{color:'#2ecc71',fontWeight:500,fontSize:'0.95rem'}}> - {review.ecohotel.location}</span>
                    )}
                  </h3>
                )}
                
                {/* Información del usuario */}
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
                    <h4 style={{ fontWeight: 700 }}>{review.usuario?.name || "Usuario"}</h4>
                    <div style={{ color: "#333", fontWeight: 400, fontSize: "1.05rem", margin: "2px 0 6px 0" }}>
                      {review.comment || "Sin comentario"}
                    </div>
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
                
                {/* Botones de acción */}
                <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {/* Botón de editar solo para el autor */}
                  {user && review.usuario && user.id === review.usuario.id && (
                    <button
                      type="button"
                      onClick={() => startEdit(review)}
                      style={{
                        padding: "8px 16px",
                        background: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "500"
                      }}
                    >
                      Editar
                    </button>
                  )}
                  {/* Botón de eliminar para autor o admin */}
                  {user && (
                    (review.usuario && user.id === review.usuario.id) || user.is_admin
                  ) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      style={{
                        padding: "8px 16px",
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "500"
                      }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Formulario de comentarios */}
        <form className="comentaarios" onSubmit={editingReviewId ? handleEditSubmit : handleSubmit}>
          <h3 style={{ marginBottom: "20px", color: "#2c3e50" }}>
            {editingReviewId ? "✏️ Editar tu reseña" : "Deja tu reseña"}
          </h3>
          
          {editingReviewId && (
            <div style={{
              padding: "12px",
              backgroundColor: "#e8f4f8",
              border: "2px solid #3498db",
              borderRadius: "8px",
              marginBottom: "15px",
              color: "#3498db",
              fontSize: "0.9rem"
            }}>
              ℹ️ Estás editando tu reseña. Guarda los cambios cuando termines.
            </div>
          )}
          
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
              value={editingReviewId ? editForm.place_id : formData.place_id}
              onChange={editingReviewId ? handleEditChange : handleInputChange}
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
              {places.length === 0 && (
                <option value="" disabled>
                  No hay lugares disponibles
                </option>
              )}
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
                    checked={activeRating === n}
                    onChange={editingReviewId ? handleEditChange : handleInputChange}
                    disabled={submitting}
                    style={{ display: "none" }}
                  />
                  <i style={{ 
                    fontSize: "2rem", 
                    color: activeRating >= n ? "#ffc107" : "#ddd",
                    transition: "color 0.2s"
                  }}>
                    ★
                  </i>
                </label>
              ))}
              <span style={{ marginLeft: "10px", color: "#666" }}>
                {activeRating} estrella{activeRating !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="input-container textarea focus">
            <textarea
              ref={textareaRef}
              name="comment"
              className="input"
              placeholder={editingReviewId ? "Edita tu comentario:" : "Déjanos tu comentario:"}
              value={editingReviewId ? editForm.comment : formData.comment}
              onChange={editingReviewId ? handleEditChange : handleInputChange}
              required
              disabled={submitting}
              maxLength={500}
            ></textarea>
            <div style={{ 
              textAlign: "right", 
              fontSize: "0.85rem", 
              color: activeForm.comment.length > 500 ? '#d7263c' : '#999',
              marginTop: "5px"
            }}>
              {activeForm.comment.length}/500 caracteres
            </div>
            {formError && (
              <div style={{
                marginTop: "8px",
                color: "#d7263c",
                fontWeight: "600"
              }}>
                {formError}
              </div>
            )}
          </div>
          
          <div className="buttons-container" style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/pagLogueados">
                <button type="button" className="volver" disabled={submitting}>
                  Volver
                </button>
              </Link>
              {editingReviewId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingReviewId(null);
                    setEditForm({ place_id: "", rating: 5, comment: "" });
                    setFormError("");
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#95a5a6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "500"
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </button>
              )}
            </div>
            <input 
              type="submit" 
              value={submitting ? "Guardando..." : (editingReviewId ? "Guardar cambios" : "Enviar")} 
              className="btn"
              disabled={submitting}
            />
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Comments2Page;
