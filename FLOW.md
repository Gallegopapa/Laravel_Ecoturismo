# Flujos de la Aplicación - Risaralda EcoTurismo

Este documento describe los flujos principales de la aplicación desde la perspectiva del usuario y del sistema.

## 🔐 Flujo de Autenticación

### Registro de Usuario

```
1. Usuario accede a /registro
   ↓
2. Llena formulario (name, email, password, password_confirmation)
   ↓
3. Validación frontend (campos requeridos, formato email, contraseñas coinciden)
   ↓
4. POST /api/register
   ↓
5. AuthController::register()
   - Valida datos
   - Verifica que email/name no existan
   - Hash de contraseña
   - Crea usuario en BD
   - Genera token Sanctum
   ↓
6. Response: { user, token }
   ↓
7. Guardar token en localStorage
   ↓
8. Actualizar AuthContext
   ↓
9. Redirigir a /pagLogueados
```

### Login

```
1. Usuario accede a /login
   ↓
2. Ingresa name/email y password
   ↓
3. POST /api/login
   ↓
4. AuthController::login()
   - Busca usuario por name o email
   - Verifica contraseña
   - Genera token Sanctum
   ↓
5. Response: { user, token }
   ↓
6. Guardar token en localStorage
   ↓
7. Actualizar AuthContext
   ↓
8. Redirigir a /pagLogueados
```

### Logout

```
1. Usuario hace clic en "Cerrar Sesión"
   ↓
2. POST /api/logout
   ↓
3. AuthController::logout()
   - Elimina token actual
   ↓
4. Eliminar token de localStorage
   ↓
5. Limpiar AuthContext
   ↓
6. Redirigir a /
```

## 🏞 Flujo de Exploración de Lugares

### Ver Lista de Lugares

```
1. Usuario accede a /lugares o categorías específicas
   ↓
2. Componente carga lugares
   ↓
3. GET /api/places?category_id=X (opcional)
   ↓
4. PlaceController::index()
   - Obtiene lugares de BD
   - Aplica filtros si existen
   - Carga relaciones (categorías, reseñas)
   ↓
5. Response: Array de lugares
   ↓
6. Renderizar cards con información
   - Imagen
   - Nombre
   - Ubicación
   - Descripción
   - Botones: Mapa, Reservar, Favorito
```

### Ver Detalle de Lugar

```
1. Usuario hace clic en un lugar
   ↓
2. Navegar a /lugares/{id}
   ↓
3. GET /api/places/{id}
   ↓
4. PlaceController::show()
   - Obtiene lugar con relaciones
   - Calcula promedio de calificaciones
   - Cuenta reseñas
   ↓
5. Response: { place, average_rating, reviews_count }
   ↓
6. Renderizar página de detalle
   - Información completa
   - Galería de imágenes
   - Reseñas
   - Botón de reserva
   - Mapa con ubicación
```

### Filtrar por Categoría

```
1. Usuario selecciona categoría (Parques, Paraísos Acuáticos, etc.)
   ↓
2. Navegar a ruta específica (/parques-y-mas, /paraisos-acuaticos)
   ↓
3. Componente carga categoría
   ↓
4. GET /api/categories?slug=X
   ↓
5. Obtener ID de categoría
   ↓
6. GET /api/places?category_id=X
   ↓
7. Filtrar y mostrar lugares
```

## 📅 Flujo de Reservas

### Crear Reserva

```
1. Usuario autenticado hace clic en "Reservar Visita"
   ↓
2. Abrir ReservationModal
   ↓
3. Usuario llena formulario:
   - Fecha de visita
   - Hora de visita
   - Número de personas
   - Teléfono de contacto
   - Comentarios (opcional)
   ↓
4. Validación frontend
   ↓
5. POST /api/reservations
   Body: {
     place_id,
     fecha_visita,
     hora_visita,
     personas,
     telefono_contacto,
     comentarios,
     precio_total
   }
   ↓
6. ReservationController::store()
   - Valida datos
   - Verifica que el lugar exista
   - Crea reserva en BD
   - Asocia con usuario autenticado
   ↓
7. Response: { reservation }
   ↓
8. Cerrar modal
   ↓
9. Mostrar mensaje de éxito
   ↓
10. (Opcional) Redirigir a /reservaciones
```

