import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import Slider from "./slider/Slider";

const beneficios = [
    {
        icon: "🌱",
        title: "Turismo sostenible",
        desc: "Promovemos experiencias responsables y ecológicas.",
    },
    {
        icon: "🏨",
        title: "Reserva fácil",
        desc: "Ecohoteles y destinos con gestión directa y segura.",
    },
    {
        icon: "💼",
        title: "Empresas registradas",
        desc: "Conecta con operadores locales y apoya la economía.",
    },
    {
        icon: "🔒",
        title: "Acceso exclusivo",
        desc: "Funciones avanzadas para usuarios registrados.",
    },
];

const destinos = [
    {
        id: 101,
        img: "/imagenes/farallones.jpeg",
        title: "Farallones de Risaralda",
        desc: "Montañas, senderos y biodiversidad única.",
    },
    {
        id: 102,
        img: "/imagenes/termales.jpg",
        title: "Termales Santa Rosa",
        desc: "Relájate en aguas termales rodeado de naturaleza.",
    },
    {
        id: 103,
        img: "/imagenes/ukumari.jpg",
        title: "Parque Natural Ucumari",
        desc: "Explora la fauna y flora de la región.",
    },
    {
        id: 104,
        img: "/imagenes/mirador.jpg",
        title: "Mirador de la Divisa",
        desc: "Vistas panorámicas y paisajes verdes.",
    },
    {
        id: 105,
        img: "/imagenes/laguna.jpg",
        title: "Laguna del otun",
        desc: "Laguna natural con aguas cristalinas y biodiversidad única.",
    },
    {
        id: 106,
        img: "/imagenes/nudo.jpg",
        title: "Alto del nudo",
        desc: "Punto elevado con vistas espectaculares y senderos naturales.",
    },
];

const estadisticas = [
    { label: "Usuarios", value: "+3,500" },
    { label: "Reservas", value: "+1,200" },
    { label: "Empresas", value: "+80" },
];

const HomePage = ({ loggedIn, user }) => {
    const navigate = useNavigate();

    // Funciones de navegación
    const goEcohoteles = () => navigate("/ecohoteles");
    const goLogin = () => navigate("/login");
    const goRegister = () => navigate("/registro");
    const goPlaceDetail = (id) => navigate(`/lugares/${id}`); // Ahora usa el id real
    const goReservas = () => navigate("/reservas");
    const goPerfil = () => navigate("/perfil");
    const goEmpresa = () => navigate("/company/dashboard");

    if (!loggedIn) {
        return (
            <div className="homepage">
                <Slider />
                {/* DESTINOS DESTACADOS */}
                <section className="destacados section-alt">
                    <h2>Destinos populares</h2>
                    <p className="destacados-sub">
                        Explora los destinos favoritos de nuestros viajeros
                    </p>
                    <div className="destinos-grid">
                        {destinos.map((d) => (
                            <div className="destino-card" key={d.id}>
                                <div
                                    className="destino-img-wrap"
                                    onClick={() => goPlaceDetail(d.id)}
                                >
                                    <img src={d.img} alt={d.title} />
                                </div>
                                <div className="destino-body">
                                    <h3
                                        className="destino-title"
                                        onClick={() => goPlaceDetail(d.id)}
                                    >
                                        {d.title}
                                    </h3>
                                    <span className="destino-country">
                                        Colombia
                                    </span>
                                    <p className="destino-desc">{d.desc}</p>
                                    <div className="destino-footer">
                                        <div className="rating">★ 4.5</div>
                                        <button
                                            className="destino-link"
                                            onClick={() => goPlaceDetail(d.id)}
                                        >
                                            Ver más
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BENEFICIOS */}
                <section className="beneficios section-alt">
                    <h2>Beneficios de registrarse</h2>
                    <div className="beneficios-cards">
                        {beneficios.map((b, idx) => (
                            <div className="beneficio-card" key={idx}>
                                <span className="icon-beneficio">{b.icon}</span>
                                <h3>{b.title}</h3>
                                <p>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CARACTERÍSTICAS */}
                <section className="caracteristicas section-white">
                    <h2>Características principales</h2>
                    <div className="caracteristicas-grid">
                        <div className="caracteristica-card">
                            <span className="icon-caracteristica">🗓️</span>
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
                            <span className="icon-caracteristica">🌳</span>
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
                            <span className="icon-caracteristica">🏢</span>
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

                {/* CONFIANZA
                <section className="confianza section-white">
                    <h2>Confianza y comunidad</h2>
                    <div className="estadisticas">
                        {estadisticas.map((e, idx) => (
                            <div className="estadistica-card" key={idx}>
                                <span className="estadistica-value">
                                    {e.value}
                                </span>
                                <span className="estadistica-label">
                                    {e.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section> */}

                {/* CTA FINAL */}
                <section className="cta-final section-alt">
                    <h2>¿Listo para vivir la experiencia?</h2>
                    <p>
                        Regístrate gratis y comienza a explorar los mejores
                        destinos de ecoturismo en Risaralda.
                    </p>
                    <button className="btn-primary" onClick={goRegister}>
                        Comenzar ahora
                    </button>
                </section>
            </div>
        );
    }

    // Vista logueados
    return (
        <div className="homepage">
            <section className="hero-fixed">
                <img
                    src="/imagenes/slideone.jpg"
                    alt="Ecoturismo Risaralda"
                    className="hero-bg"
                />
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        Bienvenido, {user?.name || "usuario"}!
                    </h1>
                    <p className="hero-subtitle">
                        Accede rápidamente a tus reservas, ecohoteles y
                        funciones exclusivas.
                    </p>
                    <div className="hero-btns">
                        <button className="btn-primary" onClick={goReservas}>
                            Mis reservas
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={goEcohoteles}
                        >
                            Explorar ecohoteles
                        </button>
                        <button className="btn-terciary" onClick={goEmpresa}>
                            Registrar empresa
                        </button>
                        <button className="btn-terciary" onClick={goPerfil}>
                            Mi perfil
                        </button>
                    </div>
                </div>
            </section>
            {/* Panel visual, recomendaciones, etc. se pueden agregar modularmente aquí */}
        </div>
    );
};

export default HomePage;
