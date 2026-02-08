import React from "react";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import "./LegalPage.css";

export default function CopyrightParaisosAcuaticos() {
  const items = [
    {
      title: "Farallones",
      url: "https://d2kihw5e8drjh5.cloudfront.net/eyJidWNrZXQiOiJ1dGEtaW1hZ2VzIiwia2V5IjoicGxhY2VfaW1nLzk4MDE0MDUyNzkyNDQ2YWJiODRkYWRkOWI4MWZlZDg1IiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjo2NDAsImhlaWdodCI6NjQwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJ0b0Zvcm1hdCI6ICJ3ZWJwIn19"
    },
    {
      title: "Chorros de don Lolo",
      url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/f5/fb/13/photo0jpg.jpg?w=1200&h=1200&s=1"
    },
    {
      title: "Consota",
      url: "https://comfamiliar.com/wp-content/uploads/2025/08/Toboganes.png"
    },
    {
      title: "Laguna del Otun",
      url: "https://www.parquesnacionales.gov.co/wp-content/uploads/2022/04/laguna-otun.jpg"
    },
    {
      title: "Lago de la Pradera",
      url: "https://caracol.com.co/resizer/v2/EBLRTW3CSFLKPOUQX5I4GB2YJQ.jpg?auth=ec62aa69a66a3b1f4083f12bb4b1b5d44f8d8814721f6d5b9ba4e048dddf23ba&width=1600&height=1067&quality=70&smart=true"
    },
    {
      title: "Rio San Jose",
      url: "https://territorioexplora.com.co/wp-content/uploads/2017/11/marmol001.jpg"
    },
    {
      title: "Termales de Santa Rosa",
      url: "https://cloudfront-us-east-1.images.arcpublishing.com/elespectador/XERXDCSKHFEEDDJFAKHPGKYRGU.jpg"
    }
  ];

  return (
    <div className="page-layout">
      <Header2 />
      <div className="page-content contenedorTodo" style={{ marginTop: "100px" }}>
        <h1>Copyright Paraisos Acuaticos</h1>
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