### Ver Mis Reservas

```
1. Usuario autenticado accede a /reservaciones
   ↓
2. GET /api/reservations/my
   ↓
3. ReservationController::myReservations()
   - Obtiene reservas del usuario
   - Carga relaciones (lugar, usuario)
   - Ordena por fecha
   ↓
4. Response: Array de reservas
   ↓
5. Renderizar lista
   - Información del lugar
   - Fecha y hora
   - Estado
   - Acciones (editar, cancelar)
```

### Cancelar Reserva

```
1. Usuario hace clic en "Cancelar"
   ↓
2. Confirmar acción
   ↓
3. DELETE /api/reservations/{id}
   ↓
4. ReservationController::destroy()
   - Verifica que la reserva pertenezca al usuario
   - Elimina reserva
   ↓
5. Response: { message: "Reserva eliminada" }
   ↓
6. Actualizar lista
```

## ⭐ Flujo de Reseñas

### Crear Reseña

```
1. Usuario autenticado en página de detalle de lugar
   ↓
2. Llena formulario de reseña:
   - Calificación (1-5)
   - Comentario
   ↓
3. POST /api/reviews
   Body: {
     place_id,
     rating,
     comment
   }
   ↓
4. ReviewController::store()
   - Valida datos
   - Verifica que el usuario no haya reseñado antes
   - Crea reseña
   ↓
5. Response: { review }
   ↓
6. Actualizar lista de reseñas
   ↓
7. Recalcular promedio de calificaciones
```

### Eliminar Reseña

```
1. Usuario hace clic en "Eliminar" en su reseña
   ↓
2. Confirmar acción
   ↓
3. DELETE /api/reviews/{id}
   ↓
4. ReviewController::destroy()
   - Verifica que la reseña pertenezca al usuario
   - Elimina reseña
   ↓
5. Actualizar lista
```

## ❤️ Flujo de Favoritos

### Agregar a Favoritos

```
1. Usuario autenticado hace clic en corazón (♡)
   ↓
2. POST /api/favorites
   Body: { place_id }
   ↓
3. FavoriteController::store()
   - Verifica que no esté ya en favoritos
   - Crea favorito
   ↓
4. Response: { favorite }
   ↓
5. Cambiar icono a corazón lleno (♥)
   ↓
6. Mostrar mensaje "Agregado a favoritos"
```

### Ver Favoritos

```
1. Usuario accede a /favoritos
   ↓
2. GET /api/favorites
   ↓
3. FavoriteController::index()
   - Obtiene favoritos del usuario
   - Carga relaciones (lugar)
   ↓
4. Response: Array de favoritos
   ↓
5. Renderizar lista de lugares favoritos
```

### Eliminar de Favoritos

```
1. Usuario hace clic en corazón lleno (♥)
   ↓
2. DELETE /api/favorites/{placeId}
   ↓
3. FavoriteController::destroy()
   - Elimina favorito
   ↓
4. Cambiar icono a corazón vacío (♡)
   ↓
5. Mostrar mensaje "Eliminado de favoritos"
```

## 📧 Flujo de Contacto

### Enviar Mensaje de Contacto

```
1. Usuario accede a /contacto
   ↓
2. Llena formulario:
   - Nombre
   - Email
   - Teléfono
   - Mensaje
   ↓
3. Validación frontend
   ↓
4. POST /api/contacts
   Body: {
     name,
     email,
     phone,
     message
   }
   ↓
5. ContactController::store()
   - Valida datos
   - Si usuario está autenticado, guarda user_id
   - Crea contacto en BD
   ↓
6. Response: { message, data }
   ↓
7. Mostrar mensaje de éxito
   ↓
8. Limpiar formulario
```

## 🗺 Flujo del Mapa Interactivo

