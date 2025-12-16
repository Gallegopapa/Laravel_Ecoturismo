import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/react/context/AuthContext";
import { favoritesService, placesService } from "@/react/services/api";
import Header from "@/react/components/Header/Header";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import ReservationModal from "@/react/components/ReservationModal";
import "./page.css";
import "../places2/paraisosAcuaticos/lugares.css";

const PlacesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [lugares, setLugares] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [categorias, setCategorias] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [updatingFavorites, setUpdatingFavorites] = useState({});
  const [reservationModal, setReservationModal] = useState({ isOpen: false, place: null });

  // Mapeo determinístico: nombre exacto -> imagen local
  // Este mapeo garantiza que siempre se asigne la misma imagen al mismo lugar
  const mapeoImagenesDeterministico = {
    // Paraísos Acuáticos - nombres exactos como vienen de la BD
    'Lago De La Pradera': '/imagenes/Lago.jpeg',
    'La Laguna Del Otún': '/imagenes/laguna.jpg',
    'Laguna Del Otún': '/imagenes/laguna.jpg',
    'Chorros De Don Lolo': '/imagenes/lolo-2.jpg',
    'Termales de Santa Rosa': '/imagenes/termaales.jpg',
    'Parque Acuático Consota': '/imagenes/consota.jpg',
    'Balneario Los Farallones': '/imagenes/farallones.jpeg',
    'Cascada Los Frailes': '/imagenes/frailes3.jpg',
    'Río San José': '/imagenes/sanjose3.jpg',
    'Rio San Jose': '/imagenes/sanjose3.jpg',
    // Lugares Montañosos
    'Alto Del Nudo': '/imagenes/nudo.jpg',
    'Alto Del Toro': '/imagenes/toro.jpg',
    'La Divisa De Don Juan': '/imagenes/divisa3.jpeg',
    'Cerro Batero': '/imagenes/batero.jpg',
    'Reserva Forestal La Nona': '/imagenes/lanona5.jpg',
    'Reserva Natural Cerro Gobia': '/imagenes/gobia.jpg',
    'Kaukitá Bosque Reserva': '/imagenes/kaukita3.jpg',
    'Kaukita Bosque Reserva': '/imagenes/kaukita3.jpg',
    'Reserva Natural DMI Agualinda': '/imagenes/distritomanejo8.jpg',
    // Parques y Más
    'Parque Nacional Natural Tatamá': '/imagenes/tatama.jpg',
    'Parque Nacional Natural Tatama': '/imagenes/tatama.jpg',
    'Parque Las Araucarias': '/imagenes/araucarias.jpg',
    'Parque Regional Natural Cuchilla de San Juan': '/imagenes/cuchilla.jpg',
    'Parque Natural Regional Santa Emilia': '/imagenes/santaemilia2.jpg',
    'Jardín Botánico UTP': '/imagenes/jardin.jpeg',
    'Jardin Botanico UTP': '/imagenes/jardin.jpeg',
    'Jardín Botánico De Marsella': '/imagenes/jardinmarsella2.jpg',
    'Jardin Botanico De Marsella': '/imagenes/jardinmarsella2.jpg',
  };

  // Fallbacks locales por categoría (imágenes locales)
  // Mapeo directo por nombre para búsqueda más rápida y precisa
  const mapeoImagenesLocales = {
    // Paraísos Acuáticos
    'lago de la pradera': '/imagenes/Lago.jpeg',
    'la laguna del otún': '/imagenes/laguna.jpg',
    'laguna del otún': '/imagenes/laguna.jpg',
    'chorros de don lolo': '/imagenes/lolo-2.jpg',
    'termales de santa rosa': '/imagenes/termaales.jpg',
    'parque acuático consota': '/imagenes/consota.jpg',
    'balneario los farallones': '/imagenes/farallones.jpeg',
    'cascada los frailes': '/imagenes/frailes3.jpg',
    'río san josé': '/imagenes/sanjose3.jpg',
    'rio san jose': '/imagenes/sanjose3.jpg',
    // Lugares Montañosos
    'alto del nudo': '/imagenes/nudo.jpg',
    'alto del toro': '/imagenes/toro.jpg',
    'la divisa de don juan': '/imagenes/divisa3.jpeg',
    'cerro batero': '/imagenes/batero.jpg',
    'reserva forestal la nona': '/imagenes/lanona5.jpg',
    'reserva natural cerro gobia': '/imagenes/gobia.jpg',
    'kaukita bosque reserva': '/imagenes/kaukita3.jpg',
    'kaukitá bosque reserva': '/imagenes/kaukita3.jpg',
    'reserva natural dmi agualinda': '/imagenes/distritomanejo8.jpg',
    // Parques y Más
    'parque nacional natural tatamá': '/imagenes/tatama.jpg',
    'parque nacional natural tatama': '/imagenes/tatama.jpg',
    'parque las araucarias': '/imagenes/araucarias.jpg',
    'parque regional natural cuchilla de san juan': '/imagenes/cuchilla.jpg',
    'parque natural regional santa emilia': '/imagenes/santaemilia2.jpg',
    'jardín botánico utp': '/imagenes/jardin.jpeg',
    'jardin botanico utp': '/imagenes/jardin.jpeg',
    'jardín botánico de marsella': '/imagenes/jardinmarsella2.jpg',
    'jardin botanico de marsella': '/imagenes/jardinmarsella2.jpg',
  };

  // Fallbacks por categoría para búsqueda alternativa
  const fallbacksPorCategoria = {
    'paraisos-acuaticos': [
      { nombre: "Lago De La Pradera", imagen: "/imagenes/Lago.jpeg" },
      { nombre: "La Laguna Del Otún", imagen: "/imagenes/laguna.jpg" },
      { nombre: "Chorros De Don Lolo", imagen: "/imagenes/lolo-2.jpg" },
      { nombre: "Termales de Santa Rosa", imagen: "/imagenes/termaales.jpg" },
      { nombre: "Parque Acuático Consota", imagen: "/imagenes/consota.jpg" },
      { nombre: "Balneario Los Farallones", imagen: "/imagenes/farallones.jpeg" },
      { nombre: "Cascada Los Frailes", imagen: "/imagenes/frailes3.jpg" },
      { nombre: "Río San José", imagen: "/imagenes/sanjose3.jpg" },
    ],
    'lugares-montanosos': [
      { titulo: "Alto Del Nudo", imagen: "/imagenes/nudo.jpg" },
      { titulo: "Alto Del Toro", imagen: "/imagenes/toro.jpg" },
      { titulo: "La Divisa De Don Juan", imagen: "/imagenes/divisa3.jpeg" },
      { titulo: "Cerro Batero", imagen: "/imagenes/batero.jpg" },
      { titulo: "Reserva Forestal La Nona", imagen: "/imagenes/lanona5.jpg" },
      { titulo: "Reserva Natural Cerro Gobia", imagen: "/imagenes/gobia.jpg" },
      { titulo: "Kaukitá Bosque Reserva", imagen: "/imagenes/kaukita3.jpg" },
      { titulo: "Reserva Natural DMI Agualinda", imagen: "/imagenes/dmi2.jpg" },
    ],
    'parques-y-mas': [
      { titulo: "Parque Nacional Natural Tatamá", imagen: "/imagenes/tatama.jpg" },
      { titulo: "Parque Las Araucarias", imagen: "/imagenes/araucarias.jpg" },
      { titulo: "Parque Regional Natural Cuchilla de San Juan", imagen: "/imagenes/cuchilla.jpg" },
      { titulo: "Parque Natural Regional Santa Emilia", imagen: "/imagenes/santaemilia2.jpg" },
      { titulo: "Jardín Botánico UTP", imagen: "/imagenes/jardin.jpeg" },
      { titulo: "Jardín Botánico De Marsella", imagen: "/imagenes/jardinmarsella2.jpg" },
    ],
  };

  // Cargar lugares y categorías al iniciar
  useEffect(() => {
    loadCategories();
    loadPlaces();
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, categoriaFiltro]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const loadPlaces = async () => {
    try {
      setLoading(true);
      let data;
      
      if (categoriaFiltro === "todas") {
        // Cargar todos los lugares
        data = await placesService.getAll();
      } else {
        // Filtrar por categoría
        const categoria = categorias.find(cat => cat.slug === categoriaFiltro);
        if (categoria) {
          data = await placesService.getAll({ category_id: categoria.id });
        } else {
          data = await placesService.getAll();
        }
      }
      
      if (data && data.length > 0) {
        // Función para normalizar nombres (quitar acentos, espacios extra, etc.)
        const normalizarNombre = (str) => {
          if (!str) return '';
          return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/\s+/g, ' ') // Normalizar espacios
            .trim();
        };

        // Priorizar imágenes locales del fallback sobre imágenes de API
        // Orden determinístico: siempre procesar en el mismo orden
        const lugaresOrdenados = [...data].sort((a, b) => {
          // Ordenar por ID para garantizar orden consistente
          return (a.id || 0) - (b.id || 0);
        });

        const lugaresConImagenesPriorizadas = lugaresOrdenados.map((lugar, index) => {
          const nombreOriginal = lugar.name || '';
          const nombreLugar = normalizarNombre(nombreOriginal);
          
          // PRIMERO: Verificar si hay imagen subida (desde storage) - PRIORIDAD MÁXIMA
          const imagenSubida = lugar.image && (
            lugar.image.includes('/storage/places/') || 
            lugar.image.startsWith('/storage/') ||
            lugar.image.includes('storage/places') ||
            (lugar.image.startsWith('http') && lugar.image.includes('/storage/places/'))
          ) ? lugar.image : null;
          
          // SEGUNDO: Si no hay imagen subida, buscar en mapeo local
          let imagenLocal = null;
          if (!imagenSubida) {
            // Buscar en mapeo determinístico por nombre original
            imagenLocal = mapeoImagenesDeterministico[nombreOriginal];
            
            // Si no se encontró, buscar en mapeo normalizado
            if (!imagenLocal) {
              imagenLocal = mapeoImagenesLocales[nombreLugar];
            }
            
            // TERCERO: Si hay categoría filtrada, buscar en los fallbacks de esa categoría
            if (!imagenLocal && categoriaFiltro !== "todas") {
              const fallbacks = fallbacksPorCategoria[categoriaFiltro];
              if (fallbacks && fallbacks.length > 0) {
                // Buscar por coincidencia exacta primero (nombre original)
                let fallback = fallbacks.find(
                  fb => (fb.nombre || fb.titulo) === nombreOriginal
                );
                
                // Si no encuentra exacta, buscar por nombre normalizado
                if (!fallback) {
                  fallback = fallbacks.find(
                    fb => normalizarNombre(fb.nombre || fb.titulo) === nombreLugar
                  );
                }
                
                // Si aún no encuentra, buscar parcial (solo palabras clave importantes)
                if (!fallback) {
                  const palabrasClave = nombreLugar.split(' ').filter(p => p.length > 3);
                  fallback = fallbacks.find(
                    fb => {
                      const nombreFallback = normalizarNombre(fb.nombre || fb.titulo);
                      return palabrasClave.some(palabra => nombreFallback.includes(palabra));
                    }
                  );
                }
                
                // Si aún no encuentra, usar imagen del fallback por índice (último recurso)
                if (!fallback && index < fallbacks.length) {
                  fallback = fallbacks[index];
                }
                
                imagenLocal = fallback?.imagen || null;
              }
            }
            
            // CUARTO: Si no se encontró, buscar en las categorías del lugar
            if (!imagenLocal) {
              const lugarCategorias = lugar.categories || [];
              
              for (const cat of lugarCategorias) {
                const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-');
                const fallbacks = fallbacksPorCategoria[slug];
                
                if (fallbacks && fallbacks.length > 0) {
                  // Buscar por coincidencia exacta primero
                  let fallback = fallbacks.find(
                    fb => (fb.nombre || fb.titulo) === nombreOriginal
                  );
                  
                  // Si no encuentra exacta, buscar por nombre normalizado
                  if (!fallback) {
                    fallback = fallbacks.find(
                      fb => normalizarNombre(fb.nombre || fb.titulo) === nombreLugar
                    );
                  }
                  
                  // Si aún no encuentra, buscar parcial
                  if (!fallback) {
                    const palabrasClave = nombreLugar.split(' ').filter(p => p.length > 3);
                    fallback = fallbacks.find(
                      fb => {
                        const nombreFallback = normalizarNombre(fb.nombre || fb.titulo);
                        return palabrasClave.some(palabra => nombreFallback.includes(palabra));
                      }
                    );
                  }
                  
                  if (fallback?.imagen) {
                    imagenLocal = fallback.imagen;
                    break;
                  }
                }
              }
            }
          }
          
          // PRIORIDAD: imagen subida -> imagen local del mapeo -> placeholder (NUNCA imagen aleatoria de API)
          return {
            ...lugar,
            imagen: imagenSubida || imagenLocal || lugar.imagen || "/imagenes/placeholder.jpg",
            // Mantener image solo si es una imagen subida válida
            image: imagenSubida || null,
          };
        });
        setLugares(lugaresConImagenesPriorizadas);
      } else {
        setLugares([]);
      }
    } catch (error) {
      console.error("Error al cargar lugares:", error);
      setLugares([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await favoritesService.getAll();
      setFavoritos(data);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
    }
  };

  const toggleFavorito = async (lugar) => {
    if (!isAuthenticated) {
      setMessage("Debes iniciar sesión para agregar favoritos");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    const placeId = lugar.id;
    const isFavorite = favoritos.some(f => f.place_id === placeId || f.place?.id === placeId);
    
    // Actualización optimista
    setUpdatingFavorites({ ...updatingFavorites, [placeId]: true });
    const previousFavorites = [...favoritos];
    
    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const favorite = favoritos.find(f => f.place_id === placeId || f.place?.id === placeId);
        const favoritePlaceId = favorite?.place_id || favorite?.place?.id || placeId;
        
        setFavoritos(prev => prev.filter(f => (f.place_id !== favoritePlaceId && f.place?.id !== favoritePlaceId)));
        setMessage("✅ Eliminado de favoritos");
        
        await favoritesService.remove(favoritePlaceId);
      } else {
        // Agregar a favoritos
        const newFavorite = {
          id: Date.now(),
          place_id: placeId,
          place: {
            id: placeId,
            name: lugar.name,
          }
        };
        
        setFavoritos(prev => [...prev, newFavorite]);
        setMessage("Agregado a favoritos");
        
        await favoritesService.add(placeId);
        
        // Recargar favoritos para obtener el objeto completo
        const updatedFavorites = await favoritesService.getAll();
        setFavoritos(updatedFavorites);
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
      setFavoritos(previousFavorites);
      setMessage(error.response?.data?.message || "❌ Error al actualizar favorito");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUpdatingFavorites({ ...updatingFavorites, [placeId]: false });
    }
  };

  const eliminarFavorito = async (favoriteId, placeId) => {
    try {
      await favoritesService.remove(placeId);
      setFavoritos(favoritos.filter(f => f.id !== favoriteId));
      setMessage("Eliminado de favoritos");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      setMessage("Error al eliminar favorito");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const isFavorite = (lugarId) => {
    return favoritos.some(f => f.place_id === lugarId || f.place?.id === lugarId);
  };

  // Agrupar lugares por categoría para mostrar en secciones
  const lugaresPorCategoria = lugares.reduce((acc, lugar) => {
    lugar.categories?.forEach(categoria => {
      if (!acc[categoria.slug]) {
        acc[categoria.slug] = {
          categoria: categoria,
          lugares: []
        };
      }
      // Evitar duplicados
      if (!acc[categoria.slug].lugares.find(l => l.id === lugar.id)) {
        acc[categoria.slug].lugares.push(lugar);
      }
    });
    return acc;
  }, {});

  if (loading) {
    return (
      <>
        {isAuthenticated && user ? <Header2 /> : <Header />}
        <div className="contenedorTodo" style={{ marginTop: "100px", textAlign: "center", padding: "50px" }}>
          <p>Cargando lugares...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {isAuthenticated && user ? <Header2 /> : <Header />}
      <div className="contenedorTodo" style={{ marginTop: "100px" }}>
        <h1>Lugares de Ecoturismo en Risaralda</h1>

        {message && (
          <div style={{
            padding: "12px 20px",
            margin: "10px 0",
            backgroundColor: message.includes("Error") ? "#fee" : "#efe",
            color: message.includes("Error") ? "#c00" : "#0a0",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            animation: "slideDown 0.3s ease"
          }}>
            {message}
          </div>
        )}

        {/* Filtro de categorías */}
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <label htmlFor="categoria-filtro" style={{ marginRight: "10px", fontWeight: "bold" }}>
                Filtrar por categoría:
              </label>
              <select
                id="categoria-filtro"
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                style={{
                  padding: "8px 15px",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                  cursor: "pointer"
                }}
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Link 
              to="/mapa"
              style={{
                padding: "10px 20px",
                background: "#2ecc71",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(46, 204, 113, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#27ae60";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(46, 204, 113, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#2ecc71";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(46, 204, 113, 0.3)";
              }}
            >
              <span>Ver en Mapa</span>
            </Link>
          </div>
        </div>

        {isAuthenticated && (
          <button 
            className="mostrar-favoritos" 
            onClick={() => setPopupVisible(true)}
            style={{ marginBottom: "20px" }}
          >
            Favoritos (<span>{favoritos.length}</span>)
          </button>
        )}

        {lugares.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ fontSize: "1.2em", color: "#666" }}>
              {categoriaFiltro === "todas" 
                ? "Aún no hay lugares disponibles." 
                : "No hay lugares en esta categoría."}
            </p>
          </div>
        ) : (
          <>
            {/* Mostrar lugares agrupados por categoría si se selecciona "todas" */}
            {categoriaFiltro === "todas" ? (
              Object.entries(lugaresPorCategoria).map(([slug, data], index) => (
                <div key={slug} className={`contenedor${index > 0 ? index + 1 : ''}`}>
                  <h2 style={{ marginBottom: "20px", color: "#2c5530" }}>
                    {data.categoria.icon} {data.categoria.name}
                  </h2>
                  <div className="cards">
                    {data.lugares.map((lugar) => (
                      <div className="card" key={lugar.id}>
                        <img 
                          src={lugar.imagen || lugar.image || "/imagenes/placeholder.jpg"} 
                          alt={lugar.name}
                          onError={(e) => {
                            e.target.src = "/imagenes/placeholder.jpg";
                          }}
                        />
                        <h4>{lugar.name}</h4>
                        <p className="ubicacion-text">{lugar.location}</p>
                        <p className="descripcion">
                          {lugar.description 
                            ? (lugar.description.length > 150 
                                ? lugar.description.substring(0, 150) + "..." 
                                : lugar.description)
                            : "Sin descripción disponible"}
                        </p>

                        <div className="card-actions">
                          <div className="action-buttons">
                            <a 
                              href={lugar.latitude && lugar.longitude 
                                ? `https://www.google.com/maps?q=${lugar.latitude},${lugar.longitude}` 
                                : "#"} 
                              target="_blank" 
                              rel="noreferrer"
                              className="map-button"
                              title="Ver en mapa"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                              </svg>
                              <span>Mapa</span>
                            </a>
                            <button 
                              className="info-button"
                              onClick={() => {
                                if (isAuthenticated) {
                                  setReservationModal({ isOpen: true, place: lugar });
                                } else {
                                  setMessage("Debes iniciar sesión para reservar");
                                  setTimeout(() => {
                                    navigate("/login");
                                  }, 1500);
                                }
                              }}
                            >
                              Reservar Visita
                            </button>
                          </div>
                          {isAuthenticated && (
                            <button 
                              className="favorito" 
                              onClick={() => toggleFavorito(lugar)}
                              disabled={updatingFavorites[lugar.id]}
                              title={isFavorite(lugar.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                              style={{
                                opacity: updatingFavorites[lugar.id] ? 0.6 : 1,
                                cursor: updatingFavorites[lugar.id] ? "wait" : "pointer",
                                transition: "all 0.3s ease",
                                transform: updatingFavorites[lugar.id] ? "scale(0.9)" : "scale(1)"
                              }}
                            >
                              {updatingFavorites[lugar.id] ? "..." : (isFavorite(lugar.id) ? "♥" : "♡")}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Mostrar todos los lugares de la categoría seleccionada
              <div className="contenedor">
                <div className="cards">
                  {lugares.map((lugar) => (
                    <div className="card" key={lugar.id}>
                      <img 
                        src={lugar.imagen || lugar.image || "/imagenes/placeholder.jpg"} 
                        alt={lugar.name}
                        onError={(e) => {
                          e.target.src = "/imagenes/placeholder.jpg";
                        }}
                      />
                      <h4>{lugar.name}</h4>
                      <p className="ubicacion-text">{lugar.location}</p>
                      <p className="descripcion">
                        {lugar.description 
                          ? (lugar.description.length > 150 
                              ? lugar.description.substring(0, 150) + "..." 
                              : lugar.description)
                          : "Sin descripción disponible"}
                      </p>

                      <div className="card-actions">
                        <div className="action-buttons">
                          <a 
                            href={lugar.latitude && lugar.longitude 
                              ? `https://www.google.com/maps?q=${lugar.latitude},${lugar.longitude}` 
                              : "#"} 
                            target="_blank" 
                            rel="noreferrer"
                            className="map-button"
                            title="Ver en mapa"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                            </svg>
                            <span>Mapa</span>
                          </a>
                          <Link 
                            to={`/lugares/${lugar.id}`}
                            className="info-button"
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                          >
                            Ver Detalles
                          </Link>
                        </div>
                        {isAuthenticated && (
                          <button 
                            className="favorito" 
                            onClick={() => toggleFavorito(lugar)}
                            disabled={updatingFavorites[lugar.id]}
                            title={isFavorite(lugar.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                            style={{
                              opacity: updatingFavorites[lugar.id] ? 0.6 : 1,
                              cursor: updatingFavorites[lugar.id] ? "wait" : "pointer",
                              transition: "all 0.3s ease",
                              transform: updatingFavorites[lugar.id] ? "scale(0.9)" : "scale(1)"
                            }}
                          >
                            {updatingFavorites[lugar.id] ? "..." : (isFavorite(lugar.id) ? "♥" : "♡")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Botón Volver */}
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <Link to="/">
            <button className="volver2">Volver</button>
          </Link>
        </div>

        {/* Mensaje final */}
        <div className="final-message">
          {!isAuthenticated ? (
            <p>
              Si quieres agregar lugares a favoritos → <Link to="/login">Inicia Sesión</Link>
            </p>
          ) : (
            <p>
              Explora más lugares y agrégalos a tus favoritos
            </p>
          )}
        </div>

        {/* Modal de reserva */}
        {reservationModal.isOpen && reservationModal.place && (
          <ReservationModal
            place={reservationModal.place}
            isOpen={reservationModal.isOpen}
            onClose={() => setReservationModal({ isOpen: false, place: null })}
            onSuccess={(reservation) => {
              setMessage(`Reserva creada para ${reservationModal.place.name}`);
              setTimeout(() => setMessage(""), 3000);
            }}
          />
        )}

        {/* Popup de favoritos */}
        {popupVisible && (
          <div className="popup-overlay" onClick={() => setPopupVisible(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="cerrar-popup" 
                onClick={() => setPopupVisible(false)}
              >
                ✕
              </button>
              <h2>Mis Favoritos</h2>
              {favoritos.length === 0 ? (
                <p className="mensaje-vacio">No has agregado ningún lugar aún.</p>
              ) : (
                <ul className="favoritos-list">
                  {favoritos.map(f => {
                    const placeId = f.place_id || f.place?.id;
                    const placeName = f.place?.name || "Lugar sin nombre";
                    return (
                      <li key={f.id}>
                        {placeName}
                        <button 
                          className="eliminar-favorito" 
                          onClick={() => eliminarFavorito(f.id, placeId)}
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default PlacesPage;
