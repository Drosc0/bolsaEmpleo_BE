# Documentación del Backend - Proyecto Bolsa de Empleo

## Introducción
Este proyecto es un backend basado en NestJS para una aplicación de Bolsa de Empleo. Gestiona usuarios (Aspirantes y Empresas), ofertas de trabajo y postulaciones.

## Autenticación y Seguridad
El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación.
- **Guardias**: `JwtAuthGuard` protege las rutas privadas. `RolesGuard` hace cumplir el acceso basado en roles.
- **Roles**:
  - `aspirante`: Puede gestionar su perfil, ver ofertas y postularse.
  - `empresa`: Puede gestionar su perfil, crear/gestionar ofertas y ver postulaciones.

### Endpoints de Autenticación
- **POST** `/auth/register`: Registrar un nuevo usuario.
  - Body: `RegisterDto` (email, password, role, companyName[opcional])
  - Retorna: `{ token, userId, role }`
- **POST** `/auth/login`: Iniciar sesión de usuario existente.
  - Body: `LoginDto` (email, password)
  - Retorna: `{ token, userId, role }`

## Referencia de la API

### Módulo de Usuario
- **GET** `/applicant/:userId/profile`: Obtener información básica del perfil de un aspirante.

### Módulo de Reclutamiento

#### Empresas
**Ofertas de Trabajo** (`/recruitment/offers`)
- **GET** `/`: Listar todas las ofertas (Público).
- **GET** `/:id`: Obtener detalles de la oferta (Público).
- **POST** `/`: Crear oferta (Rol: `empresa`).
- **PUT** `/:id`: Actualizar oferta (Rol: `empresa`).
- **DELETE** `/:id`: Eliminar oferta (Rol: `empresa`).

**Perfil de Empresa** (`/recruitment/company-profile`)
- **POST** `/`: Crear perfil (Rol: `empresa`).
- **GET** `/me`: Obtener mi perfil (Rol: `empresa`).
- **PUT** `/`: Actualizar mi perfil (Rol: `empresa`).
- **GET** `/:id`: Obtener cualquier perfil de empresa (Público/Auth).

#### Aspirantes
**Perfil** (`/recruitment/profile`)
- **GET** `/`: Obtener mi perfil (Rol: `aspirante`).
- **POST** `/`: Crear perfil (Rol: `aspirante`).
- **PUT** `/`: Actualizar perfil (Rol: `aspirante`).
- **DELETE** `/`: Eliminar perfil (Rol: `aspirante`).

**Experiencia** (`/recruitment/aspirants/experience`)
- **GET** `/`: Listar mi experiencia.
- **POST** `/`: Añadir ítem de experiencia.
- **PUT** `/:id`: Actualizar ítem de experiencia.
- **DELETE** `/:id`: Eliminar ítem de experiencia.

**Habilidades** (`/recruitment/aspirants/skills`)
- **POST** `/`: Añadir habilidad.
- **PUT** `/:id`: Actualizar habilidad.
- **DELETE** `/:id`: Eliminar habilidad.

#### Postulaciones (`/recruitment/applications`)
- **POST** `/`: Postularse a una oferta de trabajo (Rol: `aspirante`).
- **GET** `/me`: Obtener mis postulaciones (Rol: `aspirante`).
- **GET** `/company`: Obtener postulaciones para mis ofertas (Rol: `empresa`).
- **PUT** `/:id/status`: Actualizar estado de la postulación (Rol: `empresa`).

## Modelos de Datos

### Entidades
- **User**: `id`, `email`, `password`, `role`.
- **CompanyProfile**: `companyName`, `description`, `website`, `logoUrl`.
- **AspirantProfile**: `firstName`, `lastName`, `bio`, `phone`, `cvUrl`, `linkedinUrl`.
- **JobOffer**: `title`, `description`, `location`, `salaryRange`, `status`.
- **Application**: `status` (PENDING, APPLIED, IN_REVIEW, INTERVIEW, HIRED, REJECTED), `coverLetter`.
- **ExperienceItem**: `title`, `company`, `startDate`, `endDate`, `description`.
- **SkillItem**: `skillName`, `level` (Novice, Basic, Intermediate, Advanced, Expert).

### DTOs Clave
- **CreateJobOfferDto**: `title`, `description`, `location`, `salaryRange`.
- **CreateProfileDto** (Aspirante): `name`, `email`, `skills`, `experience`.
- **CreateCompanyProfileDto**: `name`, `description`, `websiteUrl`, `address`.
