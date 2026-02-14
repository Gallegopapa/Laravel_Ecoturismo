import React, { useEffect, useState } from "react";
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
        id: 12,
        img: "/imagenes/farallones.jpeg",
        title: "Balneario Los Farallones",
        desc: "Montañas, senderos y biodiversidad única.",
    },
    {
        id: 10,
        img: "/imagenes/termales.jpg",
        title: "Termales de Santa Rosa",
        desc: "Relájate en aguas termales rodeado de naturaleza.",
    },
    {
        id: 1,
        img: "/imagenes/tatama.jpg",
        title: "Parque Nacional Natural Tatamá",
        desc: "Explora la fauna y flora de la región.",
    },
    {
        id: 17,
        img: "/imagenes/mirador.jpg",
        title: "La Divisa De Don Juan",
        desc: "combinando belleza natural, cultura local y hospitalidad campesina.",
    },
    {
        id: 8,
        img: "/imagenes/laguna.jpg",
        title: "La Laguna Del Otún",
        desc: "Laguna natural con aguas cristalinas y biodiversidad única.",
    },
    {
        id: 15,
        img: "/imagenes/nudo.jpg",
        title: "Alto Del Nudo",
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
    const [destinoRatings, setDestinoRatings] = useState({});

    // Funciones de navegación
    const goEcohoteles = () => navigate("/ecohoteles");
    const goLogin = () => navigate("/login");
    const goRegister = () => navigate("/register");
    const goPlaceDetail = (id) => navigate(`/lugares/${id}`); // Ahora usa el id real
    const goReservas = () => navigate("/reservas");
    const goPerfil = () => navigate("/perfil");
    const goEmpresa = () => navigate("/company/dashboard");

    useEffect(() => {
        let isActive = true;

        const normalizeName = (value) => {
            if (!value) {
                return "";
            }

            return value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, " ")
                .trim();
        };

        const getAverageFromPlace = (place) => {
            if (!place) {
                return 0;
            }

            const reviews = Array.isArray(place.reviews) ? place.reviews : [];
            if (reviews.length > 0) {
                const total = reviews.reduce((sum, review) => sum + (Number(review?.rating) || 0), 0);
                return total / reviews.length;
            }

            const ratingValue = Number(place.average_rating ?? place.averageRating ?? 0);
            return Number.isFinite(ratingValue) ? ratingValue : 0;
        };

        const loadRatings = async () => {
            try {
                const response = await fetch("/api/places");
                if (!response.ok) {
                    throw new Error("No ratings");
                }
                const data = await response.json();
                const places = Array.isArray(data) ? data : [];
                const placesByName = new Map();

                places.forEach((place) => {
                    const key = normalizeName(place?.name);
                    if (key) {
                        placesByName.set(key, place);
                    }
                });

                const entries = destinos.map((destino) => {
                    const place = placesByName.get(normalizeName(destino.title));
                    const count = Number(place?.reviews_count ?? place?.reviewsCount ?? (Array.isArray(place?.reviews) ? place.reviews.length : 0));
                    const average = count > 0 ? getAverageFromPlace(place) : 0;
                    return [destino.id, average];
                });

                if (isActive) {
                    setDestinoRatings(Object.fromEntries(entries));
                }
            } catch (error) {
                if (isActive) {
                    const fallback = destinos.reduce((acc, destino) => {
                        acc[destino.id] = 0;
                        return acc;
                    }, {});
                    setDestinoRatings(fallback);
                }
            }
        };

        loadRatings();

        return () => {
            isActive = false;
        };
    }, []);

    const renderDestinoRating = (destinoId) => {
        const ratingValue = Number(destinoRatings[destinoId] ?? 0);
        const displayRating = Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : "0.0";
        return <span className="rating">★ {displayRating}</span>;
    };

    if (!loggedIn) {
        return (
            <div className="homepage">
                <section className="hero-initial">
                    <img
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
                            d="M0,160L60,144C120,128,240,96,360,101.3C480,107,600,149,720,154.7C840,160,960,128,1080,106.7C1200,85,1320,75,1380,69.3L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z">
                        </path>
                    </svg>
                </section>
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
                                        <div>{renderDestinoRating(d.id)}</div>
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
