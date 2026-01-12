
# Citizen Services & Digital Benefits Platform (CSDP)

A realistic, production-style government welfare platform designed for practicing security testing and understanding complex business workflows.

## Features
- **Public Portal**: Application tracking via reference numbers.
- **RBAC System**: Beneficiaries, Local Officers, District Admins, and Super Admins.
- **Welfare Engine**: Scheme selection, amount validation (weak), and application status lifecycle.
- **Admin Tools**: Bulk payment processing, district oversight, and CSV exports.

## Tech Stack
- React 18
- Tailwind CSS
- Mock In-memory SQL DB (simulating PostgreSQL behavior)
- RESTful API patterns with intentional vulnerabilities.

## Intentional Vulnerabilities (WSTG Checklist)

### 1. Insecure Direct Object Reference (IDOR) - WSTG-AUTHZ-04
Applications are fetched using sequential integer IDs (e.g., `/application/1`). 
- **Test**: Log in as a citizen, visit `/application/1`, then manually change the URL to `/application/2` to see someone else's sensitive data.

### 2. Broken Access Control - WSTG-AUTHZ-01
The application hides UI buttons based on roles but the simulated "backend" logic often fails to verify if the requesting user actually owns the resource.
- **Test**: Try to submit a "Status Update" request for an application you don't own by manipulating API parameters.

### 3. Sensitive Data Exposure - WSTG-CRYP-01
System audit logs are publicly accessible at `/audit-logs` (link in the footer of the home page).
- **Test**: Read the logs to find user IDs, IP addresses, and specific actions taken by admins.

### 4. Mass Assignment (Over-posting) - WSTG-BUSL-08
The profile update endpoint merges whatever object is sent without filtering for forbidden keys.
- **Test**: When updating your profile, intercept the request and add `"role": "super_admin"` to the payload.

### 5. Business Logic Flaws - WSTG-BUSL-04
The payment module triggers status updates in a loop without transaction atomicity or idempotency checks.
- **Test**: Fast-click the "Process Payments" button multiple times to see if it triggers duplicate logic or fails inconsistently.

## Test Credentials
- **Citizen**: `citizen@example.com` / `password`
- **Local Officer**: `officer@example.com` / `password`
- **Admin**: `admin@example.com` / `password`
- **Super Admin**: `super@example.com` / `password`

## Getting Started
1. Click **Preview** to launch the React application.
2. Sign in with the credentials above.
3. Use the browser URL bar to test IDOR vulnerabilities.
4. Check the "Audit Logs" at the bottom of the home page for data harvesting.