### Ver Mapa

```
1. Usuario accede a /mapa
   ↓
2. GET /api/places
   ↓
3. Filtrar lugares con coordenadas (latitude, longitude)
   ↓
4. Inicializar mapa Leaflet
   ↓
5. Crear marcadores para cada lugar
   ↓
6. Click en marcador
   ↓
7. Mostrar popup con información
   ↓
8. Opción de navegar a página de detalles
```

## 👤 Flujo de Perfil

### Ver Perfil

```
1. Usuario autenticado accede a /perfil
   ↓
2. GET /api/profile
   ↓
3. ProfileController::show()
   - Obtiene datos del usuario
   ↓
4. Response: { user }
   ↓
5. Mostrar información:
   - Nombre
   - Email
   - Teléfono
   - Foto de perfil
```

### Actualizar Perfil

```
1. Usuario edita información
   ↓
2. Si hay imagen: POST /api/profile (FormData)
   Si no hay imagen: PUT /api/profile (JSON)
   ↓
3. ProfileController::update()
   - Valida datos
   - Si hay imagen, guarda en storage
   - Actualiza usuario
   ↓
4. Response: { user }
   ↓
5. Actualizar UI
   ↓
6. Actualizar AuthContext
```

### Cambiar Contraseña

```
1. Usuario llena formulario:
   - Contraseña actual
   - Nueva contraseña
   - Confirmar nueva contraseña
   ↓
2. PUT /api/profile/password
   ↓
3. ProfileController::changePassword()
   - Verifica contraseña actual
   - Valida nueva contraseña
   - Actualiza contraseña
   ↓
4. Response: { message }
   ↓
5. Mostrar mensaje de éxito
```

## 🔧 Flujo de Administración

### Ver Panel de Admin

```
1. Usuario admin accede a /admin
   ↓
2. Verificar is_admin = true
   ↓
3. Mostrar panel con opciones:
   - Lugares
   - Usuarios
   - Reservas
   - Categorías
```

### Crear/Editar Lugar (Admin)

```
1. Admin accede a gestión de lugares
   ↓
2. Llena formulario:
   - Nombre
   - Descripción
   - Ubicación
   - Coordenadas (lat, lng)
   - Imagen
   - Categorías
   ↓
3. POST /api/admin/places (crear)
   PUT /api/admin/places/{id} (editar)
   ↓
4. AdminPlaceController::store/update()
   - Valida datos
   - Guarda imagen en storage
   - Crea/actualiza lugar
   - Sincroniza categorías
   ↓
5. Response: { place }
   ↓
6. Actualizar lista
```

### Ver Contactos (Admin)

```
1. Admin accede a gestión de contactos
   ↓
2. GET /api/contacts
   ↓
3. ContactController::index()
   - Verifica permisos admin
   - Obtiene todos los contactos
   - Carga relaciones (usuario si existe)
   ↓
4. Response: Array de contactos
   ↓
5. Mostrar lista con:
   - Nombre
   - Email
   - Teléfono
   - Mensaje
   - Fecha
   - Usuario (si está autenticado)
```

## 🔄 Flujo de Navegación

### Rutas Públicas

```
/ → Página principal
/login → Login
/registro → Registro
/lugares → Lista de lugares
/lugares/{id} → Detalle de lugar
/parques-y-mas → Lugares por categoría
/paraisos-acuaticos → Lugares por categoría
/lugares-montanosos → Lugares por categoría
/mapa → Mapa interactivo
/contacto → Formulario de contacto
```

### Rutas Protegidas (Autenticadas)

```
/pagLogueados → Página principal para usuarios logueados
/reservaciones → Mis reservas
/favoritos → Mis favoritos
/perfil → Mi perfil
/configuracion → Configuración
```

### Rutas de Admin

```
/admin → Panel de administración
/admin/lugares → Gestión de lugares
/admin/usuarios → Gestión de usuarios
/admin/reservas → Gestión de reservas
```

---

**Última actualización**: Diciembre 2025

