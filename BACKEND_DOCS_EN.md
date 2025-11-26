# Backend Documentation - Proyecto Bolsa de Empleo

## Introduction
This project is a NestJS-based backend for a Job Board application. It manages users (Applicants and Companies), job offers, and applications.

## Authentication & Security
The system uses **JWT (JSON Web Tokens)** for authentication.
- **Guards**: `JwtAuthGuard` protects private routes. `RolesGuard` enforces role-based access.
- **Roles**:
  - `aspirante`: Can manage their profile, view offers, and apply.
  - `empresa`: Can manage their profile, create/manage offers, and view applications.

### Auth Endpoints
- **POST** `/auth/register`: Register a new user.
  - Body: `RegisterDto` (email, password, role, companyName[opt])
  - Returns: `{ token, userId, role }`
- **POST** `/auth/login`: Login existing user.
  - Body: `LoginDto` (email, password)
  - Returns: `{ token, userId, role }`

## API Reference

### User Module
- **GET** `/applicant/:userId/profile`: Get basic profile info for an applicant.

### Recruitment Module

#### Companies
**Job Offers** (`/recruitment/offers`)
- **GET** `/`: List all offers (Public).
- **GET** `/:id`: Get offer details (Public).
- **POST** `/`: Create offer (Role: `empresa`).
- **PUT** `/:id`: Update offer (Role: `empresa`).
- **DELETE** `/:id`: Delete offer (Role: `empresa`).

**Company Profile** (`/recruitment/company-profile`)
- **POST** `/`: Create profile (Role: `empresa`).
- **GET** `/me`: Get my profile (Role: `empresa`).
- **PUT** `/`: Update my profile (Role: `empresa`).
- **GET** `/:id`: Get any company profile (Public/Auth).

#### Aspirants
**Profile** (`/recruitment/profile`)
- **GET** `/`: Get my profile (Role: `aspirante`).
- **POST** `/`: Create profile (Role: `aspirante`).
- **PUT** `/`: Update profile (Role: `aspirante`).
- **DELETE** `/`: Delete profile (Role: `aspirante`).

**Experience** (`/recruitment/aspirants/experience`)
- **GET** `/`: List my experience.
- **POST** `/`: Add experience item.
- **PUT** `/:id`: Update experience item.
- **DELETE** `/:id`: Delete experience item.

**Skills** (`/recruitment/aspirants/skills`)
- **POST** `/`: Add skill.
- **PUT** `/:id`: Update skill.
- **DELETE** `/:id`: Delete skill.

#### Applications (`/recruitment/applications`)
- **POST** `/`: Apply to a job offer (Role: `aspirante`).
- **GET** `/me`: Get my applications (Role: `aspirante`).
- **GET** `/company`: Get applications for my offers (Role: `empresa`).
- **PUT** `/:id/status`: Update application status (Role: `empresa`).

## Data Models

### Entities
- **User**: `id`, `email`, `password`, `role`.
- **CompanyProfile**: `companyName`, `description`, `website`, `logoUrl`.
- **AspirantProfile**: `firstName`, `lastName`, `bio`, `phone`, `cvUrl`, `linkedinUrl`.
- **JobOffer**: `title`, `description`, `location`, `salaryRange`, `status`.
- **Application**: `status` (PENDING, APPLIED, IN_REVIEW, INTERVIEW, HIRED, REJECTED), `coverLetter`.
- **ExperienceItem**: `title`, `company`, `startDate`, `endDate`, `description`.
- **SkillItem**: `skillName`, `level` (Novice, Basic, Intermediate, Advanced, Expert).

### Key DTOs
- **CreateJobOfferDto**: `title`, `description`, `location`, `salaryRange`.
- **CreateProfileDto** (Aspirant): `name`, `email`, `skills`, `experience`.
- **CreateCompanyProfileDto**: `name`, `description`, `websiteUrl`, `address`.
