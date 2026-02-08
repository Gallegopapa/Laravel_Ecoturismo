import React from "react";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import "./LegalPage.css";

export default function CopyrightLugaresMontanosos() {
  const items = [
    { title: "Alto del Nudo", copy: "rutasdelosandes.com" },
    { title: "Alto del Toro", copy: "@enriquemillan1185" },
    { title: "Cerro Batero", copy: "albicentenario.com" },
    { title: "Kuakita Bosque Reserva", copy: "tripadvisor.com" },
    { title: "Divisa de Don Juan", copy: "@organicosbiobio" },
    { title: "Reserva Forestal La Nona", copy: "@carderRisaralda" },
    { title: "Reserva Natural Cerro Gobia", copy: "wikiloc.com" },
    { title: "Reserva Natural DMI Agualinda", copy: "fecomarisaralda.org" },
  ];

  const renderSource = (src) => {
    if (!src) return null;
    // If looks like a URL (contains a dot), make it an external link
    if (src.includes(".")) {
      const href = src.startsWith("http") ? src : `https://${src}`;
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="copyright-link">
          {src}
        </a>
      );
    }
    // Otherwise just show the text (e.g., @handles)
    return <span className="copyright-link">{src}</span>;
  };

  return (
    <div className="page-layout">
      <Header2 />
      <div className="page-content contenedorTodo" style={{ marginTop: "100px" }}>
        <h1>Copyright Lugares Montañosos</h1>
        <p style={{ marginBottom: "20px" }}>Fuentes y créditos de imágenes/videos utilizados.</p>

        <div className="copyright-grid">
          {items.map((it) => (
            <div className="copyright-card" key={it.title}>
              <div className="copyright-caption" style={{ fontWeight: 600 }}>{it.title}</div>
              <div style={{ marginTop: 8 }}>{renderSource(it.copy)}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
