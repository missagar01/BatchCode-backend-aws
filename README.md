# Professional Express MVC Backend

Production-ready Express starter written in CommonJS with a clean MVC layering (routes + controllers + services + repositories) and centralized config/middleware/utilities for easier scaling.

## Folder Layout

```
.
├── src
│   ├── app.js            # Express app wiring, global middleware, API mount point
│   ├── server.js         # HTTP server bootstrap + graceful shutdown
│   ├── config            # Environment parsing & database bootstrap
│   ├── controllers       # Request/response orchestration (thin)
│   ├── services          # Business logic
│   ├── repositories      # Persistence/external system access
│   ├── routes            # Versioned routers exposing controllers
│   ├── middlewares       # Cross-cutting middleware (errors, logging, validation)
│   ├── validations       # Zod schemas per use-case
│   └── utils             # Logger, API helpers, async wrappers
├── .env.example          # Environment contract
├── package.json          # Scripts + dependencies
└── README.md
```

## Getting Started

```bash
npm install
cp .env.example .env   # use `copy .env.example .env` in cmd.exe
npm run dev            # nodemon hot reload server (POST http://localhost:3004/qc-lab-samples, /sms-register)
```

Available scripts:

| Script        | Description                               |
|---------------|-------------------------------------------|
| `npm run dev` | Start dev server with nodemon             |
| `npm start`   | Run the production server                 |
| `npm run lint`| ESLint check for the CommonJS sources     |

## Current REST endpoints

- `POST /qc-lab-samples` - persists a QC lab sample row in PostgreSQL
- `GET /qc-lab-samples` - lists all QC lab samples or filters by `id`/`unique_code` via query params
- `GET /qc-lab-samples/:unique_code` - fetch a single QC lab sample directly by its code
- `POST /sms-register` - stores SMS register metadata with auto-generated `S-XXXX` codes
- `GET /sms-register` - lists all SMS register entries or filters by `id`/`unique_code`
- `POST /hot-coil` - captures hot coil production data with auto-generated `H-XXXX` codes
- `POST /re-coiler` - records re-coiler data with auto-generated `R-XXXX` codes (letters + digits 1-9, no zero)
- `GET /re-coiler` - lists all re-coiler entries or filters by `id`/`unique_code`
- `GET /re-coiler/:unique_code` - fetch a single re-coiler entry directly by its code
- `POST /pipe-mill` - saves pipe mill runs with optional image upload and auto-generated `P-XXXX` codes
- `GET /pipe-mill` - lists all pipe mill entries or filters by `id`/`unique_code`
- `GET /pipe-mill/:unique_code` - fetch a single pipe mill entry directly by its code
- `POST /laddle-checklist` - logs laddle checklist inspections with auto-generated `C-XXXX` codes
- `GET /laddle-checklist` - lists all laddle checklist entries or filters by `id`/`unique_code`
- `GET /laddle-checklist/:unique_code` - fetch a single laddle checklist entry directly by its code
- `POST /tundish-checklist` - records tundish checklist inspections with auto-generated `T-XXXX` codes
- `GET /tundish-checklist` - lists all tundish checklist entries or filters by `id`/`unique_code`
- `GET /tundish-checklist/:unique_code` - fetch a single tundish checklist entry directly by its code
- `POST /laddle-return` - stores laddle return forms (with optional photo uploads) and auto-generated `L-XXXX` codes
- `GET /laddle-return` - lists all laddle return entries or filters by `id`/`unique_code`
- `GET /laddle-return/:unique_code` - fetch a single laddle return entry directly by its code

### QC Lab Samples payload

```bash
curl -X POST http://localhost:3004/qc-lab-samples \
  -H "Content-Type: application/json" \
  -d '{
        "sample_timestamp": "2024-06-01T07:30:00Z",
        "sms_batch_code": "SMS-2024-001",
        "furnace_number": "F-01",
        "sequence_code": "SEQ-1",
        "laddle_number": 21,
        "shift_type": "A",
        "final_c": 0.0512,
        "final_mn": 0.6500,
        "final_s": 0.0110,
        "final_p": 0.0230,
        "tested_by": "Technician A",
        "remarks": "Within tolerance",
        "report_picture": "https://example.com/report.jpg"
      }'
```

