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
  const [placesManaged, setPlacesManaged] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    dia_semana: 'lunes',
    hora_inicio: '08:00',
    hora_fin: '17:00',
    activo: true,
  });

  useEffect(() => {
    loadReservations();
    loadStats();
    loadRejectionReasons();
  }, [filter]);

  useEffect(() => {
    loadPlacesManaged();
  }, []);

  useEffect(() => {
    if (selectedPlaceId) {
      loadSchedules(selectedPlaceId);
    }
  }, [selectedPlaceId]);

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

  const loadStats = async () => {
    try {
      const data = await companyService.reservations.getStatsSummary();
      setStats({
        pendientes: data?.pendientes || 0,
        aceptadas: data?.aceptadas || 0,
        rechazadas: data?.rechazadas || 0,
        total: data?.total || 0,
      });
    } catch (error) {
      console.error('Error cargando estadisticas:', error);
    }
  };

  const loadPlacesManaged = async () => {
    try {
      const data = await companyService.places.getAll();
      setPlacesManaged(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedPlaceId(String(data[0].id));
      }
    } catch (error) {
      console.error('Error cargando lugares gestionados:', error);
    }
  };

  const normalizeTime = (value) => {
    if (!value) return '';
    const timeStr = String(value);
    return timeStr.length >= 5 ? timeStr.slice(0, 5) : timeStr;
  };

  const loadSchedules = async (placeId) => {
    try {
      setScheduleLoading(true);
      const data = await companyService.places.schedules.getAll(placeId);
      const normalized = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            hora_inicio: normalizeTime(item.hora_inicio),
            hora_fin: normalizeTime(item.hora_fin),
          }))
        : [];
      setSchedules(normalized);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      showMessage('Error al cargar horarios', 'error');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleScheduleChange = (scheduleId, field, value) => {
    const nextValue = field.includes('hora_') ? normalizeTime(value) : value;
    setSchedules((prev) =>
      prev.map((item) =>
        item.id === scheduleId ? { ...item, [field]: nextValue, _dirty: true } : item
      )
    );
  };

  const handleSaveSchedule = async (schedule) => {
    if (!selectedPlaceId) return;

    try {
      setScheduleLoading(true);
      await companyService.places.schedules.update(selectedPlaceId, schedule.id, {
        dia_semana: schedule.dia_semana,
        hora_inicio: normalizeTime(schedule.hora_inicio),
        hora_fin: normalizeTime(schedule.hora_fin),
        activo: schedule.activo,
      });
      showMessage('Horario actualizado', 'success');
      loadSchedules(selectedPlaceId);
    } catch (error) {
      console.error('Error actualizando horario:', error);
      showMessage('Error al actualizar horario', 'error');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!selectedPlaceId) return;

    if (!window.confirm('Deseas eliminar este horario?')) {
      return;
    }

    try {
      setScheduleLoading(true);
      await companyService.places.schedules.delete(selectedPlaceId, scheduleId);
      showMessage('Horario eliminado', 'success');
      loadSchedules(selectedPlaceId);
    } catch (error) {
      console.error('Error eliminando horario:', error);
      showMessage('Error al eliminar horario', 'error');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedPlaceId) return;

    try {
      setScheduleLoading(true);
      await companyService.places.schedules.create(selectedPlaceId, newSchedule);
      showMessage('Horario creado', 'success');
      setNewSchedule({
        dia_semana: 'lunes',
        hora_inicio: '08:00',
        hora_fin: '17:00',
        activo: true,
      });
      loadSchedules(selectedPlaceId);
    } catch (error) {
      console.error('Error creando horario:', error);
      showMessage('Error al crear horario', 'error');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleAllDay = (scheduleId) => {
    handleScheduleChange(scheduleId, 'hora_inicio', '00:00');
    handleScheduleChange(scheduleId, 'hora_fin', '23:59');
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
      loadStats();
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
      loadStats();
    } catch (error) {
      showMessage('Error al rechazar reserva', 'error');
    } finally {
      setRejecting(false);
    }
  };

  const handleReopen = async (reservation) => {
    try {
      setLoading(true);
      await companyService.reservations.reopen(reservation.id);
      showMessage('Reserva reabierta correctamente', 'success');
      loadReservations();
      loadStats();
    } catch (error) {
      showMessage('Error al reabrir reserva', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
  };

  const formatDate = (date) => {
    const dateObj = parseLocalDate(date);
    if (!dateObj) {
      return 'Fecha invalida';
    }

    return dateObj.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseLocalDate = (dateString) => {
    if (!dateString) return null;

    let dateStr = String(dateString);
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) {
      const fallback = new Date(dateString);
      return isNaN(fallback.getTime()) ? null : fallback;
    }

    return new Date(year, month - 1, day);
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
        <button
          type="button"
          className="back-button"
          onClick={() => window.history.back()}
        >
          Volver
        </button>
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

      <div className="schedule-manager">
        <div className="schedule-header">
          <h2>Horarios del lugar</h2>
          <div className="schedule-controls">
            <label>
              Lugar
              <select
                value={selectedPlaceId}
                onChange={(event) => setSelectedPlaceId(event.target.value)}
                disabled={scheduleLoading}
              >
                {placesManaged.length === 0 && <option value="">Sin lugares</option>}
                {placesManaged.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {scheduleLoading ? (
          <p>Cargando horarios...</p>
        ) : schedules.length === 0 ? (
          <p>No hay horarios configurados para este lugar.</p>
        ) : (
          <div className="schedule-list">
            {schedules.map((schedule) => (
              <div key={schedule.id} className={`schedule-row ${schedule.activo ? '' : 'inactive'}`}>
                <select
                  value={schedule.dia_semana}
                  onChange={(event) => handleScheduleChange(schedule.id, 'dia_semana', event.target.value)}
                  disabled={scheduleLoading}
                >
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miercoles">Miercoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                  <option value="sabado">Sabado</option>
                  <option value="domingo">Domingo</option>
                </select>
                <input
                  type="time"
                  value={schedule.hora_inicio}
                  onChange={(event) => handleScheduleChange(schedule.id, 'hora_inicio', event.target.value)}
                  disabled={scheduleLoading}
                />
                <input
                  type="time"
                  value={schedule.hora_fin}
                  onChange={(event) => handleScheduleChange(schedule.id, 'hora_fin', event.target.value)}
                  disabled={scheduleLoading}
                />
                <label className="schedule-active">
                  <input
                    type="checkbox"
                    checked={!!schedule.activo}
                    onChange={(event) => handleScheduleChange(schedule.id, 'activo', event.target.checked)}
                    disabled={scheduleLoading}
                  />
                  Activo
                </label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleAllDay(schedule.id)}
                  disabled={scheduleLoading}
                >
                  Todo el dia
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleSaveSchedule(schedule)}
                  disabled={scheduleLoading || !schedule._dirty}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  disabled={scheduleLoading}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="schedule-new">
          <h3>Agregar horario</h3>
          <div className="schedule-row">
            <select
              value={newSchedule.dia_semana}
              onChange={(event) => setNewSchedule({ ...newSchedule, dia_semana: event.target.value })}
              disabled={scheduleLoading}
            >
              <option value="lunes">Lunes</option>
              <option value="martes">Martes</option>
              <option value="miercoles">Miercoles</option>
              <option value="jueves">Jueves</option>
              <option value="viernes">Viernes</option>
              <option value="sabado">Sabado</option>
              <option value="domingo">Domingo</option>
            </select>
            <input
              type="time"
              value={newSchedule.hora_inicio}
              onChange={(event) => setNewSchedule({ ...newSchedule, hora_inicio: event.target.value })}
              disabled={scheduleLoading}
            />
            <input
              type="time"
              value={newSchedule.hora_fin}
              onChange={(event) => setNewSchedule({ ...newSchedule, hora_fin: event.target.value })}
              disabled={scheduleLoading}
            />
            <label className="schedule-active">
              <input
                type="checkbox"
                checked={!!newSchedule.activo}
                onChange={(event) => setNewSchedule({ ...newSchedule, activo: event.target.checked })}
                disabled={scheduleLoading}
              />
              Activo
            </label>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setNewSchedule({ ...newSchedule, hora_inicio: '00:00', hora_fin: '23:59' })}
              disabled={scheduleLoading}
            >
              Todo el dia
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleAddSchedule}
              disabled={scheduleLoading}
            >
              Agregar
            </button>
          </div>
          <p className="schedule-hint">
            Para cerrar un dia, desactiva el horario o eliminelo. Para abrir todo el dia usa 00:00 - 23:59.
          </p>
        </div>
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

                {(companyRes.estado === 'rechazada' || companyRes.estado === 'aceptada') && (
                  <div className="card-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleReopen(companyRes)}
                      disabled={loading}
                    >
                      ↺ Revertir a pendiente
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
