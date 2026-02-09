import React from "react";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import "./LegalPage.css";

export default function CopyrightLugaresMontanosos() {
  const items = [
    {
      title: "Alto del Nudo",
      url: "https://rutasdelosandes.com"
    },
    {
      title: "Alto del Toro",
      url: "https://instagram.com/enriquemillan1185"
    },
    {
      title: "Cerro Batero",
      url: "https://albicentenario.com"
    },
    {
      title: "Kuakita Bosque Reserva",
      url: "https://tripadvisor.com"
    },
    {
      title: "Divisa de Don Juan",
      url: "https://instagram.com/organicosbiobio"
    },
    {
      title: "Reserva Forestal La Nona",
      url: "https://instagram.com/carderRisaralda"
    },
    {
      title: "Reserva Natural Cerro Gobia",
      url: "https://wikiloc.com"
    },
    {
      title: "Reserva Natural DMI Agualinda",
      url: "https://fecomarisaralda.org"
    }
  ];

  return (
    <div className="page-layout">
      <Header2 />
      <div className="page-content contenedorTodo" style={{ marginTop: "100px" }}>
        <h1>Copyright Lugares Montañosos</h1>
        <p style={{ marginBottom: "20px" }}>Imágenes y créditos externos listados a continuación.</p>

        <div className="copyright-grid">
          {items.map((it) => (
            <div className="copyright-card" key={it.title}>
              <a href={it.url} target="_blank" rel="noopener noreferrer">
                <img src={it.url} alt={it.title} onError={(e)=>{e.target.style.display='none';}} />
              </a>
              <div className="copyright-caption">{it.title}</div>
              <a className="copyright-link" href={it.url} target="_blank" rel="noopener noreferrer">Ver fuente</a>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
