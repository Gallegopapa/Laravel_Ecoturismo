import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/react/context/AuthContext";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import { profileService } from "@/react/services/api";
import usuarioImg from "@/react/components/imagenes/usuario.jpg";
import "./page.css";

const PerfilPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telefono: "",
    foto_perfil: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const handleDeleteAccount = async () => {
    setDeleteMessage("");
    try {
      await profileService.deleteAccount();
      setDeleteMessage("Cuenta eliminada exitosamente. Redirigiendo...");
      setTimeout(() => {
        logout();
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      setDeleteMessage(error.response?.data?.message || error.message || "Error al eliminar la cuenta");
    }
  };

  // Validar que el usuario esté autenticado y cargar datos del perfil
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    // Cargar datos del usuario desde el contexto o desde la API
    const loadProfileData = async () => {
      if (user) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          telefono: user.telefono || "",
          foto_perfil: null,
        });
        // Agregar timestamp a la URL de foto para evitar caché
        const fotoUrl = user.foto_perfil 
          ? (user.foto_perfil.includes('?') 
              ? `${user.foto_perfil}&t=${Date.now()}`
              : `${user.foto_perfil}?t=${Date.now()}`)
          : usuarioImg;
        setPreviewImage(fotoUrl);
      } else if (isAuthenticated) {
        // Si hay token pero no hay usuario en el contexto, cargar desde la API
        try {
          const response = await profileService.get();
          if (response.user) {
            setFormData({
              name: response.user.name || "",
              email: response.user.email || "",
              telefono: response.user.telefono || "",
              foto_perfil: null,
            });
            // Agregar timestamp a la URL de foto para evitar caché
            const fotoUrl = response.user.foto_perfil 
              ? (response.user.foto_perfil.includes('?') 
                  ? `${response.user.foto_perfil}&t=${Date.now()}`
                  : `${response.user.foto_perfil}?t=${Date.now()}`)
              : usuarioImg;
            setPreviewImage(fotoUrl);
          }
        } catch (error) {
          console.error("Error al cargar perfil:", error);
        }
      }
    };

    loadProfileData();
  }, [user, isAuthenticated, loading, navigate]);

  // Mostrar loading
  if (loading) {
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

  // Si no hay usuario autenticado, no renderizar
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'foto_perfil' && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        foto_perfil: file,
      }));
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      // Log para debugging
      console.log('Enviando datos:', {
        name: formData.name,
        email: formData.email,
        telefono: formData.telefono,
        hasFoto: formData.foto_perfil instanceof File,
        fotoName: formData.foto_perfil instanceof File ? formData.foto_perfil.name : null,
      });

      const response = await profileService.update(formData);
      setMessage(response.message || "Perfil actualizado exitosamente");
      
      // Actualizar el usuario en el contexto
      if (response.user) {
        updateUser(response.user);
        // Actualizar preview si se subió nueva imagen - usar la URL del servidor
        if (response.user.foto_perfil) {
          // Agregar timestamp para asegurar que se recarga la imagen (evitar caché)
          const fotoUrl = response.user.foto_perfil.includes('?') 
            ? `${response.user.foto_perfil}&t=${Date.now()}`
            : `${response.user.foto_perfil}?t=${Date.now()}`;
          setPreviewImage(fotoUrl);
        }
      }
      
      // Limpiar el input de archivo si se guardó correctamente
      setFormData(prev => ({
        ...prev,
        foto_perfil: null,
      }));
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      console.error('Error response:', error.response?.data);
      setMessage(
        error.response?.data?.message || error.message || "Error al actualizar el perfil"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      <Header2 />

      <div className="perfil-container">
        <div className="perfil-card">
          <h1>Mi Perfil</h1>

          {message && (
            <div className={`message ${message.includes("Error") ? "error" : "success"}`}>
              {message}
            </div>
          )}

          {/* Sección de foto de perfil */}
          <div className="profile-photo-section">
            <div className="photo-preview">
              <img 
                src={previewImage || usuarioImg} 
                alt="Foto de perfil" 
                className="profile-photo"
              />
            </div>
            <label htmlFor="foto_perfil" className="photo-upload-btn">
              <input
                id="foto_perfil"
                type="file"
                name="foto_perfil"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
                disabled={isSubmitting}
              />
              {formData.foto_perfil ? 'Cambiar Foto' : 'Subir Foto'}
            </label>
            {formData.foto_perfil && (
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                Nueva foto seleccionada: {formData.foto_perfil.name}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="perfil-form" encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="name">Nombre:</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo:</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono:</label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-buttons">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-guardar"
              >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
              >
                Cerrar Sesión
              </button>

              <button
                type="button"
                className="btn-delete"
                style={{ background: '#e53935', color: '#fff', marginLeft: 8 }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Eliminar cuenta
              </button>
            </div>

            {showDeleteConfirm && (
              <div className="delete-confirm-modal" style={{ background: '#fff', border: '1px solid #e53935', padding: 20, marginTop: 16, borderRadius: 8 }}>
                <p style={{ color: '#e53935', fontWeight: 'bold' }}>¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.</p>
                <button
                  type="button"
                  style={{ background: '#e53935', color: '#fff', marginRight: 8 }}
                  onClick={handleDeleteAccount}
                >
                  Sí, eliminar definitivamente
                </button>
                <button
                  type="button"
                  style={{ background: '#ccc', color: '#222' }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </button>
                {deleteMessage && (
                  <p style={{ marginTop: 10, color: deleteMessage.includes('exitosamente') ? '#388e3c' : '#e53935' }}>{deleteMessage}</p>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PerfilPage;
