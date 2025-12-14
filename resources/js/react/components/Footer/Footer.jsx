import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <>
      {/* FOOTER */}
          <footer className="containerFooter">
            <div className="footer-inner">
              <p className="footer-copy">&copy; 2025 RisaraldaEcoTurismo</p>
              <p className="footer-links">
                <a href="/cookies" onClick={(e)=>{e.preventDefault(); window.location.href = '/cookies';}}>Cookies</a>
                <span className="sep">|</span>
                <a href="/terminos-de-uso" onClick={(e)=>{e.preventDefault(); window.location.href = '/terminos-de-uso';}}>Términos de uso</a>
                <span className="sep">|</span>
                <a href="/politica-de-privacidad" onClick={(e)=>{e.preventDefault(); window.location.href = '/politica-de-privacidad';}}>Política de privacidad</a>
              </p>
            </div>
          </footer>
    </>
  );
};

export default Footer;