The payload aligns with the `qc_lab_samples` table definition and is validated through Zod before being persisted. `sample_timestamp` defaults to the server time when omitted, and the `unique_code` column is automatically generated on the server with the format `QC-XXXX` (uppercase letters) and deduplicated with a unique index, so no manual input is needed.

To upload an image directly, send `multipart/form-data` with a `report_picture` file field (any standard image MIME type). The backend persists the file under `/uploads` and only the URL is stored in the database, so clients just render the link that comes back:

```bash
curl -X POST http://localhost:3004/qc-lab-samples \
  -H "Content-Type: multipart/form-data" \
  -F "sample_timestamp=2024-06-01T07:30:00Z" \
  -F "sms_batch_code=SMS-2024-001" \
  -F "furnace_number=F-01" \
  -F "sequence_code=SEQ-1" \
  -F "laddle_number=21" \
  -F "shift_type=A" \
  -F "final_c=0.0512" \
  -F "tested_by=Technician A" \
  -F "report_picture=@/path/to/report.png"
```

Uploaded files are served statically from `/uploads`, so clients can render them by referencing the URL returned in the POST response.

To read data back, hit the same resource with `GET` and optional filters. For example, to fetch a single row by its auto-generated code:

```bash
curl "http://localhost:3004/qc-lab-samples?unique_code=QC-ABCD"
```

You can also retrieve it directly via the path parameter:

```bash
curl "http://localhost:3004/qc-lab-samples/QC-ABCD"
```

Omit query parameters to receive the most recent samples ordered by timestamp.

### SMS Register payload

```bash
curl -X POST http://localhost:3004/sms-register \
  -H "Content-Type: application/json" \
  -d '{
        "sample_timestamp": "2024-05-18T08:30:00Z",
        "sequence_number": "SEQ-42",
        "laddle_number": 12,
        "sms_head": "Head Operator",
        "furnace_number": "F-02",
        "remarks": "Heat looks stable",
        "shift_incharge": "Incharge C",
        "picture": "https://drive.google.com/photo.png",
        "temperature": 1542
      }'
```

Each SMS register row automatically receives a unique code formatted as `S-xxxx` (uppercase alphanumeric characters) and, if `sample_timestamp` is omitted, the server automatically stores the current timestamp. The `picture` field is optional—supply a hosted link (for example, a Google Drive URL) or omit it entirely—and `remarks` can also be left blank.

To upload a photo directly instead of a URL, switch Postman to `form-data`, include the same text fields, and attach a file for `picture`. The API stores the file under `/uploads/sms-register-pictures` and rewrites the request body with the final URL before validation, so the rest of the workflow is unchanged.

Retrieve existing SMS register entries with a simple GET call; filter by `id` or `unique_code` if you only want a specific record:

```bash
curl "http://localhost:3004/sms-register?unique_code=S-1A2B"
```

Calling `GET /sms-register` without filters returns all entries ordered by the most recent timestamp.

### Hot Coil payload

```bash
curl -X POST http://localhost:3004/hot-coil \
  -H "Content-Type: application/json" \
  -d '{
        "sms_short_code": "SMS-21",
        "submission_type": "Hot Coil Section",
        "size": "146x148x2.90",
        "mill_incharge": "Rahul Sharma",
        "quality_supervisor": "Seema Roy",
        "picture": "https://example.com/coil.jpg",
        "electrical_dc_operator": "Operator 1",
        "remarks": "Coil ready for shipment",
        "strand1_temperature": "1350C",
        "strand2_temperature": "1342C",
        "shift_supervisor": "Vikas Patel"
      }'
```

Hot coil entries auto-stamp the current timestamp when not provided and assign a unique `H-XXXX` code (uppercase alphanumeric). Provide `sample_timestamp` if you need to overwrite the default; both `picture` and `remarks` are optional—send either a hosted URL or omit them entirely. To upload a file directly, send `multipart/form-data` with a `picture` field (any image MIME type) and the API will persist the `/uploads/hot-coil-pictures/<filename>` URL in the database. When the Google Form submission selects **Cold Billet**, only `sms_short_code` and `submission_type` are required—the backend generates the `unique_code` and stores the remaining columns as `NULL`, so no other fields are necessary:

