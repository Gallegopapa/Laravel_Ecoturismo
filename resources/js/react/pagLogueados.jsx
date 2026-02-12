import React, { useEffect } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import Slider from "@/react/components/slider/Slider";

function PagLogueados() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  // Validar que el usuario esté autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Mostrar loading mientras se verifica
  if (loading) {
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

  // Si no hay usuario autenticado, no renderizar nada (será redirigido)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Renderizar contenido principal para usuario autenticado
  return (
    <div className="page-layout">
      <Header2 />
      <main className="page-content">
        <Slider />
      </main>
      <Footer />
    </div>
  );
}

export default PagLogueados;
