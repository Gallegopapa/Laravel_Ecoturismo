import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/api";
import "../login/page.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMsg("");
    setLoading(true);

    try {
      const response = await authService.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMsg(response.message || "Contrasena restablecida correctamente.");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 800);
    } catch (error) {
      const data = error.response?.data;
      const errorMessage = data?.message || "No se pudo restablecer la contrasena.";
      setMsg(errorMessage);
      if (data?.errors) {
        setErrors(data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <video id="bg-video" autoPlay loop muted>
        <source src="/imagenes/Videofondo4.mp4" type="video/mp4" />
      </video>

      <header className="header">
        <h1>Risaralda EcoTurismo</h1>
      </header>

      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Restablecer contrasena</h2>

        <label>Correo electronico:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p className="error">
            {Array.isArray(errors.email) ? errors.email[0] : errors.email}
          </p>
        )}

        <label>Token:</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          placeholder="Token recibido por correo"
        />
        {errors.token && (
          <p className="error">
            {Array.isArray(errors.token) ? errors.token[0] : errors.token}
          </p>
        )}

        <label>Nueva contrasena:</label>
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            maxLength={20}
            placeholder="Ingresa tu contrasena (6-20 caracteres)"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {errors.password && (
          <p className="error">
            {Array.isArray(errors.password) ? errors.password[0] : errors.password}
          </p>
        )}

        <label>Confirmar contrasena:</label>
        <div className="password-container">
          <input
            type={showPasswordConfirmation ? "text" : "password"}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            minLength={6}
            maxLength={20}
            placeholder="Confirma tu contrasena (6-20 caracteres)"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
            aria-label={showPasswordConfirmation ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            {showPasswordConfirmation ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {errors.password_confirmation && (
          <p className="error">
            {Array.isArray(errors.password_confirmation)
              ? errors.password_confirmation[0]
              : errors.password_confirmation}
          </p>
        )}

        {msg && (
          <p
            className={`message ${
              msg.includes("No se pudo") || msg.includes("Error") ? "error" : "success"
            }`}
          >
            {msg}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : "Restablecer"}
        </button>

        <p className="register-text">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </form>

      <footer className="footer">© 2025 Risaralda EcoTurismo</footer>
    </div>
  );
}
