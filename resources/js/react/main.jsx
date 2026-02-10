import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import ContactPage from "./contact/Contacto.jsx";
import PlacesPage from "./places/page.jsx";
import CommentsPage from "./comments/page.jsx";
import Loginpage from "./login/page.jsx";
import PagLogueados from "./pagLogueados.jsx";
import Comments2Page from "./comments2/page.jsx";
import CookiesPage from "./legal/Cookies.jsx";
import TerminosDeUsoPage from "./legal/TerminosDeUso.jsx";
import PoliticaDePrivacidadPage from "./legal/PoliticaDePrivacidad.jsx";
import CopyrightTotal from "./legal/CopyrightTotal.jsx";

// NUEVAS PÁGINAS
import ParaisosAcuaticos from "./places2/paraisosAcuaticos/page.jsx";
import LugaresMontanosos from "./places2/lugaresMontanosos/page.jsx";
import ParquesYMas from "./places2/parquesYMas/page.jsx";
import TerritoriosDelCafe from "./places2/territoriosDelCafe/page.jsx";
import PlaceDetailPage from "./places/detail/page.jsx";
import CompanyDashboard from "./admin/CompanyDashboard.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/contacto",
    element: <ContactPage />,
  },
  {
    path: "/contact2",
    element: <ContactPage />,
  },
  {
    path: "/contacto2",
    element: <ContactPage />,
  },
  {
    path: "/lugares/:id",
    element: <PlaceDetailPage />,
  },
  {
    path: "/places",
    element: <PlacesPage />,
  },
  {
    path: "/comments",
    element: <CommentsPage />,
  },
  {
    path: "/comments2",
    element: <Comments2Page />,
  },
  {
    path: "/login",
    element: <Loginpage />,
  },
  {
    path: "/pagLogueados",
    element: <PagLogueados />,
  },
  {
    path: "/company/dashboard",
    element: <CompanyDashboard />,
  },

  // 🌿 RUTAS DEL MENÚ LUGARES
  {
    path: "/paraisosAcuaticos",
    element: <ParaisosAcuaticos />,
  },
  {
    path: "/lugaresMontanosos",
    element: <LugaresMontanosos />,
  },
  {
    path: "/parquesYMas",
    element: <ParquesYMas />,
  },
  {
    path: "/territoriosDelCafe",
    element: <TerritoriosDelCafe />,
  },
  {
    path: "/cookies",
    element: <CookiesPage />,
  },
  {
    path: "/terminos-de-uso",
    element: <TerminosDeUsoPage />,
  },
  {
    path: "/politica-de-privacidad",
    element: <PoliticaDePrivacidadPage />,
  },
  {
    path: "/CopyrightTotal",
    element: <CopyrightTotal />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
