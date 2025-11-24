
# Bolsa de Empleo Backend

Este proyecto implementa el backend para una aplicación de bolsa de empleo, desarrollado con **NestJS** y conectado a **Supabase** para la gestión de base de datos y autenticación.

## Características principales
- API REST construida con **NestJS**.
- Autenticación basada en **JWT**.
- Roles de usuario: **Candidato** y **Empresa**.
- Gestión de:
  - Usuarios (registro, login, perfil).
  - Ofertas de empleo (crear, listar, actualizar, eliminar).
  - Aplicaciones a ofertas (postulación).
- Integración con **Supabase** para persistencia y seguridad.

## Estructura del proyecto
El proyecto está organizado en una carpeta principal que contiene el código fuente en `src`. Dentro de `src` se encuentra el archivo de arranque `main.ts` y el módulo raíz `app.module.ts`. La lógica de negocio está dividida en módulos, cada uno con su propio controlador, servicio y DTOs. Los módulos principales son:
- **auth**: gestiona la autenticación y generación de tokens.
- **users**: maneja el registro, login y perfil de los usuarios.
- **jobs**: permite crear, listar, actualizar y eliminar ofertas de empleo.
- **applications**: gestiona las postulaciones de los candidatos a las ofertas.

Además, en la raíz del proyecto se incluyen archivos como `package.json` para dependencias, `.env` para variables de entorno y el propio `README.md`.


## Endpoints

### Autenticación

| Método | Endpoint       | Descripción                |
|--------|----------------|----------------------------|
| POST   | /auth/register | Registro de usuario        |
| POST   | /auth/login    | Login y obtención de token |

### Usuarios

| Método | Endpoint        | Descripción                 |
|--------|-----------------|-----------------------------|
| GET    | /users/profile  | Obtener perfil del usuario  |

### Ofertas de empleo

| Método | Endpoint        | Descripción                     |
|--------|-----------------|---------------------------------|
| GET    | /jobs           | Listar todas las ofertas        |
| GET    | /jobs/:id       | Obtener detalle de una oferta   |
| POST   | /jobs           | Crear oferta (empresa)          |
| PUT    | /jobs/:id       | Actualizar oferta               |
| DELETE | /jobs/:id       | Eliminar oferta                 |

### Aplicaciones

| Método | Endpoint             | Descripción                            |
|--------|----------------------|----------------------------------------|
| POST   | /applications        | Aplicar a una oferta                   |
| GET    | /applications        | Listar aplicaciones del usuario        |
| GET    | /applications/:id    | Detalle de una aplicación              |


## Project setup

- Necesitas crear un .env con tu base de datos tu Configuración del Sistema y configuracion de JWT/Seguridad

```bash
$ npm install
```

## Compilar y correr el proyecto

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Lanzar tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Recursos

- [Nest](https://github.com/nestjs/nest)
- [NestJS Documentation](https://docs.nestjs.com) 
- [Discord channel](https://discord.gg/G7Qnnhy)
- [courses](https://courses.nestjs.com/)
- [NestJS Mau](https://mau.nestjs.com)
- [NestJS Devtools](https://devtools.nestjs.com)
- [enterprise support](https://enterprise.nestjs.com)
- [X](https://x.com/nestframework) y [LinkedIn](https://linkedin.com/company/nestjs)
- [Jobs board](https://jobs.nestjs.com).

## Soporte

- [Mas informacion](https://docs.nestjs.com/support).
- [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
