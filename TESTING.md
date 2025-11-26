# Testing in Bolsa Empleo Backend

This document explains how to run the unit tests for the NestJS backend.

## Prerequisites

- Node.js and npm installed.

## Running Tests

To run all tests, execute the following command in the `bolsaEmpleo_BE` directory:

```bash
npm run test
```

To run a specific test file:

```bash
npm run test src/app.service.spec.ts
```

## Test Structure

Tests are located in the `src` directory alongside the files they test, usually with the `.spec.ts` extension.
