import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import icono from "../imagenes/iconoecoturismo.jpg";
import usuarioImg from "../imagenes/usuario.jpg";
import "./Header2.css";

const Header2 = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [openPlacesMenu, setOpenPlacesMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const placesDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Verificar si es usuario empresa
  const isCompanyUser = user?.tipo_usuario === 'empresa';

  // DEBUG: Mostrar datos del usuario en consola
  useEffect(() => {
    console.log('👤 User data:', user);
    console.log('🏢 isCompanyUser:', isCompanyUser);
    console.log('🏢 user?.tipo_usuario:', user?.tipo_usuario);
  }, [user, isCompanyUser]);

  const togglePlacesMenu = () => {
    setOpenPlacesMenu((prev) => !prev);
    setOpenUserMenu(false); // Cerrar el otro menú
  };

  const toggleUserMenu = () => {
    setOpenUserMenu((prev) => !prev);
    setOpenPlacesMenu(false); // Cerrar el otro menú
  };

  // Cierra los menús si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (placesDropdownRef.current && !placesDropdownRef.current.contains(event.target)) {
        setOpenPlacesMenu(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cierra los menús al hacer clic en un enlace
  const handleLinkClick = () => {
    setOpenPlacesMenu(false);
    setOpenUserMenu(false);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setOpenPlacesMenu(false);
      setOpenUserMenu(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header>
      <div className="header-container">
        <Link to="/pagLogueados" className="logo-principal">
          <img src={icono} alt="Logo" width="60" />
          <div className="titulos">
            <h2 className="risaralda">RisaraldaEcoTurismo</h2>
          </div>
        </Link>

        {/* Botón hamburguesa */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={mobileMenuOpen ? "hamburger open" : "hamburger"}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <nav className={`navbar ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <Link to="/comentarios2" className="nav-link">Reseñas</Link>

          {/* Menú desplegable de Lugares */}
          <div className="dropdown" ref={placesDropdownRef}>
            <button
              className="dropdown-btn"
              onClick={togglePlacesMenu}
              aria-expanded={openPlacesMenu}
              aria-haspopup="true"
            >
              Lugares <span className="arrow">{openPlacesMenu ? "▲" : "▼"}</span>
            </button>

            {openPlacesMenu && (
              <ul className="dropdown-menu" role="menu">
                <li>
                  <Link 
                    to="/paraisosAcuaticos" 
                    role="menuitem"
                    onClick={handleLinkClick}
                  >
                    Lugares Acuáticos
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/lugaresMontanosos" 
                    role="menuitem"
                    onClick={handleLinkClick}
                  >
                    Lugares Montañosos
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/parquesYMas" 
                    role="menuitem"
                    onClick={handleLinkClick}
                  >
                    Parques y Más
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/lugares" 
                    role="menuitem"
                    onClick={handleLinkClick}
                  >
                    Todos los Lugares
                  </Link>
                </li>
              </ul>
            )}
          </div>

          <Link to="/contacto" className="nav-link">Contacto</Link>

          {/* Botón especial para usuarios empresa */}
          {isCompanyUser && (
            <a 
              href="/empresa/dashboard" 
              className="nav-link company-dashboard-btn"
              onClick={handleLinkClick}
              style={{
                backgroundColor: '#0d6efd',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              📊 Ver Mis Reservas
            </a>
          )}

          {/* Menú desplegable de Usuario */}
          <div className="dropdown user-dropdown" ref={userDropdownRef}>
            <button
              className="dropdown-btn user-menu-btn"
              onClick={toggleUserMenu}
              aria-expanded={openUserMenu}
              aria-haspopup="true"
            >
              <img 
                src={user?.foto_perfil || usuarioImg} 
                alt={user?.name || "Usuario"}
                className="user-avatar"
                onError={(e) => {
                  e.target.src = usuarioImg;
                }}
              />
              <span className="user-name">{user?.name || "Usuario"}</span>
              <span className="arrow">{openUserMenu ? "▲" : "▼"}</span>
            </button>

            {openUserMenu && (
              <ul className="dropdown-menu user-menu" role="menu">
                <li>
                  <Link 
                    to="/perfil" 
                    role="menuitem"
                    onClick={handleLinkClick}
                  >
                    Mi Perfil
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/reservas" 
                    role="menuitem"
                    onClick={handleLinkClick}
                  >
                    Mis Reservas
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/favoritos" 
                    role="menuitem"
                    onClick={handleLinkClick}
                  >
                    Mis Favoritos
                  </Link>
                </li>
                {isAdmin && (
                  <>
                    <li className="menu-divider"></li>
                    <li>
                      <Link 
                        to="/admin/panel" 
                        role="menuitem"
                        onClick={handleLinkClick}
                        className="admin-link"
                      >
                        Panel de Admin
                      </Link>
                    </li>
                  </>
                )}
                <li className="menu-divider"></li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="menu-button logout-btn"
                    role="menuitem"
                  >
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header2;
