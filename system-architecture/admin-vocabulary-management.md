# Admin Vocabulary Management System

## 1. Logic of Implementation (Logic Triển Khai)
The vocabulary system in the application is organized into "Folders" (Collections) and "Lessons" (Study Sets). 
The Admin Dashboard allows administrators to create and curate "Official" collections that are visibly verified (marked with stars and accessible globally).
Recently added features allow for:
- Creating new official collections with customizable colors, icons, names, and descriptions.
- **Editing** an existing official collection to update its styling and name/description.
- **Deleting** a collection permanently, which requires admin verification and clears the folder from the user interface.

These operations are managed via the `AdminController` to enforce strict authorization constraints (only users with the `ADMIN` role can execute these).

## 2. State Management (Quản Lý Trạng Thái)

### 2.1. Client-side State (React/Zustand)
Inside `AdminDashboardContent` (`frontend/src/app/admin/page.tsx`), React hooks are used to manage localized state:
- **`vocabFoldersList`**: An array of `Folder` objects rendered on the dashboard. It gets refreshed each time an action occurs.
- **`vocabFolderModalOpen`**: Boolean indicating the visibility of the "Create/Edit Collection" modal.
- **`vocabFolderEditId`**: Stored as `number | null`. Determines if the modal operates in 'Create' mode (`null`) or 'Edit' mode (`number` matching the ID).
- **Form States**: `vocabFolderName`, `vocabFolderDesc`, `vocabFolderColor`, `vocabFolderIcon` populate the input fields inside the modal.

### 2.2. Server-side Flow
1. **Controller**: `AdminController` maps the HTTP endpoints `/api/v1/admin/folders` (GET, POST) and `/api/v1/admin/folders/{id}` (PUT, DELETE).
2. **Service**: The controller delegates logic to `FolderService`.
3. **Authorization validation**: `assertOwnerOrAdmin` is triggered inside `FolderService` to ensure that either the creator of the folder or an Admin is permitted to execute the update or deletion.
4. **Repository**: `FolderRepository` handles direct access to the database (PostgreSQL), executing the actual save or delete operation.

## 3. Frontend-Backend Integration (Tích hợp FE-BE)

| Method | Path | Request Body / Params | Response | Description |
|---|---|---|---|---|
| `GET` | `/api/admin/folders` | None | `FolderResponse[]` | Fetches all official vocabulary collections. |
| `POST` | `/api/admin/folders` | `FolderRequest` | `FolderResponse` | Creates a new official vocabulary collection. |
| `PUT` | `/api/admin/folders/{id}` | `FolderRequest` | `FolderResponse` | Updates the details of a specific official collection. |
| `DELETE` | `/api/admin/folders/{id}` | Path variable `{id}` | `204 No Content` | Removes the official collection permanently. |

### Payload DTO (`FolderRequest`):
```typescript
{
  name: string;
  description?: string;
  color: string;
  icon: string;
}
```

## 4. Mermaid Diagrams

### 4.1. Sequence Diagram: Editing a Collection

```mermaid
sequenceDiagram
    participant User as Admin User
    participant UI as Admin Dashboard (Next.js)
    participant API as adminApi (Axios)
    participant Ctrl as AdminController (Spring)
    participant Svc as FolderService
    participant DB as Database

    User->>UI: Clicks "Edit" icon on a Collection
    UI->>UI: Open Modal & populate form (set `vocabFolderEditId`)
    User->>UI: Changes details and clicks "Save Changes"
    UI->>API: `updateOfficialFolder(id, payload)`
    API->>Ctrl: `PUT /api/admin/folders/{id}`
    Ctrl->>Svc: `updateFolder(id, payload, adminUser)`
    Svc->>DB: Check if folder exists
    Svc->>Svc: Validate Admin rights (`assertOwnerOrAdmin`)
    Svc->>DB: Save updated folder
    DB-->>Svc: Updated Folder Entity
    Svc-->>Ctrl: `FolderResponse`
    Ctrl-->>API: `200 OK` + `FolderResponse` JSON
    API-->>UI: Resolution
    UI->>UI: Close Modal
    UI->>API: `loadAdminData()` (Refresh folders)
    API-->>UI: Updated list
    UI-->>User: Refreshed UI showing changes
```

### 4.2. Workflow Diagram: UI State for Collection Action Modal

```mermaid
stateDiagram-v2
    [*] --> DashboardView
    DashboardView --> ModalOpen : Click "Official Collection" (Create)
    DashboardView --> ModalOpen : Click "Edit" on existing (Edit)
    
    state ModalOpen {
        [*] --> ModeCheck
        ModeCheck --> CreateMode : if vocabFolderEditId == null
        ModeCheck --> EditMode : if vocabFolderEditId != null
        
        CreateMode --> SubmitAPI
        EditMode --> SubmitAPI
        
        SubmitAPI --> Processing
    }
    
    Processing --> DashboardView : API Success (Modal Closes & Data Refreshes)
    Processing --> ModalOpen : API Error (Show Alert)
    ModalOpen --> DashboardView : Click "Cancel" / "Close"
```
