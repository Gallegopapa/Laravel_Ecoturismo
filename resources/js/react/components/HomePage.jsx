import React from "react";
import './HomePage.css';

const HomePage = ({ loggedIn, user }) => {
  return (
    <div className="homepage">
      {/* Hero/banner */}
      <section className="hero">
        <img src="/imagenes/slideone.jpg" alt="Risaralda EcoTurismo" className="hero-img" />
        <div className="hero-content">
          <h1>{loggedIn ? `¡Bienvenido, ${user?.name || 'usuario'}!` : 'Descubre Risaralda EcoTurismo'}</h1>
          <p>{loggedIn ? 'Explora lugares, eventos y novedades.' : 'Reserva, explora y disfruta los mejores destinos de Risaralda.'}</p>
          {!loggedIn && <button className="hero-btn">Iniciar sesión</button>}
        </div>
      </section>

      {/* Beneficios para no logueados */}
      {!loggedIn && (
        <section className="beneficios">
          <h2>Beneficios de iniciar sesión</h2>
          <div className="beneficios-cards">
            <div className="beneficio-card">
              <span className="icon">🌟</span>
              <h3>Reserva fácil</h3>
              <p>Accede a reservas rápidas y seguras.</p>
            </div>
            <div className="beneficio-card">
              <span className="icon">💬</span>
              <h3>Comentarios y reseñas</h3>
              <p>Comparte tu experiencia y lee opiniones.</p>
            </div>
            <div className="beneficio-card">
              <span className="icon">❤️</span>
              <h3>Favoritos</h3>
              <p>Guarda tus lugares preferidos.</p>
            </div>
          </div>
        </section>
      )}

      {/* Lugares destacados */}
      <section className="destacados">
        <h2>Lugares destacados</h2>
        <div className="lugares-cards">
          {/* Ejemplo de tarjetas, reemplazar por datos reales */}
          <div className="lugar-card">
            <img src="/imagenes/ukumari.jpg" alt="Parque Natural Ucumari" />
            <h3>Parque Natural Ucumari</h3>
            <p>Explora la biodiversidad y senderos únicos.</p>
            <button>Ver más</button>
          </div>
          <div className="lugar-card">
            <img src="/imagenes/termales.jpg" alt="Termales Santa Rosa" />
            <h3>Termales Santa Rosa</h3>
            <p>Relájate en aguas termales rodeado de naturaleza.</p>
            <button>Ver más</button>
          </div>
          <div className="lugar-card">
            <img src="/imagenes/farallones.jpeg" alt="Reserva Otún Quimbaya" />
            <h3>Reserva Otún Quimbaya</h3>
            <p>Descubre aves y paisajes espectaculares.</p>
            <button>Ver más</button>
          </div>
        </div>
      </section>

      {/* Novedades/eventos para logueados */}
      {loggedIn && (
        <section className="novedades">
          <h2>Novedades y eventos</h2>
          <div className="novedades-cards">
            <div className="novedad-card">
              <h3>Festival de Ecoturismo</h3>
              <p>Participa en actividades y charlas sobre turismo sostenible.</p>
              <span className="fecha">15-18 Feb</span>
            </div>
            <div className="novedad-card">
              <h3>Sendero nocturno</h3>
              <p>Recorre el bosque en una experiencia única.</p>
              <span className="fecha">22 Feb</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
