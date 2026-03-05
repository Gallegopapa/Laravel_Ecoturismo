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
  const [displayImage, setDisplayImage] = useState(usuarioImg);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const resolveProfileImageUrl = (rawUrl) => {
    if (!rawUrl || rawUrl === "null" || rawUrl === "undefined") {
      return usuarioImg;
    }

    // Normaliza URLs antiguas guardadas con localhost a ruta relativa.
    try {
      if (/^https?:\/\//i.test(rawUrl)) {
        const parsed = new URL(rawUrl);
        if (parsed.pathname && parsed.pathname.startsWith('/storage/')) {
          return `${parsed.pathname}?t=${Date.now()}`;
        }
      }
    } catch (error) {
      // Si no se puede parsear, usamos la URL tal cual.
    }

    return rawUrl.includes('?') ? `${rawUrl}&t=${Date.now()}` : `${rawUrl}?t=${Date.now()}`;
  };

  useEffect(() => {
    const candidate = previewImage || usuarioImg;

    if (candidate === usuarioImg) {
      console.log('Usando imagen por defecto');
      setDisplayImage(usuarioImg);
      return;
    }

    let cancelled = false;
    const tester = new Image();

    tester.onload = () => {
      console.log('✅ Imagen cargada correctamente:', candidate);
      if (!cancelled) {
        setDisplayImage(candidate);
      }
    };

    tester.onerror = () => {
      console.error('❌ Error al cargar imagen:', candidate);
      if (!cancelled) {
        console.log('⚠️ Fallback a imagen por defecto');
        setDisplayImage(usuarioImg);
      }
    };

    console.log('🔍 Validando imagen:', candidate);
    tester.src = candidate;

    return () => {
      cancelled = true;
    };
  }, [previewImage]);
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
        setPreviewImage(resolveProfileImageUrl(user.foto_perfil));

        // Refresca desde API para evitar URLs antiguas en localStorage/contexto.
        try {
          const response = await profileService.get();
          if (response.user) {
            updateUser(response.user);
            setFormData({
              name: response.user.name || "",
              email: response.user.email || "",
              telefono: response.user.telefono || "",
              foto_perfil: null,
            });
            setPreviewImage(resolveProfileImageUrl(response.user.foto_perfil));
          }
        } catch (error) {
          console.error("Error al refrescar perfil:", error);
        }
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
            setPreviewImage(resolveProfileImageUrl(response.user.foto_perfil));
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
      console.log('🚀 Enviando datos:', {
        name: formData.name,
        email: formData.email,
        telefono: formData.telefono,
        hasFoto: formData.foto_perfil instanceof File,
        fotoName: formData.foto_perfil instanceof File ? formData.foto_perfil.name : null,
      });

      const response = await profileService.update(formData);
      console.log('✅ Respuesta del servidor:', response);
      
      setMessage(response.message || "Perfil actualizado exitosamente");
      
      // Actualizar el usuario en el contexto
      if (response.user) {
        console.log('👤 Usuario actualizado:', response.user);
        updateUser(response.user);
        
        // Actualizar preview si se subió nueva imagen - usar la URL del servidor
        if (response.user.foto_perfil) {
          const resolvedUrl = resolveProfileImageUrl(response.user.foto_perfil);
          console.log('🖼️ URL original:', response.user.foto_perfil);
          console.log('🖼️ URL resuelta:', resolvedUrl);
          setPreviewImage(resolvedUrl);
        } else {
          console.warn('⚠️ No hay foto_perfil en la respuesta del servidor');
        }
      } else {
        console.warn('⚠️ No hay usuario en la respuesta del servidor');
      }
      
      // Limpiar el input de archivo si se guardó correctamente
      setFormData(prev => ({
        ...prev,
        foto_perfil: null,
      }));
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
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
                src={displayImage} 
                alt="Foto de perfil" 
                className="profile-photo"
                onError={(e) => {
                  e.currentTarget.src = usuarioImg;
                  setDisplayImage(usuarioImg);
                }}
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

            <div className="form-buttons" style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
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
            </div>

            <hr style={{ margin: '32px 0 16px 0', border: 'none', borderTop: '1px solid #eee' }} />
            <div className="danger-zone" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '8px' }}>Zona peligrosa</h3>
              <p style={{ color: '#888', fontSize: '0.95em', marginBottom: '12px' }}>
                Esta acción eliminará tu cuenta y todos tus datos de forma permanente. No se puede deshacer.
              </p>
              <button
                type="button"
                className="btn-delete"
                style={{ background: '#e53935', color: '#fff', width: '100%', maxWidth: '220px', marginTop: '8px', fontWeight: 'bold', fontSize: '1em', padding: '10px 0', borderRadius: '6px', boxShadow: '0 2px 8px rgba(229,57,53,0.08)' }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Eliminar cuenta
              </button>
            </div>

            {/* Modal de confirmación de eliminación de cuenta */}
            {showDeleteConfirm && (
              <div>
                <div
                  className="modal-overlay"
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.35)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.2s',
                    overflowY: 'auto',
                  }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <div
                    className="modal-content"
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                      padding: '24px 16px',
                      minWidth: '280px',
                      maxWidth: '95vw',
                      width: '100%',
                      zIndex: 1001,
                      position: 'relative',
                      animation: 'scaleIn 0.2s',
                      margin: '0 auto',
                      maxHeight: '90vh',
                      overflowY: 'auto',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <h2 style={{ fontWeight: 'bold', fontSize: '1.25em', marginBottom: '12px', color: '#222' }}>¿Eliminar cuenta?</h2>
                    <p style={{ color: '#888', fontSize: '1em', marginBottom: '24px' }}>
                      Esta acción eliminará permanentemente tu cuenta y todos tus datos. No se puede deshacer.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                      <button
                        type="button"
                        style={{ background: '#e53935', color: '#fff', fontWeight: 'bold', borderRadius: '6px', padding: '10px 24px', fontSize: '1em', boxShadow: '0 2px 8px rgba(229,57,53,0.08)' }}
                        onClick={handleDeleteAccount}
                      >
                        Confirmar eliminación
                      </button>
                      <button
                        type="button"
                        style={{ background: '#eee', color: '#222', borderRadius: '6px', padding: '10px 24px', fontSize: '1em', fontWeight: 'bold' }}
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                    {deleteMessage && (
                      <p style={{ marginTop: 10, color: deleteMessage.includes('exitosamente') ? '#388e3c' : '#e53935' }}>{deleteMessage}</p>
                    )}
                  </div>
                </div>
                {/* Animaciones CSS */}
                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                  }
                `}</style>
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