```bash
curl -X POST http://localhost:3004/hot-coil \
  -H "Content-Type: application/json" \
  -d '{
        "sms_short_code": "SMS-99",
        "submission_type": "Cold Billet"
      }'
```

If you want to send the **full form** (including optional image upload) through Postman, switch the body to `form-data` and supply all fields shown above along with a `picture` file. The backend will normalize blank strings to `NULL`, store uploaded images under `/uploads/hot-coil-pictures/<filename>`, and return the persisted row with an auto-generated `H-XXXX` code.

### Re-Coiler payload

```bash
curl -X POST http://localhost:3004/re-coiler \
  -H "Content-Type: application/json" \
  -d '{
        "sample_timestamp": "2024-05-18T10:12:00Z",
        "hot_coiler_short_code": "HC-009",
        "size": "14mm",
        "supervisor": "Sanjay Gupta",
        "incharge": "Lata Bose",
        "contractor": "Mohan Steelworks",
        "machine_number": "RC-04",
        "welder_name": "J. Prakash"
      }'
```

Re-coiler entries follow the same timestamp defaulting rules, so omitting `sample_timestamp` stores the server time automatically. The backend also generates a `unique_code` formatted as `R-XXXX`, where `XXXX` is made of uppercase letters and digits 1-9 (zero is excluded) to match the production requirement.

Query the saved entries with either `GET /re-coiler?unique_code=R-9IA7` or `GET /re-coiler/R-9IA7`. Leaving off the filters returns the newest entries first.

```sql
CREATE TABLE IF NOT EXISTS re_coiler (
    id SERIAL PRIMARY KEY,
    sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    hot_coiler_short_code VARCHAR(50) NOT NULL,
    size VARCHAR(50),
    supervisor VARCHAR(100),
    incharge VARCHAR(100),
    contractor VARCHAR(100),
    machine_number VARCHAR(50),
    welder_name VARCHAR(100),
    unique_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_re_coiler_unique_code ON re_coiler (unique_code);
```

### Pipe Mill payload

```bash
curl -X POST http://localhost:3004/pipe-mill \
  -H "Content-Type: application/json" \
  -d '{
        "sample_timestamp": "2024-05-19T06:45:00Z",
        "recoiler_short_code": "RC-777",
        "mill_number": "Mill-02",
        "section": "Section-B",
        "item_type": "MS Pipe",
        "quality_supervisor": "Ritika Singh",
        "mill_incharge": "Vishal Rao",
        "forman_name": "Hari K",
        "fitter_name": "Deepak L",
        "shift": "Night",
        "size": "8 inch",
        "thickness": "6mm",
        "remarks": "Surface finish verified",
        "picture": "https://example.com/pipe.jpg"
      }'
```

Send `multipart/form-data` with a `picture` field (any image MIME type) to upload a file; the API will persist the file under `uploads/pipe-mill-pictures` and replace the `picture` field in the payload with the hosted URL (e.g. `/uploads/pipe-mill-pictures/<filename>`). Omitting `section`, `remarks`, or `picture` simply stores `NULL`. Every record gets a `unique_code` that follows the `P-XXXX` pattern, where the suffix is generated from uppercase letters and digits 1-9 (zero is not used). Apply the table first:

```sql
CREATE TABLE IF NOT EXISTS pipe_mill (
    id SERIAL PRIMARY KEY,
    sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    recoiler_short_code VARCHAR(50) NOT NULL,
    mill_number VARCHAR(100) NOT NULL,
    section VARCHAR(50),
    item_type VARCHAR(50),
    quality_supervisor VARCHAR(100) NOT NULL,
    mill_incharge VARCHAR(100) NOT NULL,
    forman_name VARCHAR(100) NOT NULL,
    fitter_name VARCHAR(100) NOT NULL,
    shift VARCHAR(20) NOT NULL,
    size VARCHAR(50) NOT NULL,
    thickness VARCHAR(30),
    remarks TEXT,
    picture TEXT,
    unique_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pipe_mill_unique_code ON pipe_mill (unique_code);
```

Read them back with the companion GET endpoints. Filter via query parameters or hit the path shortcut:

```bash
curl "http://localhost:3004/pipe-mill?unique_code=P-4FKD"
curl "http://localhost:3004/pipe-mill/P-4FKD"
```

