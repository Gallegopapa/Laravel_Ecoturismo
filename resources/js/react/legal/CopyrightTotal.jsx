import React from "react";
import Header2 from "@/react/components/Header2/Header2";
import Footer from "@/react/components/Footer/Footer";
import "./LegalPage.css";

export default function CopyrightTotal() {
  const items = {
    lugaresMontanosos: [
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
    ],
    paraisosAcuaticos: [
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
    ],
    parquesYMas: [
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
    ]
  };

  const sections = [
    { key: "lugaresMontanosos", title: "Copyright Lugares Montañosos" },
    { key: "paraisosAcuaticos", title: "Copyright Paraisos Acuaticos" },
    { key: "parquesYMas", title: "Copyright Parques y Más" }
  ];

  return (
    <div className="page-layout">
      <Header2 />
      <div className="page-content contenedorTodo" style={{ marginTop: "100px" }}>
        <h1>Copyright - Todos los Lugares</h1>
        <p style={{ marginBottom: "40px" }}>Imágenes y créditos externos de todos nuestros destinos.</p>

        {sections.map((section) => (
          <div key={section.key} style={{ marginBottom: "60px" }}>
            <h2 style={{ marginBottom: "30px", borderBottom: "2px solid #ddd", paddingBottom: "10px" }}>
              {section.title}
            </h2>
            <div className="copyright-grid">
              {items[section.key].map((it) => (
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
        ))}
      </div>
      <Footer />
    </div>
  );
}
