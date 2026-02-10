import React, { useState, useEffect } from 'react';
import { companyService } from '../services/api';
import RejectReservationModal from './RejectReservationModal';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({ pendientes: 0, aceptadas: 0, rechazadas: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendiente');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    loadReservations();
    loadRejectionReasons();
  }, [filter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await companyService.reservations.getAll({ estado: filter });
      setReservations(data.data || []);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      showMessage('Error al cargar reservas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRejectionReasons = async () => {
    try {
      const data = await companyService.rejectionReasons.getAll();
      setRejectionReasons(data || []);
    } catch (error) {
      console.error('Error cargando razones de rechazo:', error);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAccept = async (reservation) => {
    try {
      setLoading(true);
      await companyService.reservations.accept(reservation.id);
      showMessage('Reserva aceptada correctamente', 'success');
      loadReservations();
    } catch (error) {
      showMessage('Error al aceptar reserva', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async (formData) => {
    try {
      setRejecting(true);
      await companyService.reservations.reject(selectedReservation.id, formData);
      showMessage('Reserva rechazada correctamente', 'success');
      setShowRejectModal(false);
      setSelectedReservation(null);
      loadReservations();
    } catch (error) {
      showMessage('Error al rechazar reserva', 'error');
    } finally {
      setRejecting(false);
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time.substring(0, 5);
  };

  if (loading && reservations.length === 0) {
    return <div className="company-dashboard loading">Cargando...</div>;
  }

  return (
    <div className="company-dashboard">
      <div className="dashboard-header">
        <h1>Mi Panel de Reservas</h1>
        <p>Gestiona las reservas de tus lugares</p>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-container">
        <div className={`stat-card ${filter === 'pendiente' ? 'active' : ''}`} onClick={() => setFilter('pendiente')}>
          <div className="stat-value">{stats.pendientes}</div>
          <div className="stat-label">Pendientes</div>
        </div>
        <div className={`stat-card ${filter === 'aceptada' ? 'active' : ''}`} onClick={() => setFilter('aceptada')}>
          <div className="stat-value">{stats.aceptadas}</div>
          <div className="stat-label">Aceptadas</div>
        </div>
        <div className={`stat-card ${filter === 'rechazada' ? 'active' : ''}`} onClick={() => setFilter('rechazada')}>
          <div className="stat-value">{stats.rechazadas}</div>
          <div className="stat-label">Rechazadas</div>
        </div>
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'pendiente' ? 'active' : ''}`}
          onClick={() => setFilter('pendiente')}
        >
          Pendientes
        </button>
        <button
          className={`tab ${filter === 'aceptada' ? 'active' : ''}`}
          onClick={() => setFilter('aceptada')}
        >
          Aceptadas
        </button>
        <button
          className={`tab ${filter === 'rechazada' ? 'active' : ''}`}
          onClick={() => setFilter('rechazada')}
        >
          Rechazadas
        </button>
      </div>

      {/* Reservations List */}
      <div className="reservations-list">
        {reservations.length === 0 ? (
          <div className="empty-state">
            <p>No hay reservas en esta categoría</p>
          </div>
        ) : (
          reservations.map(companyRes => {
            const reservation = companyRes.reservation;
            return (
              <div key={companyRes.id} className="reservation-card">
                <div className="card-header">
                  <h3>{reservation.place?.name}</h3>
                  <span className={`status-badge status-${companyRes.estado}`}>
                    {companyRes.estado.charAt(0).toUpperCase() + companyRes.estado.slice(1)}
                  </span>
                </div>

                <div className="card-body">
                  <div className="reservation-details">
                    <div className="detail">
                      <strong>Cliente:</strong> {reservation.usuario?.name}
                    </div>
                    <div className="detail">
                      <strong>Email:</strong> {reservation.usuario?.email}
                    </div>
                    <div className="detail">
                      <strong>Teléfono:</strong> {reservation.telefono_contacto || 'No proporcionado'}
                    </div>
                    <div className="detail">
                      <strong>Fecha de Visita:</strong> {formatDate(reservation.fecha_visita)}
                    </div>
                    <div className="detail">
                      <strong>Hora:</strong> {formatTime(reservation.hora_visita)}
                    </div>
                    <div className="detail">
                      <strong>Personas:</strong> {reservation.personas}
                    </div>
                    {reservation.comentarios && (
                      <div className="detail">
                        <strong>Comentarios:</strong> {reservation.comentarios}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {companyRes.estado === 'pendiente' && (
                  <div className="card-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleAccept(companyRes)}
                      disabled={loading}
                    >
                      ✓ Aceptar
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setSelectedReservation(companyRes);
                        setShowRejectModal(true);
                      }}
                      disabled={loading}
                    >
                      ✕ Rechazar
                    </button>
                  </div>
                )}

                {companyRes.estado === 'rechazada' && companyRes.rejectionReason && (
                  <div className="rejection-info">
                    <strong>Razón del rechazo:</strong> {companyRes.rejectionReason?.descripcion}
                    {companyRes.comentario_rechazo && (
                      <p className="rejection-comment">{companyRes.comentario_rechazo}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedReservation && filter !== 'pendiente' && (
        <div className="modal-overlay" onClick={() => setSelectedReservation(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Reserva</h2>
              <button className="modal-close" onClick={() => setSelectedReservation(null)}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Lugar:</strong> {selectedReservation.reservation?.place?.name}
                </div>
                <div className="detail-item">
                  <strong>Cliente:</strong> {selectedReservation.reservation?.usuario?.name}
                </div>
                <div className="detail-item">
                  <strong>Email:</strong> {selectedReservation.reservation?.usuario?.email}
                </div>
                <div className="detail-item">
                  <strong>Teléfono:</strong> {selectedReservation.reservation?.telefono_contacto}
                </div>
                <div className="detail-item">
                  <strong>Fecha de Visita:</strong> {formatDate(selectedReservation.reservation?.fecha_visita)}
                </div>
                <div className="detail-item">
                  <strong>Hora:</strong> {formatTime(selectedReservation.reservation?.hora_visita)}
                </div>
                <div className="detail-item">
                  <strong>Número de Personas:</strong> {selectedReservation.reservation?.personas}
                </div>
                <div className="detail-item">
                  <strong>Estado:</strong> {selectedReservation.estado}
                </div>
              </div>

              {selectedReservation.reservation?.comentarios && (
                <div className="comments-section">
                  <strong>Comentarios del cliente:</strong>
                  <p>{selectedReservation.reservation?.comentarios}</p>
                </div>
              )}

              {selectedReservation.estado === 'rechazada' && selectedReservation.rejectionReason && (
                <div className="rejection-section">
                  <strong>Motivo del rechazo:</strong>
                  <p>{selectedReservation.rejectionReason?.descripcion}</p>
                  {selectedReservation.comentario_rechazo && (
                    <p className="additional-comment">{selectedReservation.comentario_rechazo}</p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedReservation(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <RejectReservationModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onReject={handleRejectSubmit}
        loading={rejecting}
        rejectionReasons={rejectionReasons}
      />
    </div>
  );
};

export default CompanyDashboard;