Omit query parameters to list the most recent submissions first.

### Laddle Checklist payload

```bash
curl -X POST http://localhost:3004/laddle-checklist \
  -H "Content-Type: application/json" \
  -d '{
        "sample_timestamp": "2024-05-20T03:10:00Z",
        "laddle_number": 21,
        "sample_date": "2024-05-20",
        "slag_cleaning_top": "Done",
        "slag_cleaning_bottom": "Done",
        "nozzle_proper_lancing": "Yes",
        "pursing_plug_cleaning": "OK",
        "sly_gate_check": "Smooth",
        "nozzle_check_cleaning": "Completed",
        "sly_gate_operate": "Operational",
        "nfc_proper_heat": "Heat OK",
        "nfc_filling_nozzle": "Filled",
        "plate_life": 8,
        "timber_man_name": "Mahesh",
        "laddle_man_name": "Pratap",
        "laddle_foreman_name": "Karan",
        "supervisor_name": "Shalini"
      }'
```

`sample_timestamp` defaults to the current time if omitted, while `sample_date` accepts either `YYYY-MM-DD` or `DD/MM/YYYY` strings (or a JS `Date`) and is stored as a DATE column. `plate_life` is optional—send empty or omit it to store `NULL`. Every new row gets a `unique_code` in the format `C-XXXX`, where the suffix is built from uppercase letters and digits 1-9 (zero never appears). Create the table with:

```sql
CREATE TABLE IF NOT EXISTS laddle_checklist (
    id SERIAL PRIMARY KEY,
    sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    sample_date DATE NOT NULL,
    laddle_number INTEGER NOT NULL,
    slag_cleaning_top VARCHAR(50),
    slag_cleaning_bottom VARCHAR(50),
    nozzle_proper_lancing VARCHAR(50),
    pursing_plug_cleaning VARCHAR(50),
    sly_gate_check VARCHAR(50),
    nozzle_check_cleaning VARCHAR(50),
    sly_gate_operate VARCHAR(50),
    nfc_proper_heat VARCHAR(50),
    nfc_filling_nozzle VARCHAR(50),
    plate_life INTEGER,
    timber_man_name VARCHAR(100),
    laddle_man_name VARCHAR(100),
    laddle_foreman_name VARCHAR(100),
    supervisor_name VARCHAR(100),
    unique_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_laddle_checklist_unique_code ON laddle_checklist (unique_code);
```

Retrieve records with `GET /laddle-checklist?unique_code=C-1ABC` or `GET /laddle-checklist/C-1ABC`; omit the filters to list every entry ordered by the latest timestamp.

### Tundish Checklist payload

```bash
curl -X POST http://localhost:3004/tundish-checklist \
  -H "Content-Type: application/json" \
  -d '{
        "sample_timestamp": "2024-05-21T02:05:00Z",
        "tundish_number": 3,
        "sample_date": "21/05/2024",
        "sample_time": "02:05 AM",
        "nozzle_plate_check": "Done",
        "well_block_check": "Done",
        "board_proper_set": "Yes",
        "board_sand_filling": "Complete",
        "refractory_slag_cleaning": "Done",
        "tundish_mession_name": "Rajesh",
        "handover_proper_check": "Checked",
        "handover_nozzle_installed": "Installed",
        "handover_masala_inserted": "Inserted",
        "stand1_mould_operator": "Operator A",
        "stand2_mould_operator": "Operator B",
        "timber_man_name": "Ravi",
        "laddle_operator_name": "Suresh",
        "shift_incharge_name": "Divya",
        "forman_name": "Mukesh"
      }'
```

`sample_timestamp` is optional and defaults to the current time. `sample_date` accepts either `YYYY-MM-DD` or `DD/MM/YYYY` (or a Date object) and is persisted as a DATE column. All checklist fields are trimmed server-side before storage. Every entry receives a unique `T-XXXX` identifier using uppercase letters and digits 1-9 (zero is excluded). Apply the table definition:

