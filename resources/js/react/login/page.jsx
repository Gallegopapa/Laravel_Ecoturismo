import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./page.css";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const isRegister = location.pathname === "/registro";
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, redirigir a la página de usuarios logueados
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/pagLogueados", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMsg("");
    setLoading(true);

    try {
      let result;
      
      if (isRegister) {
        // Registro
        result = await register({
          name: username,
          email: email || null,
          password,
          password_confirmation: passwordConfirmation,
        });
      } else {
        // Login
        result = await login({
          name: username,
          password,
        });
      }

      if (result.success) {
        // Mostrar mensaje de éxito brevemente
        setMsg("¡Inicio de sesión exitoso! Redirigiendo...");
        // Pequeño delay para asegurar que el estado se actualice
        setTimeout(() => {
          navigate("/pagLogueados", { replace: true });
        }, 500);
      } else {
        // Mostrar error específico
        const errorMsg = result.error || "Error al procesar la solicitud";
        setMsg(errorMsg);
        if (result.errors) {
          setErrors(result.errors);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setMsg("Error inesperado. Por favor, intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <>

      <div className="container">
        <video id="bg-video" autoPlay loop muted>
          <source src="/imagenes/Videofondo4.mp4" type="video/mp4" />
        </video>

        <header className="header">
          <h1>Risaralda EcoTurismo</h1>
        </header>

      
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>{isRegister ? "Registro" : "Iniciar Sesión"}</h2>
          
          <label>Nombre de usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Ingresa tu nombre de usuario"
          />
          {errors.name && <p className="error">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>}

          {isRegister && (
            <>
              <label>Email (opcional):</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
              {errors.email && <p className="error">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
            </>
          )}

          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Ingresa tu contraseña"
          />
          {errors.password && <p className="error">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}

          {isRegister && (
            <>
              <label>Confirmar contraseña:</label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                placeholder="Confirma tu contraseña"
              />
              {errors.password_confirmation && <p className="error">{Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}</p>}
            </>
          )}

          {!isRegister && (
            <p className="register-text">
              ¿Todavía no tienes cuenta? <Link to="/registro">Regístrate</Link>
            </p>
          )}

          {isRegister && (
            <p className="register-text">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          )}
  

          {msg && (
            <p className={`message ${
              msg.includes("Error") || 
              msg.includes("incorrectas") || 
              msg.includes("incorrecta") || 
              msg.includes("requerida") ||
              msg.includes("inválido")
                ? "error" 
                : msg.includes("exitoso") || msg.includes("Redirigiendo")
                ? "success"
                : ""
            }`}>
              {msg}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Procesando..." : isRegister ? "Registrarse" : "Iniciar sesión"}
          </button>
        </form>

        <footer className="footer">© 2025 Risaralda EcoTurismo</footer>
      </div>
    </>
  );
}
