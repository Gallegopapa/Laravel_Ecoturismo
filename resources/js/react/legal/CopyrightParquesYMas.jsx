import React from "react";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import "./LegalPage.css";

export default function CopyrightParquesYMas() {
  const items = [
    {
      title: "Jardín Botánico Marsella",
      url: "https://rutasdelpaisajeculturalcafetero.com/wp-content/uploads/2016/07/jardin-botanico-alejandro-humbolt.jpg",
    },
    {
      title: "Jardín Botánico UTP",
      url: "https://media2.utp.edu.co/imagenes/WhatsApp%20Image%202022-02-04%20at%2009.38.43.jpeg",
    },
    {
      title: "Parque Las Araucarias",
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMFAqc1cXzuj9_-0JRDWMG86QKd4oePUBNkQ&s",
    },
    {
      title: "Parque Nacional Natural Tatamá",
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRql_kwNxFGi7NJvqMUUwR3U0G2CJBRAfdl7Q&s",
    },
    {
      title: "Parque Natural Regional Santa Emilia",
      url: "https://cdn.shortpixel.ai/spai/q_lossless+w_916+to_webp+ret_img/nomadicniko.com/wp-content/uploads/2014/08/94bbe-img_5215.jpg?w=225",
    },
    {
      title: "Parque Regional Natural Cuchilla de San Juan",
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbthSfsJ_VlPC4iOdo4OeTmEfF19WNY1VL4A&s",
    },
  ];

  return (
    <div className="page-layout">
      <Header2 />
      <div className="page-content contenedorTodo" style={{ marginTop: "100px" }}>
        <h1>Copyright Parques y Más</h1>
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
