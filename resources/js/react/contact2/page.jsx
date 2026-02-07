import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import "./page.css";

export default function Contact2() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [messageError, setMessageError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "message") {
      // mostrar error si excede 500, pero permitir escribir
      if (value.length > 500) {
        setMessageError("El mensaje no debe tener más de 500 caracteres.");
      } else {
        setMessageError("");
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validación final antes de enviar
    if ((formData.message || "").length > 500) {
      setMessageError("El mensaje no debe tener más de 500 caracteres.");
      return;
    }
    console.log("Formulario enviado:", formData);
    // Aquí puedes agregar la lógica para enviar el formulario
    alert("¡Mensaje enviado con éxito!");
    setFormData({ name: "", email: "", phone: "", message: "" });
    setMessageError("");
  };

  return (
    <>
      <Header2 />
      <div className="container-contact" style={{ marginTop: "100px" }}>
        <div className="form">

          {/* ------- COLUMNA IZQUIERDA ------- */}
          <div className="contact-info">
            <h3 className="tittle">Pongámonos en contacto</h3>
            <p className="text">
              Escríbenos y te ayudamos a encontrar la mejor opción para tu experiencia de ecoturismo
            </p>

            <div className="info">
              <div className="information">
                <img src="src/assets/maps-and-location.png" className="icon" alt="Ubicación" />
                <p>Dosquebradas-Pereira</p>
              </div>

              <div className="information">
                <img src="src/assets/correo-electronico.png" className="icon" alt="Email" />
                <a href="mailto:proyectoecoturismo2@gmail.com">
                  <p>proyectoecoturismo2@gmail.com</p>
                </a>
              </div>

              <div className="information">
                <img src="src/assets/telefono.png" className="icon" alt="Teléfono" />
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
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                  <img src="src/assets/iconofb.png" width="30px" alt="Facebook" />
                </a>

                <a href="https://www.whatsapp.com" target="_blank" rel="noopener noreferrer">
                  <img src="src/assets/iconowp.png" width="30px" alt="WhatsApp" />
                </a>

                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                  <img src="src/assets/iconoig.png" width="30px" alt="Instagram" />
                </a>
              </div>
            </div>
          </div>

          {/* ------- COLUMNA DERECHA ------- */}
          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              <h3 className="tittle">Contáctanos</h3>

              <div className="input-container">
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
              </div>

              <div className="input-container">
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
              </div>

              <div className="input-container">
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
              </div>

              <div className="input-container textarea">
                <textarea
                  name="message"
                  className="input"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
                <label>Mensaje</label>
                <span>Mensaje</span>
              </div>
              <div className={`char-counter ${formData.message.length > 500 ? 'error' : ''}`}>
                {formData.message.length}/500
              </div>
              {messageError && <p className="error-message">{messageError}</p>}

              <input type="submit" value="Enviar" className="btn" />
            </form>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
