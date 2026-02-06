import React, { useEffect } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
// import Card from '@/react/components/Cards/Card';
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

  return (
    <div className="page-layout">
      <Header2 />
      {/* MAIN */}
      <main className="page-content">
        <Slider />

        {/* CARDS */}
        <div className="contenedorcards">
          {/* <Card 
            urlImg={"https://picsum.photos/id/40/300/200"}
            title={"Paisajes"}
            description={"Conoce los paisajes más hermosos de la región."}
          /> */}
          {/* <Card 
            urlImg={"https://picsum.photos/id/41/300/200"}
            title={"Gastronomía"}
            description={"Sabores únicos que te encantarán."}
          /> */}
          {/* <Card 
            urlImg={"https://picsum.photos/id/42/300/200"}
            title={"Cultura"}
            description={"Tradición y arte en cada rincón."}
          /> */}
        </div>
        {/* CARDS */}
      </main>

      <Footer />
    </div>
  );
}

export default PagLogueados;
