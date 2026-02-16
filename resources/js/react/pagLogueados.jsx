import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "@/react/components/HomePage.css";
import Slider from "@/react/components/slider/Slider";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import AccessibilityPanel from "@/react/components/AccessibilityPanel/AccessibilityPanel.jsx";
    if (!loggedIn) {
        return (
            <div className="page-layout">
                <Header2 />
                <main className="homepage">
                    {/* ...existing code... */}
                </main>
                <Footer />
                {/* AccessibilityPanel agregado */}
                <AccessibilityPanel />
            </div>
        );
                            src="/imagenes/slideone.jpg"
                            alt="Playa"
                            className="hero-initial-bg"
                        />
                        <div className="hero-initial-overlay"></div>
                        <div className="hero-initial-content">
                            <h2 className="hero-initial-title">
                                Bienvenidos a RisaraldaEcoturismo
                            </h2>
                            <p className="hero-initial-sub">
                                Nosotros nos encargamos de llevarte.
                            </p>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1440 320"
                            preserveAspectRatio="none"
                            className="wave-svg"
                        >
                            <path
                                fill="whitesmoke"
                                fillOpacity="1"
                                d="M0,160L60,144C120,128,240,96,360,101.3C480,107,600,149,720,154.7C840,160,960,128,1080,106.7C1200,85,1320,75,1380,69.3L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                            ></path>
                        </svg>
                        <div
                            className="scroll-indicator"
                            onClick={() => {
                                const target = document.querySelector('.destacados');
                                if (target) {
                                    const offset = 40; // ajuste para quedar antes del título (baja un poco más)
                                    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                                    window.scrollTo({ top, behavior: 'smooth' });
                                } else {
                                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                                }
                            }}
                            // Vista logueados
                            return (
                                <div className="page-layout">
                                    <Header2 />
                                    <main className="homepage">
                                        {/* ...existing code... */}
                                    </main>
                                    <Footer />
                                    {/* AccessibilityPanel agregado */}
                                    <AccessibilityPanel />
                                </div>
                            );
                                className="btn-terciary"
                                onClick={goEmpresa}
                            >
                                Registrar empresa
                            </button>
                            <button className="btn-terciary" onClick={goPerfil}>
                                Mi perfil
                            </button>
                        </div>
                    </div>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                        className="wave-svg"
                    >
                        <path
                            fill="#ffffff"
                            fillOpacity="1"
                            d="M0,160L60,144C120,128,240,96,360,101.3C480,107,600,149,720,154.7C840,160,960,128,1080,106.7C1200,85,1320,75,1380,69.3L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                        ></path>
                    </svg>
                </section>

                <Slider />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    className="wave-svg"
                >
                    <path
                        fill="whitesmoke"
                        fillOpacity="1"
                        d="M0,160L60,144C120,128,240,96,360,101.3C480,107,600,149,720,154.7C840,160,960,128,1080,106.7C1200,85,1320,75,1380,69.3L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                    ></path>
                </svg>

                {/* DESTINOS DESTACADOS */}
                <section className="destacados section-alt">
                    <h2>Destinos populares</h2>
                    <p className="destacados-sub">
                        Explora los destinos favoritos de nuestros viajeros
                    </p>
                    <div className="destinos-grid">
                        {destinos.map((d) => (
                            <div className="destino-card" key={d.id} onClick={() => goPlaceDetail(d.id)} style={{ cursor: 'pointer' }}>
                                <div className="destino-img-wrap">
                                    <img src={d.img} alt={d.title} />
                                </div>
                                <div className="destino-body">
                                    <h3 className="destino-title">{d.title}</h3>
                                    <span className="destino-country">Colombia</span>
                                    <p className="destino-desc">{d.desc}</p>
                                    <div className="destino-footer">
                                        <div style={{ fontSize: '0.95em', color: '#888', margin: '4px 0 8px 0', textAlign: 'left', width: 'auto' }}>
                                            {renderDestinoRating(d.id)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CARACTERÍSTICAS */}
                <section className="caracteristicas section-white">
                    <h2>Características principales</h2>
                    <div className="caracteristicas-grid">
                        <div className="caracteristica-card">
                            <img
                                src="/imagenes/calendar.png"
                                alt="Sistema de reservas"
                                className="icon-caracteristica-img"
                            />
                            <h3>Sistema de reservas</h3>
                            <p>
                                Gestiona tus viajes y ecohoteles de forma fácil
                                y segura.
                            </p>
                            <div className="caracteristica-btn-container">
                                <button
                                    className="btn-terciary"
                                    onClick={goEcohoteles}
                                >
                                    Ver ecohoteles
                                </button>
                            </div>
                        </div>
                        <div className="caracteristica-card">
                            <img
                                src="/imagenes/plant.png"
                                alt="Sistema de reservas"
                                className="icon-caracteristica-img"
                            />
                            <h3>Turismo sostenible</h3>
                            <p>
                                Contribuye a la conservación y desarrollo local.
                            </p>
                            <div className="caracteristica-btn-container">
                                <button
                                    className="btn-terciary"
                                    onClick={goEcohoteles}
                                >
                                    Ver destinos
                                </button>
                            </div>
                        </div>
                        <div className="caracteristica-card">
                            <img
                                src="/imagenes/building-insurance.png"
                                alt="Sistema de reservas"
                                className="icon-caracteristica-img"
                            />
                            <h3>Empresas registradas</h3>
                            <p>
                                Accede a servicios de operadores certificados.
                            </p>
                            <div className="caracteristica-btn-container">
                                <button
                                    className="btn-terciary"
                                    onClick={goEmpresa}
                                >
                                    Ver empresas
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA FINAL */}
                {/* <section className="cta-final section-alt">
                    <h2>¿Listo para vivir la experiencia?</h2>
                    <p>
                        Accede a tus reservas y explora los mejores destinos de
                        ecoturismo en Risaralda.
                    </p>
                    <button className="btn-primary" onClick={goEcohoteles}>
                        Explorar destinos
                    </button>
                </section> */}
            </main>
            <Footer />
        </div>
    );
};

export default PagLogueados;
