import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/react/context/AuthContext";
import Header from "@/react/components/Header/Header";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import "./contacto.css";

export default function Contact() {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo no es válido";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!/^\d{7,10}$/.test(formData.phone)) {
      newErrors.phone = "El teléfono debe tener entre 7 y 10 dígitos";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "El mensaje es requerido";
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Aquí iría la lógica para enviar el formulario
    // Por ahora solo mostramos mensaje de éxito
    setSuccessMsg("¡Mensaje enviado exitosamente!");
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
    
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <>
      {isAuthenticated ? <Header2 /> : <Header />}
      
      <div className="container">
      <div className="form">

        {/* ------- COLUMNA IZQUIERDA ------- */}
        <div className="contact-info">
          <h3 className="tittle">Pongámonos en contacto</h3>
          <p className="text">
            Escríbenos y te buscamos la mejor opción para tu página
          </p>

          <div className="info">

            <div className="information">
              <img src="src/assets/maps-and-location.png" className="icon" alt="" />
              <p>Dosquebradas-Pereira</p>
            </div>

            <div className="information">
              <img src="src/assets/correo-electronico.png" className="icon" alt="" />
              <a href="mailto:proyectoecoturismo2@gmail.com">
                <p>proyectoecoturismo2@gmail.com</p>
              </a>
            </div>

            <div className="information">
              <img src="src/assets/telefono.png" className="icon" alt="" />
              <a href="tel:3134152020">
                <p>3134152020</p>
              </a>
            </div>

            <div className="information copyright">
              <p>© 2025 RisaraldaEcoTurismo</p>
            </div>

          </div>

          {/* Redes sociales */}
          <div className="social-media">
            <p>Conéctate con nosotros:</p>
            <div className="social-icon">
              <a href="https://www.facebook.com">
                <img src="src/assets/iconofb.png" width="30px" alt="" />
              </a>

              <a href="https://www.whatsapp.com">
                <img src="src/assets/iconowp.png" width="30px" alt="" />
              </a>

              <a href="https://www.instagram.com">
                <img src="src/assets/iconoig.png" width="30px" alt="" />
              </a>

              <button id="volver">
                <a href="pagcentral.html">Volver</a>
              </button>
            </div>
          </div>
        </div>

        {/* ------- COLUMNA DERECHA ------- */}
        <div className="contact-form">

          <form onSubmit={handleSubmit}>
            <h3 className="tittle">Contáctanos</h3>

            {successMsg && (
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#d4edda', 
                color: '#155724', 
                borderRadius: '5px', 
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                {successMsg}
              </div>
            )}

            <div className="input-container focus">
              <input 
                type="text" 
                name="name" 
                className="input" 
                value={formData.name}
                onChange={handleChange}
                required
              />
              <label>Nombre de usuario</label>
              <span>Nombre de usuario</span>
              {errors.name && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.name}</p>}
            </div>

            <div className="input-container focus">
              <input 
                type="email" 
                name="email" 
                className="input"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label>Correo</label>
              <span>Correo</span>
              {errors.email && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.email}</p>}
            </div>

            <div className="input-container focus">
              <input 
                type="tel" 
                name="phone" 
                className="input"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <label>Teléfono</label>
              <span>Teléfono</span>
              {errors.phone && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.phone}</p>}
            </div>

            <div className="input-container textarea focus">
              <textarea 
                name="message" 
                className="input"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <label>Mensaje</label>
              <span>Mensaje</span>
              {errors.message && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.message}</p>}
            </div>

            <input type="submit" value="Enviar" className="btn" />

            <Link to={isAuthenticated ? "/pagLogueados" : "/"} style={{ 
              display: 'inline-block', 
              marginTop: '15px', 
              textAlign: 'center',
              color: '#555',
              textDecoration: 'none'
            }}>
            </Link>
          </form>

        </div>

      </div>
      </div>
      
      <Footer />
    </>
  );
}
