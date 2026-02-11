import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header/Header";
import Header2 from "../components/Header2/Header2";
import Footer from "../components/Footer/Footer";
import "./page.css";

console.log('🏨🏨🏨 ARCHIVO ECOHOTELS PAGE IMPORTADO 🏨🏨🏨');

const EcohotelsPage = () => {
  console.log('🏨 EcohotelsPage component loaded!');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [ecohotels, setEcohotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    loadEcohotels();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const loadEcohotels = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ecohotels");
      const data = await response.json();
      setEcohotels(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar ecohoteles:", error);
      setMessage("Error al cargar ecohoteles");
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categoria) => {
    setCategoriaFiltro(categoria);
  };

  const ecohotelesFiltrados = categoriaFiltro === "todas"
    ? ecohotels
    : ecohotels.filter((ecohotel) =>
        ecohotel.categories?.some((cat) => cat.id === categoriaFiltro)
      );

  if (loading) {
    return (
      <div className="page-layout">
        {isAuthenticated ? <Header2 /> : <Header />}
        <div className="page-content">
          <div className="loading">Cargando ecohoteles...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-layout">
      {isAuthenticated ? <Header2 /> : <Header />}

      <main className="page-content">
        <div className="lugares-container">
          <div className="lugares-header">
            <h1>Ecohoteles</h1>
            <p>Descubre alojamientos ecológicos en Risaralda</p>
          </div>

          {message && (
            <div className={`message ${message.toLowerCase().includes("error") ? "error" : "success"}`}>
              {message}
            </div>
          )}

          {/* Filtros por categoría */}
          <div className="filtros-container">
            <button
              className={`filtro-btn ${categoriaFiltro === "todas" ? "active" : ""}`}
              onClick={() => handleCategoryFilter("todas")}
            >
              Todas
            </button>
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                className={`filtro-btn ${categoriaFiltro === categoria.id ? "active" : ""}`}
                onClick={() => handleCategoryFilter(categoria.id)}
              >
                {categoria.name}
              </button>
            ))}
          </div>

          {/* Grid de ecohoteles */}
          <div className="lugares-grid">
            {ecohotelesFiltrados.length === 0 ? (
              <div className="no-results">
                <p>No se encontraron ecohoteles</p>
              </div>
            ) : (
              ecohotelesFiltrados.map((ecohotel) => (
                <div key={ecohotel.id} className="lugar-card">
                  <Link to={`/ecohoteles/${ecohotel.id}`}>
                    <div className="lugar-image">
                      <img
                        src={ecohotel.image || "/imagenes/placeholder.jpg"}
                        alt={ecohotel.name}
                        onError={(e) => {
                          e.target.src = "/imagenes/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="lugar-info">
                      <h3>{ecohotel.name}</h3>
                      {ecohotel.location && (
                        <p className="lugar-location">📍 {ecohotel.location}</p>
                      )}
                      {ecohotel.telefono && (
                        <p className="lugar-phone">📞 {ecohotel.telefono}</p>
                      )}
                      {ecohotel.categories && ecohotel.categories.length > 0 && (
                        <div className="lugar-categories">
                          {ecohotel.categories.map((cat) => (
                            <span key={cat.id} className="category-tag">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EcohotelsPage;
