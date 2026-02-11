import React, { useState } from "react";
import { Link } from "react-router-dom";
import icono from "@/react/components/imagenes/iconoecoturismo.jpg";
import "./Header.css";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* HEADER */}
      <header>
        <div className="header-container">
          <Link to="/" className="logo-principal">
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
            <Link to="/comentarios" onClick={closeMobileMenu}>Reseñas</Link>
            <Link to="/lugares" onClick={closeMobileMenu}>Lugares</Link>
            <Link to="/ecohoteles" onClick={closeMobileMenu}>Ecohoteles</Link>
            <Link to="/contacto" onClick={closeMobileMenu}>Contacto</Link>
            <Link to="/login" onClick={closeMobileMenu}>Login</Link>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
