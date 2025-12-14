import './bootstrap';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './react/index.css';

// Importar AuthProvider
import { AuthProvider } from './react/context/AuthContext';
import { ProtectedRoute } from './react/components/ProtectedRoute';

// Importar componentes
import App from './react/App.jsx';
import ContactPage from './react/contact/Contacto.jsx';
import PlacesPage from './react/places/page.jsx';
import CommentsPage from './react/comments/page.jsx';
import Loginpage from './react/login/page.jsx';
import PagLogueados from './react/pagLogueados.jsx';
import Comments2Page from './react/comments2/page.jsx';
import PerfilPage from './react/perfil/page.jsx';
// import SettingsPage from './react/settings/Page.jsx';
// Páginas legales
import CookiesPage from './react/legal/Cookies.jsx';
import TerminosDeUsoPage from './react/legal/TerminosDeUso.jsx';
import PoliticaDePrivacidadPage from './react/legal/PoliticaDePrivacidad.jsx';

// Páginas de lugares
import ParaisosAcuaticos from './react/places2/paraisosAcuaticos/page.jsx';
import LugaresMontanosos from './react/places2/lugaresMontanosos/page.jsx';
import ParquesYMas from './react/places2/parquesYMas/page.jsx';
import TerritoriosDelCafe from './react/places2/territoriosDelCafe/page.jsx';

// Crear router
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/cookies',
    element: <CookiesPage />,
  },
  {
    path: '/terminos-de-uso',
    element: <TerminosDeUsoPage />,
  },
  {
    path: '/politica-de-privacidad',
    element: <PoliticaDePrivacidadPage />,
  },
  {
    path: '/contacto',
    element: <ContactPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/contacto2',
    element: <ContactPage />,
  },
  {
    path: '/lugares',
    element: <PlacesPage />,
  },
  {
    path: '/comentarios',
    element: <CommentsPage />,
  },
  {
    path: '/comentarios2',
    element: <Comments2Page />,
  },
  {
    path: '/login',
    element: <Loginpage />,
  },
  {
    path: '/registro',
    element: <Loginpage />, // Usar el mismo componente o crear uno separado
  },
  {
    path: '/pagLogueados',
    element: (
      <ProtectedRoute>
        <PagLogueados />
      </ProtectedRoute>
    ),
  },
  {
    path: '/configuracion',
    element: (
      <ProtectedRoute>
        <PerfilPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/perfil',
    element: (
      <ProtectedRoute>
        <PerfilPage />
      </ProtectedRoute>
    ),
  },
  // Rutas de lugares
  {
    path: '/paraisosAcuaticos',
    element: <ParaisosAcuaticos />,
  },
  {
    path: '/lugaresMontanosos',
    element: <LugaresMontanosos />,
  },
  {
    path: '/parquesYMas',
    element: <ParquesYMas />,
  },
  {
    path: '/territoriosDelCafe',
    element: <TerritoriosDelCafe />,
  },

  // Fallback para rutas no definidas
  {
    path: '*',
    element: <App />,
  },
]);

// Montar la aplicación React
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
