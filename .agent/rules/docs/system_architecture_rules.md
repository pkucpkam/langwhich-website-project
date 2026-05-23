---
trigger: always_on
---

# System Architecture & Documentation Auto-Generation Rules

Whenever you design, implement, modify, or add any new feature or module (across either Frontend or Backend), you MUST automatically create or update the technical documentation in the `system-architecture/` folder.

---

## 1. Core Objectives

* Maintain a single, accurate source of truth for the entire application's technical design.
* Prevent documentation drift when codebase logic, state machines, database schemas, or API endpoints change.
* Assist developers in onboarding and understanding state flow without reading lines of implementation.

---

## 2. When to Update Documentation

You MUST update or create documentation in the following scenarios:
1. **New Module/Feature**: Creating a new module (e.g. Grammar Test, Speaking Analyzer, etc.).
2. **Database Change**: Modifying table schemas (PostgreSQL) or MongoDB models.
3. **State Management Change**: Adding/updating properties or actions in Zustand stores or components.
4. **API Integration Change**: Modifying API endpoints, requests, response DTOs, or headers.

---

## 3. Required Document Layout & Contents

Each documentation page inside `system-architecture/` must follow this precise outline:

### 3.1. Logic of Implementation (Logic Triển Khai)
Detailed explanation of step-by-step logic, background operations, flow charts, algorithms used (e.g. SM-2, text sanitization, token parsing).

### 3.2. State Management (Quản Lý Trạng Thái)
* **Client-side State**: Explain properties, active statuses, flags, and actions inside Zustand stores or custom React states.
* **Server-side Flow**: Detail the request routing chain: Controller ➔ Service ➔ Repository ➔ DB.

### 3.3. Frontend-Backend Integration (Tích hợp FE-BE)
A precise mapping table containing:
* HTTP Methods & Paths.
* Payload DTO models (TypeScript interfaces & Java/NestJS DTO classes).
* Axios handlers and responses.

### 3.4. Mermaid Diagrams
Include at least one:
* **Sequence Diagram** (for complex operations, e.g. Payment flow, token refresh).
* **State/Workflow Diagram** (for UI state changes, e.g. Flashcard set transitions).
* **ERD Diagram** (if DB models are introduced or mutated).
