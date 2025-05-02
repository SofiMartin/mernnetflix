# AnimeStream API

Una API REST completa para una plataforma de streaming de anime construida con Node.js, Express y MongoDB.

## Descripción general

Este proyecto proporciona una solución backend completa para un servicio de streaming de anime con autenticación de usuarios, gestión de perfiles, organización de contenido y listas de seguimiento personalizadas. La API admite características como filtrado de contenido por clasificación de edad, soporte de múltiples perfiles por usuario (similar a Netflix) e integración con bases de datos externas de anime.

## Características

- **Autenticación de usuarios**: Funcionalidad de registro, inicio de sesión y renovación de tokens
- **Sistema multi-perfil**: Soporte para hasta 5 perfiles por usuario con diferentes restricciones de edad
- **Gestión de contenido**: Operaciones CRUD para el catálogo de anime con filtrado, búsqueda y paginación
- **Funcionalidad de lista de seguimiento**: Añadir, eliminar y seguir el estado de visualización de animes
- **Filtrado de contenido por edad**: Sistema de clasificación de contenido para restringir el acceso según el tipo de perfil
- **Integración con API externa**: Importación de datos de anime desde fuentes externas (API Jikan/MyAnimeList)
- **Panel de administración**: Rutas especiales para administradores para gestionar contenido y usuarios

## Arquitectura

El proyecto sigue un patrón de arquitectura limpia con:

- **Controladores**: Manejan las solicitudes y respuestas HTTP
- **Servicios**: Contienen la lógica de negocio
- **Repositorios**: Gestionan el acceso y la persistencia de datos
- **Modelos**: Definen la estructura de los datos y la validación

## Estructura del proyecto

```
api/
├── controllers/      # Controladores para gestionar solicitudes HTTP
├── middlewares/      # Middlewares personalizados (autenticación, manejo de errores)
├── models/           # Modelos de datos MongoDB
├── repositories/     # Acceso a la base de datos
├── routes/           # Definición de rutas de la API
├── services/         # Lógica de negocio
└── index.js          # Punto de entrada de la aplicación
```

## Modelos de datos

- **User**: Información de usuario y autenticación
- **Profile**: Perfiles de usuario con restricciones de edad y preferencias
- **Anime**: Catálogo de anime con detalles, géneros y clasificación
- **Watchlist**: Gestión de animes vistos/por ver para cada perfil

## Endpoints de la API

### Autenticación
- `POST /api/auth/register`: Registro de usuario
- `POST /api/auth/login`: Inicio de sesión
- `POST /api/auth/refresh`: Renovación de token

### Usuarios
- `GET /api/users/me`: Obtener usuario actual
- `PUT /api/users/:id`: Actualizar usuario
- `DELETE /api/users/:id`: Eliminar usuario
- `GET /api/users/`: Obtener todos los usuarios (admin)
- `GET /api/users/stats`: Obtener estadísticas (admin)

### Perfiles
- `GET /api/profiles/`: Obtener perfiles del usuario
- `POST /api/profiles/`: Crear nuevo perfil
- `GET /api/profiles/:id`: Obtener perfil específico
- `PUT /api/profiles/:id`: Actualizar perfil
- `DELETE /api/profiles/:id`: Eliminar perfil
- `PATCH /api/profiles/:id/type`: Cambiar tipo de perfil

### Animes
- `GET /api/animes/`: Obtener catálogo de animes (filtrado/paginado)
- `GET /api/animes/search`: Buscar animes por término
- `GET /api/animes/genres`: Obtener géneros disponibles
- `GET /api/animes/random`: Obtener animes aleatorios
- `GET /api/animes/external/search`: Buscar en API externa
- `POST /api/animes/external/import`: Importar desde API externa
- `GET /api/animes/:id`: Obtener anime específico
- `POST /api/animes/`: Crear anime (admin)
- `PUT /api/animes/:id`: Actualizar anime (admin)
- `DELETE /api/animes/:id`: Eliminar anime (admin)

### Watchlist
- `POST /api/watchlists/`: Añadir anime a watchlist
- `GET /api/watchlists/:profileId`: Obtener watchlist de un perfil
- `GET /api/watchlists/:profileId/stats`: Obtener estadísticas de watchlist
- `GET /api/watchlists/:profileId/anime/:animeId`: Verificar si un anime está en watchlist
- `GET /api/watchlists/profile/:profileId/favorites`: Obtener favoritos
- `DELETE /api/watchlists/:profileId/anime/:animeId`: Eliminar anime de watchlist
- `PUT /api/watchlists/:id`: Actualizar entrada de watchlist
- `DELETE /api/watchlists/:id`: Eliminar entrada de watchlist
- `PATCH /api/watchlists/:id/favorite`: Marcar/desmarcar como favorito

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Crear archivo `.env` con las siguientes variables:
   ```
   MONGO_URL=mongodb://localhost:27017/animestream
   PORT=8800
   SECRET_KEY=tu_clave_secreta_para_jwt
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```
4. Iniciar servidor: `npm start`

## Seguridad

- Autenticación JWT con tokens de acceso
- Encriptación de contraseñas con CryptoJS
- Verificación de propiedad para acciones sensibles
- Control de acceso basado en roles (usuario/admin)
- Filtrado de contenido basado en clasificación de edad para perfiles

## Desarrollo

- **Desarrollo**: `npm run dev` (con nodemon para recarga automática)
- **Producción**: `npm start`
