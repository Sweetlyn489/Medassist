# MediAssist — Clinical Workspace (EHR-inspired demo)

A functional, realistic clinical workflow application: patient records,
assessments, labs, medications, a transparent clinical decision-support
rule engine, follow-ups, a patient timeline, and a full audit log.

**Important:** MediAssist provides decision-support cues (e.g. "Elevated
value detected — requires clinical review"), never a diagnosis. All rules
live in the `ClinicalRule` collection and are fully configurable from
Settings by an admin.

This codebase was written and syntax-checked, but **not run end-to-end**,
in the environment that produced it (no internet access, no MongoDB
available there). Follow the steps below to run it for real.

## Prerequisites

- Node.js 18+ and npm
- A MongoDB instance — either:
  - Local: `mongodb://127.0.0.1:27017/mediassist` (install MongoDB Community
    Server, or run `docker run -d -p 27017:27017 mongo:7`), or
  - A free MongoDB Atlas cluster (get a connection string from atlas.mongodb.com)

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGO_URI (and a real JWT_SECRET) if not using the local default
npm run seed     # wipes and loads fictional demo data (17 patients, users, rules)
npm run dev      # starts the API on http://localhost:5000
```

Seed script output prints demo login credentials, also listed below.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env   # optional — default proxy already targets localhost:5000
npm run dev             # starts the app on http://localhost:5173
```

Open http://localhost:5173 and sign in.

## Demo accounts (created by `npm run seed`)

| Role      | Email                          | Password       |
|-----------|---------------------------------|----------------|
| Admin     | admin@mediassist.local          | Admin@12345    |
| Clinician | elena.voss@mediassist.local     | Clinician@123  |
| Clinician | marcus.ibe@mediassist.local     | Clinician@123  |

## Verifying the end-to-end workflow

1. Log in as a clinician.
2. Use the top-bar search or the Patients list to open a patient.
3. Click **+ New Assessment**, enter vitals (try heart rate `135` to trip
   the tachycardia rule), and save — a finding is created immediately.
4. Go to the **Overview** tab and click **Review** on the new finding.
5. Click **+ Schedule Follow-up**, set a due date, and check it now shows
   on the **Dashboard**.
6. Refresh the browser — everything persists (it's all in MongoDB).
7. As an admin, open **Audit Log** to see every action just taken, and
   **Settings** to see/edit the rules that generated the finding.

## Project structure

```
backend/
  config/        MongoDB connection
  models/        Mongoose schemas (User, Patient, Assessment, LaboratoryResult,
                  Medication, ClinicalFinding, FollowUp, AuditLog, ClinicalRule)
  controllers/   Route handlers
  routes/        Express routers
  middleware/    JWT auth, role checks, centralized error handling
  validators/    express-validator rule sets
  services/      Audit logging, finding persistence
  rules/         The clinical decision-support rule engine (kept separate
                  from controllers) + default demonstration rule set
  seed/          Fictional demo data + seed script (drives the real rule engine)
  server.js

frontend/
  src/
    api/              Axios calls per resource
    context/          Auth context (JWT session)
    components/
      layout/         Sidebar, Topbar, Layout shell
      common/          DataTable, Tabs, StatusBadge, Modal, InlineAlert
      patient/         Patient Workspace tabs + action modals
    pages/             Route-level pages (Dashboard, Patients, PatientWorkspace,
                       Findings, FollowUps, AuditLog, Settings, Login)
    styles/            Design tokens / global CSS (no component library, no
                       Tailwind — plain CSS to keep this dependency-light)
```

## Notes on scalability / what's intentionally left for later

The spec calls out several future directions that are **not implemented**
but the architecture doesn't block them:
- Multi-clinic support: add a `clinic` field + scoping to Patient/User/queries.
- FHIR/external lab/EHR integration: would live behind a new `services/`
  adapter, called from controllers exactly like the rule engine is today.
- Notifications: `services/` is already the right place; the audit log's
  event shape is close to what a notification payload would need.
- AI-assisted summaries: intentionally NOT the foundation — the app is
  fully functional today without any LLM involved, and a summary feature
  would only ever consume the same REST endpoints as the UI does.
