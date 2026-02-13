import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./page.css";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const isRegister = location.pathname === "/registro";
  const emailInputRef = useRef(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Sincronizar valor de autocompletado del navegador con el estado (evita que se vea en blanco)
  const syncEmailFromAutofill = () => {
    if (emailInputRef.current && emailInputRef.current.value && !email) {
      setEmail(emailInputRef.current.value);
    }
  };
  useEffect(() => {
    const t = setTimeout(syncEmailFromAutofill, 100);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!isRegister) {
      const t = setTimeout(syncEmailFromAutofill, 300);
      return () => clearTimeout(t);
    }
  }, [isRegister]);

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
          email,
          password,
          password_confirmation: passwordConfirmation,
        });
      } else {
        // Login por correo o usuario (usar ref si el estado está vacío por autocompletado)
        const loginValue = email || (emailInputRef.current?.value ?? "");
        result = await login({
          login: loginValue,
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

      <div className={`login-page-container ${isRegister ? 'register-layout' : 'login-layout'}`}> 
        <video id="bg-video" autoPlay loop muted>
          <source src="/imagenes/Videofondo4.mp4" type="video/mp4" />
        </video>

        <header className="header">
          <h1>🌿 Risaralda EcoTurismo</h1>
        </header>

        {/* SECCIÓN DE FORMULARIO - Izquierda o Derecha según tipo */}
        <div className="login-form-section">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>{isRegister ? "Registro" : "Iniciar Sesión"}</h2>
          
          {isRegister ? (
            <>
              <label>Nombre de usuario:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Tu nombre"
              />
              {errors.name && <p className="error">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>}
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
              />
              {errors.email && <p className="error">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
            </>
          ) : (
            <>
              <label>Correo o usuario:</label>
              <input
                ref={emailInputRef}
                type="text"
                name="login"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={syncEmailFromAutofill}
                required
                placeholder="Email o usuario"
              />
              {(errors.login || errors.email || errors.credentials) && (
                <p className="error">
                  {Array.isArray(errors.login) ? errors.login[0] : errors.login ||
                   Array.isArray(errors.email) ? errors.email[0] : errors.email ||
                   Array.isArray(errors.credentials) ? errors.credentials[0] : errors.credentials}
                </p>
              )}
            </>
          )}

          <label>Contraseña:</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Tu contraseña"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {errors.password && <p className="error">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}


          {isRegister && (
            <>
              <label>Confirmar contraseña:</label>
              <div className="password-container">
                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Confirma contraseña"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  aria-label={showPasswordConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPasswordConfirmation ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
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
  
          {!isRegister && (
            <p className="register-text">
              ¿Has olvidado tu contraseña? <Link to="/forgot-password">Recupérala</Link>
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
        </div>

        {/* SECCIÓN DE IMAGEN - Derecha o Izquierda según tipo */}
        <div className="login-image-section">
          <div className="login-image-content">
            {/* El usuario puede reemplazar esta imagen */}
            <img src="/imagenes/heroImage.jpg" alt="Risaralda EcoTurismo" style={{display: 'none'}} />
            
            <h2>{isRegister ? "Únete a Nosotros" : "Explora la Naturaleza"}</h2>
            <p>
              {isRegister 
                ? "Acceso a reservas exclusivas, recomendaciones personalizadas y una comunidad de viajeros apasionados por la naturaleza."
                : "Descubre los destinos ecológicos más hermosos de Risaralda. Reserva tu experiencia de ecoturismo hoy mismo."}
            </p>
          </div>
        </div>

        <footer className="footer">© 2025 Risaralda EcoTurismo</footer>
      </div>
    </>
  );
}
