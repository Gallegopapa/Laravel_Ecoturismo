# 🚀 Instrucciones para Usar React + Laravel

## ✅ Todo está configurado y listo

He configurado completamente la conexión entre React y Laravel. Aquí está lo que se hizo:

## 📁 Archivos Creados/Modificados

### Nuevos archivos:
1. **`resources/js/react/services/api.js`** - Servicio de API con axios configurado
2. **`resources/js/react/context/AuthContext.jsx`** - Contexto de autenticación
3. **`resources/js/react/components/ProtectedRoute.jsx`** - Componente para rutas protegidas
4. **`resources/js/react/examples/PlacesExample.jsx`** - Ejemplo de uso

### Archivos modificados:
1. **`resources/js/app.js`** - Agregado AuthProvider
2. **`resources/js/react/login/page.jsx`** - Actualizado para usar la API
3. **`resources/js/react/App.jsx`** - Actualizado para usar AuthContext
4. **`resources/js/react/components/Header2/Header2.jsx`** - Agregado logout
5. **`config/sanctum.php`** - Configurado CORS para React

## 🎯 Cómo Funciona Ahora

### 1. Login/Registro
- El usuario ingresa sus credenciales
- Se hace petición a `/api/login` o `/api/register`
- Se guarda el token en `localStorage`
- El token se agrega automáticamente a todas las peticiones

### 2. Autenticación Automática
- Al cargar la página, se verifica si hay un token
- Si el token es válido, el usuario queda autenticado
- Si el token expira, se limpia y redirige al login

### 3. Rutas Protegidas
- Las rutas protegidas verifican si el usuario está autenticado
- Si no está autenticado, redirige al login
- Puedes requerir permisos de admin con `requireAdmin={true}`

## 🔧 Cómo Usar en Tus Componentes

### Ejemplo básico:

```jsx
import { useAuth } from '../context/AuthContext';
import { placesService } from '../services/api';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      placesService.getAll()
        .then(data => setPlaces(data))
        .catch(error => console.error(error));
    }
  }, [isAuthenticated]);

  return (
    <div>
      {isAuthenticated ? (
        <p>Hola, {user.name}!</p>
      ) : (
        <p>No estás autenticado</p>
      )}
    </div>
  );
}
```

## 📝 Servicios Disponibles

Todos están en `resources/js/react/services/api.js`:

- **authService**: login, register, logout, verifyToken, getCurrentUser
- **placesService**: getAll, getById, create, update, delete
- **reservationsService**: getMyReservations, create, update, delete
- **reviewsService**: getByPlace, create, delete
- **favoritesService**: getAll, add, remove
- **categoriesService**: getAll, getById
- **profileService**: get, update, changePassword
- **messagesService**: send

## 🚀 Para Probar

1. **Inicia Laravel:**
   ```bash
   php artisan serve
   ```

2. **Inicia Vite (en otra terminal):**
   ```bash
   npm run dev
   ```

3. **Abre el navegador:**
   - Ve a `http://localhost:8000`
   - Haz clic en "Login"
   - Prueba registrarte o iniciar sesión

## ✅ Lo que ya funciona:

- ✅ Login con API
- ✅ Registro con API
- ✅ Logout
- ✅ Verificación automática de token
- ✅ Rutas protegidas
- ✅ Headers con token automático
- ✅ Manejo de errores 401
- ✅ CORS configurado

## 🐛 Si algo no funciona:

1. **Verifica la consola del navegador** (F12) para ver errores
2. **Verifica que el token esté en localStorage:**
   ```javascript
   console.log(localStorage.getItem('token'));
   ```
3. **Verifica la URL de la API** en `resources/js/react/services/api.js`
4. **Asegúrate de que Laravel esté corriendo** en el puerto 8000

## 📚 Más Información

Revisa `REACT_LARAVEL_SETUP.md` para más detalles técnicos.

