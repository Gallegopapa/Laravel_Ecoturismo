# Risaralda EcoTurismo

Plataforma web para la promoción y gestión de destinos ecoturísticos en Risaralda, Colombia. Desarrollada con Laravel 12 (Backend) y React 19 (Frontend).

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Documentación](#documentación)
- [API](#api)
- [Contribuir](#contribuir)

## ✨ Características

- **Autenticación de Usuarios**: Sistema completo de registro, login y gestión de sesiones con Laravel Sanctum
- **Gestión de Lugares**: CRUD completo para lugares turísticos con categorías, imágenes y coordenadas
- **Sistema de Reservas**: Los usuarios pueden reservar visitas a lugares turísticos
- **Reseñas y Calificaciones**: Sistema de comentarios y calificaciones para lugares
- **Favoritos**: Los usuarios pueden marcar lugares como favoritos
- **Mapa Interactivo**: Visualización de lugares en un mapa interactivo usando Leaflet
- **Panel de Administración**: Panel completo para administradores con gestión de lugares, usuarios y reservas
- **Formulario de Contacto**: Sistema de contacto con almacenamiento en base de datos
- **Perfil de Usuario**: Gestión completa de perfil con foto de perfil
- **Responsive Design**: Diseño adaptable a diferentes dispositivos

## 🛠 Tecnologías

### Backend
- **Laravel 12**: Framework PHP
- **Laravel Sanctum**: Autenticación API con tokens
- **SQLite**: Base de datos (configurable para MySQL/PostgreSQL)
- **PHP 8.2+**: Lenguaje de programación

### Frontend
- **React 19**: Biblioteca de JavaScript
- **React Router DOM 7**: Enrutamiento
- **Axios**: Cliente HTTP
- **Leaflet & React-Leaflet**: Mapas interactivos
- **Vite**: Build tool y dev server
- **CSS3**: Estilos personalizados

## 📦 Requisitos

- PHP 8.2 o superior
- Composer
- Node.js 18+ y npm
- SQLite (o MySQL/PostgreSQL)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Laravel_Ecoturismo
```

### 2. Instalar dependencias de PHP

```bash
composer install
```

### 3. Instalar dependencias de Node.js

```bash
npm install
```

### 4. Configurar el entorno

```bash
cp .env.example .env
php artisan key:generate
```

### 5. Configurar la base de datos

Edita el archivo `.env` y configura tu base de datos:

```env
DB_CONNECTION=sqlite
# O para MySQL/PostgreSQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ecoturismo
# DB_USERNAME=root
# DB_PASSWORD=
```

Si usas SQLite, crea el archivo de base de datos:

```bash
touch database/database.sqlite
```

### 6. Ejecutar migraciones

```bash
php artisan migrate
```

### 7. (Opcional) Poblar la base de datos

```bash
php artisan db:seed
```

## ⚙️ Configuración

### Variables de Entorno Importantes

```env
APP_NAME="Risaralda EcoTurismo"
APP_URL=http://localhost:8000

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173

# Base de datos
DB_CONNECTION=sqlite
```

### Configurar Vite

El archivo `vite.config.js` ya está configurado para trabajar con Laravel. Asegúrate de que la URL del servidor de desarrollo coincida con `APP_URL`.

## 🎯 Uso

### Desarrollo

Para ejecutar el proyecto en modo desarrollo, necesitas dos terminales:

**Terminal 1 - Servidor Laravel:**
```bash
php artisan serve
```

**Terminal 2 - Servidor Vite (React):**
```bash
npm run dev
```

O usar el comando combinado:
```bash
npm run serve
```

Luego accede a: `http://localhost:8000`

### Producción

1. Compilar los assets:
```bash
npm run build
```

2. Optimizar Laravel:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

3. Configurar el servidor web (Apache/Nginx) para apuntar a la carpeta `public/`

## 📁 Estructura del Proyecto

```
Laravel_Ecoturismo/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── API/          # Controladores de API
│   │   │   ├── Admin/        # Controladores de administración
│   │   │   └── Auth/         # Controladores de autenticación
│   │   └── Middleware/       # Middleware personalizado
│   └── Models/               # Modelos Eloquent
├── database/
│   ├── migrations/            # Migraciones de base de datos
│   └── seeders/               # Seeders
├── resources/
│   ├── js/
│   │   └── react/             # Aplicación React
│   │       ├── components/    # Componentes reutilizables
│   │       ├── context/       # Context API (AuthContext)
│   │       ├── services/      # Servicios API
│   │       ├── admin/         # Panel de administración
│   │       ├── places/        # Páginas de lugares
│   │       ├── login/         # Página de login
│   │       ├── contact/       # Página de contacto
│   │       └── map/           # Mapa interactivo
│   └── views/                 # Vistas Blade (solo app.blade.php)
├── routes/
│   ├── api.php                # Rutas de API
│   └── web.php                # Rutas web
├── public/                     # Archivos públicos
└── vite.config.js             # Configuración de Vite
```

## 📚 Documentación

La documentación completa del proyecto está disponible en los siguientes archivos:

### Documentación Principal

- **[README.md](./README.md)**: Este archivo - Visión general del proyecto
- **[SETUP.md](./SETUP.md)**: Guía detallada de instalación y configuración paso a paso
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Arquitectura del sistema, estructura y flujo de datos
- **[FLOW.md](./FLOW.md)**: Flujos principales de la aplicación desde la perspectiva del usuario
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**: Documentación completa de la API REST con ejemplos
- **[DATABASE.md](./DATABASE.md)**: Estructura completa de la base de datos, tablas y relaciones

### Documentación Técnica Adicional

- **[GUIA_INTEGRACION_REACT.md](./GUIA_INTEGRACION_REACT.md)**: Guía de integración de React con el backend
- **[REACT_LARAVEL_SETUP.md](./REACT_LARAVEL_SETUP.md)**: Configuración de React con Laravel
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**: Endpoints de la API

### Guías de Desarrollo

- **[INICIO_RAPIDO.md](./INICIO_RAPIDO.md)**: Inicio rápido para desarrolladores
- **[INSTRUCCIONES_USO.md](./INSTRUCCIONES_USO.md)**: Instrucciones de uso para usuarios finales

## 🔌 API

La API REST está disponible en `/api`. Ver [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) para la documentación completa.

### Endpoints Principales

- `POST /api/register` - Registro de usuario
- `POST /api/login` - Inicio de sesión
- `GET /api/places` - Listar lugares
- `GET /api/places/{id}` - Detalle de lugar
- `POST /api/reservations` - Crear reserva
- `POST /api/contacts` - Enviar mensaje de contacto

## 👥 Usuarios y Roles

### Usuario Regular
- Ver lugares y detalles
- Crear reservas
- Agregar reseñas
- Marcar favoritos
- Gestionar perfil

### Administrador
- Todas las funciones de usuario regular
- CRUD completo de lugares
- CRUD completo de categorías
- Gestión de usuarios
- Ver todas las reservas
- Ver mensajes de contacto

## 🔐 Autenticación

El sistema utiliza **Laravel Sanctum** para autenticación basada en tokens. Los tokens se envían en el header:

```
Authorization: Bearer {token}
```

Los tokens expiran después de 30 días.

## 🗺 Mapa Interactivo

El mapa interactivo utiliza Leaflet y muestra todos los lugares con coordenadas. Los usuarios pueden:
- Ver todos los lugares en el mapa
- Hacer clic en los marcadores para ver detalles
- Navegar desde el mapa a la página de detalles

## 📝 Notas Importantes

1. **Base de Datos**: Por defecto usa SQLite, pero puede configurarse para MySQL o PostgreSQL
2. **Imágenes**: Las imágenes se almacenan en `storage/app/public/places/` y `storage/app/public/profiles/`
3. **Tokens**: Los tokens de Sanctum se almacenan en la tabla `personal_access_tokens`
4. **CORS**: Configurado para desarrollo local, ajustar para producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Desarrollado para Risaralda EcoTurismo

## 📞 Contacto

Para más información, contacta a través del formulario de contacto en la aplicación o envía un email a: proyectoecoturismo2@gmail.com

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2025