```sql
CREATE TABLE IF NOT EXISTS tundish_checklist (
    id SERIAL PRIMARY KEY,
    sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tundish_number INTEGER,
    sample_date DATE,
    sample_time TEXT,
    nozzle_plate_check TEXT,
    well_block_check TEXT,
    board_proper_set TEXT,
    board_sand_filling TEXT,
    refractory_slag_cleaning TEXT,
    tundish_mession_name TEXT,
    handover_proper_check TEXT,
    handover_nozzle_installed TEXT,
    handover_masala_inserted TEXT,
    stand1_mould_operator TEXT,
    stand2_mould_operator TEXT,
    timber_man_name TEXT,
    laddle_operator_name TEXT,
    shift_incharge_name TEXT,
    forman_name TEXT,
    unique_code TEXT UNIQUE
);
```

### Laddle Return payload

```bash
curl -X POST http://localhost:3004/laddle-return \
  -H "Content-Type: application/json" \
  -d '{
        "sample_timestamp": "2024-05-22T07:30:00Z",
        "laddle_return_date": "22/05/2024",
        "laddle_return_time": "07:30 AM",
        "poring_temperature": "1535C",
        "poring_temperature_photo": "/uploads/laddle-return-poring-temperature/photo.jpg",
        "furnace_shift_incharge": "Ajay",
        "furnace_crane_driver": "Bhavesh",
        "ccm_temperature_before_pursing": "1480C",
        "ccm_temp_before_pursing_photo": "/uploads/laddle-return-ccm-before/before.png",
        "ccm_temp_after_pursing_photo": "/uploads/laddle-return-ccm-after/after.png",
        "ccm_crane_driver": "Madan",
        "stand1_mould_operator": "Op-1",
        "stand2_mould_operator": "Op-2",
        "shift_incharge": "Chirag",
        "timber_man": "Rohit",
        "operation_incharge": "Sunil",
        "laddle_return_reason": "Temperature drop"
      }'
```

Send `multipart/form-data` when you need the backend to host the `poring_temperature_photo`, `ccm_temp_before_pursing_photo`, or `ccm_temp_after_pursing_photo` files; each field accepts a single image and the API responds with its `/uploads/...` URL. When using JSON, provide already-hosted URLs for these photos (omit or send empty for any field to store `NULL`). `laddle_return_time` accepts either `HH:MM[:SS]` or `HH:MM[:SS] AM/PM`, and both `poring_temperature` and `ccm_temperature_before_pursing` can be free-form strings such as `1480C` or `1520`. `laddle_return_date` handles either `YYYY-MM-DD` or `DD/MM/YYYY`. Each record receives a unique `L-XXXX` code generated from uppercase letters and digits 1-9 (zero excluded). Table definition:

```sql
CREATE TABLE IF NOT EXISTS laddle_return (
    id SERIAL PRIMARY KEY,
    sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    laddle_return_date DATE NOT NULL,
    laddle_return_time TIME NOT NULL,
    poring_temperature VARCHAR(100),
    poring_temperature_photo TEXT,
    furnace_shift_incharge VARCHAR(100),
    furnace_crane_driver VARCHAR(100),
    ccm_temperature_before_pursing VARCHAR(100),
    ccm_temp_before_pursing_photo TEXT,
    ccm_temp_after_pursing_photo TEXT,
    ccm_crane_driver VARCHAR(100),
    stand1_mould_operator VARCHAR(100),
    stand2_mould_operator VARCHAR(100),
    shift_incharge VARCHAR(100),
    timber_man VARCHAR(100),
    operation_incharge VARCHAR(100),
    laddle_return_reason TEXT,
    unique_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_laddle_return_unique_code ON laddle_return (unique_code);
```

Read them back with `GET /laddle-return?unique_code=L-R7PF` or the shortcut `GET /laddle-return/L-R7PF`. Omit filters to review all entries ordered by the latest timestamps.

## Database configuration

Either provide `DATABASE_URL` or the discrete `PG_*` variables from `.env`:

```
PG_HOST=database-host
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=secret
PG_DATABASE=Batchcode
PG_SSL=true
```

SSL is automatically enabled (with `rejectUnauthorized: false`) for managed services such as AWS RDS when `PG_SSL=true`.

## Next Steps

- Extend validation schemas and middleware as new endpoints arrive.
- Build read/list/report APIs around `qc_lab_samples` and `sms_register`.
- Add authentication/authorization if the API is exposed beyond internal tooling.
