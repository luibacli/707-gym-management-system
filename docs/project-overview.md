# Project Overview

## 1. Product Overview

The Gym Membership Management System is a simple web-based application for
managing gym members and their membership records.

The MVP is designed to replace manual membership tracking and provide gym
staff with a centralized way to:

- Register and maintain member records
- Record membership plans and dates
- Monitor membership status
- Identify expired and near-expiry memberships
- Search and filter members
- View a simple membership dashboard

The system is intended for day-to-day use by authorized gym staff.

---

## 2. MVP Goals

The primary goals of the MVP are:

1. Centralize member information.
2. Centralize membership records.
3. Make membership expiry easy to monitor.
4. Reduce reliance on manual tracking.
5. Give gym staff a simple dashboard for daily monitoring.
6. Provide secure administrative access.
7. Establish a foundation that can support future features.

The MVP should prioritize simplicity, reliability, and ease of use over
feature breadth.

---

## 3. Target Users

### Gym Staff / Administrator

Authorized gym staff who manage member and membership information.

For the MVP, the system assumes a basic administrative user model.

More granular roles and permissions are outside the initial scope unless
required by confirmed business requirements.

---

## 4. Core MVP Modules

### 4.1 Member Management

The system allows authorized staff to:

- Create member records
- View member records
- Edit member records
- Search for members
- Archive member records

Member information should be limited to the information required by the
confirmed gym requirements.

The system should not introduce unnecessary member fields without a
business requirement.

---

### 4.2 Membership Management

The system allows staff to record membership information including:

- Membership plan
- Membership start date
- Membership expiry date

The MVP supports the membership plans defined in the confirmed requirements,
including monthly and annual membership periods.

---

### 4.3 Membership Status

The system must allow staff to identify memberships based on their current
status.

The MVP includes:

- Active
- Expired
- Near-expiry

Status should be derived from the membership dates and the agreed
near-expiry rule.

The exact definition of "near-expiry" must be confirmed as a business rule
before implementation if it has not yet been specified.

---

### 4.4 Dashboard

The dashboard provides a quick operational overview of:

- Total members
- Active memberships
- Expired memberships
- Memberships nearing expiry

The dashboard should focus on information useful for daily gym operations
rather than advanced analytics.

---

### 4.5 Search and Filtering

Staff should be able to:

- Search for members
- Filter membership records by status
- Quickly locate a specific member

The MVP should keep search and filtering simple and practical.

---

### 4.6 Administrative Access

The system requires secure authentication for authorized gym staff.

The MVP does not require a complex role and permission hierarchy unless
this is confirmed as a business requirement.

---

## 5. Core Workflow

The primary MVP workflow is:

1. Staff logs into the system.
2. Staff views the dashboard.
3. Staff registers a new member or searches for an existing member.
4. Staff records or updates the member's membership information.
5. The system determines the membership status from the membership dates.
6. Staff can monitor active, expired, and near-expiry memberships.
7. Staff can update or archive records when necessary.

---

## 6. Core Domain Concepts

### Member

A person registered with the gym.

### Membership

A membership record associated with a member.

A membership contains the plan and relevant membership dates.

### Membership Status

The current operational state of a membership based on its dates.

MVP statuses:

- Active
- Near-expiry
- Expired

### Administrator / Gym Staff

An authorized user who can access and manage the system.

---

## 7. MVP Scope

The MVP includes:

- Member registration
- Member profile management
- Membership management
- Monthly and annual membership plans
- Membership start and expiry dates
- Membership status monitoring
- Dashboard
- Search
- Status filtering
- Basic data management
- Record archiving
- Administrative access
- Production deployment
- Initial testing and implementation

These items are based on the current project proposal.

---

## 8. Explicitly Out of Scope for MVP

The following are not part of the initial MVP:

- SMS notifications
- Email notifications
- QR-code attendance/check-in
- Online payment gateway
- Mobile application
- Multiple branch management
- Payroll management
- Staff management
- Advanced accounting
- Advanced reporting
- Major feature additions outside the agreed scope

These features may be considered in future versions but should not be
implemented as part of the MVP unless the scope is formally changed.

---

## 9. MVP Design Principles

The MVP should follow these principles:

### Simple

Avoid unnecessary features, abstractions, and workflows.

### Practical

Prioritize workflows that gym staff perform regularly.

### Maintainable

Use a clear application structure so future features can be added without
unnecessary rewrites.

### Reliable

Membership status and expiry information must be calculated and displayed
consistently.

### Secure

Only authorized users should be able to access and modify gym data.

### Extensible

The MVP should leave reasonable room for future functionality without
building future features prematurely.

---

## 10. MVP Boundaries

The MVP is a membership management system.

It is not intended to be:

- A complete gym ERP
- An accounting system
- A payroll system
- An attendance system
- An online payment platform
- A mobile application
- A multi-branch management platform

Future functionality should only be introduced when supported by an approved
business requirement.

---

## 11. Business Rules Requiring Confirmation

The following details are not fully defined in the current proposal and
must be confirmed before implementation:

- Exact member information/fields
- Exact membership plan names
- Definition of "near-expiry"
- Whether a member can have multiple memberships
- Whether memberships can overlap
- What happens when a membership expires
- Whether archived members can be restored
- Whether staff accounts have different permission levels
- Whether membership status is calculated purely from dates or can be
  manually overridden
- Whether the expiry date is calculated from the plan (start + 1 month /
  1 year) or entered manually
- How monthly expiry is handled at month-end (e.g. Jan 31 + 1 month)
- Whether the expiry date itself counts as an active day
- Which timezone determines "today" for status calculation
- How renewals are recorded (new membership record vs. extending the
  existing one)

Claude must not invent these rules. Until confirmed, they should be treated
as unresolved requirements.

---

## 12. Future Expansion

The architecture should allow future features to be added when required,
but the MVP should not implement them prematurely.

Potential future areas identified by the proposal include:

- Notifications
- QR attendance/check-in
- Online payments
- Mobile application
- Multiple branch management
- Payroll/staff management
- Advanced accounting
- Advanced reporting

These are future considerations only and are not MVP requirements.
