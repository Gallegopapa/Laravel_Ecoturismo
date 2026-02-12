import React, { useState } from 'react';
import { reviewsService } from '@/react/services/api';
import usuarioImg from '@/react/components/imagenes/usuario.jpg';
import './ReviewForm.css';

const ReviewForm = ({ placeId, user, isAuthenticated, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const charLimit = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!placeId) {
      setError('Error: No se pudo identificar el lugar');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setError('Por favor selecciona una calificación de 1 a 5 estrellas');
      return;
    }

    if (!comment.trim()) {
      setError('Por favor escribe un comentario');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reviewData = {
        place_id: placeId,
        rating: parseInt(rating),
        comment: comment.trim()
      };

      await reviewsService.create(reviewData);
      
      setComment('');
      setRating(5);
      setSuccess('¡Reseña agregada exitosamente!');
      
      // Llamar callback para refrescar la lista
      if (onReviewAdded) {
        onReviewAdded();
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error al agregar reseña:', error);
      setError(error.message || 'Error al agregar la reseña. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="review-form-container">
        <div className="auth-required">
          <p>Debes iniciar sesión para agregar una reseña</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-form-container">
      <h3>Comparte tu experiencia</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Calificación</label>
          <div className="rating-input" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: rating >= star ? '#ffc107' : '#ddd',
                  padding: '0',
                  marginRight: '4px',
                  transition: 'color 0.2s'
                }}
              >
                ★
              </button>
            ))}
            <span className="rating-label" style={{ marginLeft: '8px', fontSize: '0.9rem', color: '#666' }}>{rating} de 5 estrellas</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Comentario</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, charLimit))}
            placeholder="Comparte tu experiencia en este lugar..."
            rows="4"
            maxLength={charLimit}
          />
          <div className="char-count">
            {comment.length}/{charLimit}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Publicar Reseña'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
