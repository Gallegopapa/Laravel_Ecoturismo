import { Link, useLocation } from "react-router-dom";
import "../login/page.css";

export default function ForgotPasswordSentPage() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="login-page-container">
      <video id="bg-video" autoPlay loop muted>
        <source src="/imagenes/Videofondo4.mp4" type="video/mp4" />
      </video>

      <header className="header">
        <h1>Risaralda EcoTurismo</h1>
      </header>

      <div className="login-card">
        <h2>Correo enviado</h2>
        <p className="message success">
          Enviamos el enlace de recuperacion{email ? ` a ${email}` : ""}. Revisa tu bandeja y spam.
        </p>
        <p className="register-text">
          ¿Ya tienes el enlace? <Link to="/reset-password">Restablecer contrasena</Link>
        </p>
        <p className="register-text">
          ¿Quieres intentar con otro correo? <Link to="/forgot-password">Volver</Link>
        </p>
        <p className="register-text">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </div>

      <footer className="footer">© 2025 Risaralda EcoTurismo</footer>
    </div>
  );
}
