import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservationsService } from '../services/api';
import './admin.css';

const ReservationsAdmin = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
  const [editingReservation, setEditingReservation] = useState(null);
  const [editForm, setEditForm] = useState({
    estado: '',
    fecha_visita: '',
    hora_visita: '',
    personas: '',
    telefono_contacto: '',
    comentarios: '',
  });

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationsService.getAll();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      showMessage('Error al cargar las reservas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const formatTimeForInput = (timeValue) => {
    if (!timeValue) return '';
    
    // Si es un string con formato datetime completo (ej: "2025-01-01 14:30:00")
    if (timeValue.includes('T') || timeValue.includes(' ')) {
      const date = new Date(timeValue);
      if (!isNaN(date.getTime())) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    
    // Si es un string con formato time (ej: "14:30:00" o "14:30")
    if (typeof timeValue === 'string' && timeValue.includes(':')) {
      const parts = timeValue.split(':');
      if (parts.length >= 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    
    return '';
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setEditForm({
      estado: reservation.estado || 'pendiente',
      fecha_visita: reservation.fecha_visita ? reservation.fecha_visita.split('T')[0] : '',
      hora_visita: formatTimeForInput(reservation.hora_visita),
      personas: reservation.personas || '',
      telefono_contacto: reservation.telefono_contacto || '',
      comentarios: reservation.comentarios || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingReservation(null);
    setEditForm({
      estado: '',
      fecha_visita: '',
      hora_visita: '',
      personas: '',
      telefono_contacto: '',
      comentarios: '',
    });
  };

  const handleUpdate = async () => {
    if (!editingReservation) return;

    try {
      // Preparar los datos para enviar, asegurando que hora_visita esté en formato correcto
      const updateData = {
        ...editForm,
        // Si hora_visita está vacío, enviar null en lugar de string vacío
        hora_visita: editForm.hora_visita && editForm.hora_visita.trim() !== '' 
          ? editForm.hora_visita 
          : null,
        // Asegurar que personas sea un número
        personas: editForm.personas ? parseInt(editForm.personas, 10) : null,
      };

      await reservationsService.update(editingReservation.id, updateData);
      showMessage('Reserva actualizada correctamente');
      handleCancelEdit();
      loadReservations();
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.hora_visita?.[0]
        || 'Error al actualizar reserva';
      showMessage(errorMessage, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reserva?')) {
      return;
    }

    try {
      await reservationsService.delete(id);
      showMessage('Reserva eliminada correctamente');
      loadReservations();
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      showMessage('Error al eliminar reserva', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    // Si es una fecha en formato ISO (ej: "2025-01-17" o "2025-01-17T00:00:00")
    // Extraer solo la parte de la fecha para evitar problemas de zona horaria
    let dateStr = dateString;
    if (dateString.includes('T')) {
      dateStr = dateString.split('T')[0];
    }
    
    // Crear fecha usando componentes locales para evitar conversión UTC
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) {
      // Fallback si el formato no es el esperado
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    
    // Si es un string en formato "HH:mm" o "HH:mm:ss"
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    
    // Si es un datetime completo, intentar extraer la hora
    if (timeString.includes('T') || timeString.includes(' ')) {
      try {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        }
      } catch (e) {
        console.error('Error al formatear hora:', e);
      }
    }
    
    return timeString;
  };

  const getStatusBadge = (reservation) => {
    const estado = reservation.estado;
    
    if (estado === 'confirmada') {
      return <span className="status-badge confirmed">Confirmada</span>;
    } else if (estado === 'cancelada') {
      return <span className="status-badge cancelled">Cancelada</span>;
    } else if (estado === 'completada') {
      return <span className="status-badge completed">Completada</span>;
    } else {
      const fechaVisita = new Date(reservation.fecha_visita);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaVisita.setHours(0, 0, 0, 0);

      if (fechaVisita < hoy) {
        return <span className="status-badge completed">Completada</span>;
      } else if (fechaVisita.getTime() === hoy.getTime()) {
        return <span className="status-badge pending">Hoy</span>;
      } else {
        return <span className="status-badge pending">Pendiente</span>;
      }
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (filter === 'all') return true;
    const estado = reservation.estado;
    const fechaVisita = new Date(reservation.fecha_visita);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaVisita.setHours(0, 0, 0, 0);

    if (filter === 'pending') {
      return (estado === 'pendiente' || !estado) && fechaVisita >= hoy;
    } else if (filter === 'completed') {
      return estado === 'completada' || estado === 'confirmada' || fechaVisita < hoy;
    }
    return true;
  });

  return (
    <div className="admin-panel">
      {message && (
        <div className={`admin-message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="admin-list-section">
        <div className="reservations-header">
          <h2>Gestión de Reservas</h2>
          <div className="reservations-filters">
            <button
              className={filter === 'all' ? 'btn-filter active' : 'btn-filter'}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button
              className={filter === 'pending' ? 'btn-filter active' : 'btn-filter'}
              onClick={() => setFilter('pending')}
            >
              Pendientes
            </button>
            <button
              className={filter === 'completed' ? 'btn-filter active' : 'btn-filter'}
              onClick={() => setFilter('completed')}
            >
              Completadas
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : filteredReservations.length === 0 ? (
          <p>No hay reservas registradas</p>
        ) : (
          <div className="reservations-table-container">
            <table className="admin-table reservations-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Lugar</th>
                  <th>Fecha Visita</th>
                  <th>Hora</th>
                  <th>Personas</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <React.Fragment key={reservation.id}>
                    {editingReservation?.id === reservation.id ? (
                      <tr className="editing-row">
                        <td>#{reservation.id}</td>
                        <td colSpan="8">
                          <div className="edit-form-container">
                            <h3>Editar Reserva #{reservation.id}</h3>
                            <div className="edit-form-grid">
                              <div className="form-group">
                                <label>Estado</label>
                                <select
                                  value={editForm.estado}
                                  onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                                >
                                  <option value="pendiente">Pendiente</option>
                                  <option value="confirmada">Confirmada</option>
                                  <option value="cancelada">Cancelada</option>
                                  <option value="completada">Completada</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>Fecha Visita</label>
                                <input
                                  type="date"
                                  value={editForm.fecha_visita}
                                  onChange={(e) => setEditForm({ ...editForm, fecha_visita: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label>Hora Visita</label>
                                <input
                                  type="time"
                                  value={editForm.hora_visita}
                                  onChange={(e) => setEditForm({ ...editForm, hora_visita: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label>Personas</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={editForm.personas}
                                  onChange={(e) => setEditForm({ ...editForm, personas: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                  type="text"
                                  value={editForm.telefono_contacto}
                                  onChange={(e) => setEditForm({ ...editForm, telefono_contacto: e.target.value })}
                                />
                              </div>
                              <div className="form-group full-width">
                                <label>Comentarios</label>
                                <textarea
                                  value={editForm.comentarios}
                                  onChange={(e) => setEditForm({ ...editForm, comentarios: e.target.value })}
                                  rows="3"
                                />
                              </div>
                            </div>
                            <div className="edit-form-actions">
                              <button onClick={handleUpdate} className="btn-primary">
                                Guardar
                              </button>
                              <button onClick={handleCancelEdit} className="btn-secondary">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td>#{reservation.id}</td>
                        <td>
                          <div className="user-cell">
                            {reservation.usuario?.foto_perfil ? (
                              <img
                                src={reservation.usuario.foto_perfil}
                                alt={reservation.usuario.name}
                                className="user-avatar"
                              />
                            ) : (
                              <div className="user-avatar-placeholder">
                                {reservation.usuario?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div className="user-info">
                              <div className="user-name">{reservation.usuario?.name || 'Usuario'}</div>
                              <div className="user-email">{reservation.usuario?.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="place-cell">
                            <div className="place-name">{reservation.place?.name || 'Lugar no encontrado'}</div>
                            <div className="place-location">{reservation.place?.location || ''}</div>
                          </div>
                        </td>
                        <td>{formatDate(reservation.fecha_visita)}</td>
                        <td>{formatTime(reservation.hora_visita)}</td>
                        <td>{reservation.personas || '-'}</td>
                        <td>{reservation.telefono_contacto || '-'}</td>
                        <td>{getStatusBadge(reservation)}</td>
                        <td>
                          <div className="action-buttons-cell">
                            <button
                              onClick={() => handleEdit(reservation)}
                              className="btn-edit"
                              title="Editar reserva"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(reservation.id)}
                              className="btn-delete"
                              title="Eliminar reserva"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsAdmin;
