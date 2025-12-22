# Forms API Guide

## Overview
The updated Leads API now supports 5 different form types:
- `contact` - Contact Page Form
- `suggestion` - Suggestion Box Form  
- `accessibility` - Accessibility Feedback Form
- `grievance` - Anonymous Grievance Form
- `complaint` - Complaint Form (Disciplinary Action)

## API Endpoints

### Submit Form
**POST** `/api/leads/submit`

Submit any of the 5 form types. The `formType` field determines which validation and data structure is used.

#### Request Body
```json
{
  "formType": "contact|suggestion|accessibility|grievance|complaint",
  // ... form-specific fields
}
```

#### Response
```json
{
  "success": true,
  "message": "Form-specific success message",
  "data": {
    "id": "lead_id",
    "formType": "contact"
  }
}
```

### Get Leads with Filtering
**GET** `/api/leads`

Query Parameters:
- `formType` - Filter by form type (contact, suggestion, accessibility, grievance, complaint)
- `status` - Filter by status (New, Contacted, etc.)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

#### Examples:
```
GET /api/leads?formType=contact
GET /api/leads?formType=grievance&status=New
GET /api/leads?formType=accessibility&page=2&limit=25
```

### Get Form Statistics
**GET** `/api/leads/stats/form-types`

Returns breakdown of submissions by form type.

## Form Type Details

### 1. Contact Form (`formType: "contact"`)
**Required Fields:**
- firstName, lastName, company, email, phone, cityCountryTimezone, selectOne

**Key Fields:**
- `cityCountryTimezone`: "New York, USA / EST"
- `selectOne`: "Email me information" | "Schedule a meeting"
- `areasOfInterest`: String describing interests

### 2. Suggestion Form (`formType: "suggestion"`)
**Required Fields:**
- suggestion, mood

**Key Fields:**
- `name`: Optional name
- `email`: Optional email
- `mood`: "happy" | "neutral" | "sad"

### 3. Accessibility Form (`formType: "accessibility"`)
**Required Fields:**
- attendedConference, hadAccessibilityNeeds, needsMet, venueRating, resourcesRating

**Key Fields:**
- `attendedConference`: "in-person" | "virtual"
- `hadAccessibilityNeeds`: "yes" | "no"
- `needsMet`: "yes" | "no"
- `venueRating`, `resourcesRating`: "1" to "5" (as strings)

### 4. Grievance Form (`formType: "grievance"`)
**Required Fields:**
- grievanceVisibility, shareWith, incidentDescription

**Key Fields:**
- `grievanceVisibility`: "Completely Anonymous" | "Anonymous with name included" | "Open Disclosure"
- `shareWith`: "CEO" | "COO" | "President" | "Legal Team"
- `incidentDescription`: Detailed description of incident
- `witnessName`: Optional witness name
- `desiredOutcome`: Expected resolution

### 5. Complaint Form (`formType: "complaint"`)
**Required Fields:**
- complainantName, complainantEmail, respondentName, complaintNature, detailedDescription, acknowledgement

**Key Fields:**
- `complainantName`: Name of person filing complaint
- `complainantEmail`: Email of complainant
- `respondentName`: Name of person complaint is against
- `complaintNature`: Type/nature of complaint
- `acknowledgement`: Boolean confirming understanding of process

## Database Schema Updates

The Lead model now includes:
- `formType` field (required, indexed)
- Form-specific fields for each type
- Flexible validation based on form type
- Support for arrays (witnesses, areas of interest, etc.)

## Usage in Frontend

```javascript
// Example: Submit contact form
const contactData = {
  formType: 'contact',
  firstName: 'John',
  lastName: 'Doe',
  company: 'ABC Corp',
  email: 'john@example.com',
  phone: '+1234567890',
  cityCountryTimezone: 'New York, USA / EST',
  selectOne: 'Email me information',
  areasOfInterest: 'Attend ACRM Conference'
};

fetch('/api/leads/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(contactData)
});

// Example: Submit suggestion form
const suggestionData = {
  formType: 'suggestion',
  name: 'Jane',
  email: 'jane@example.com',
  suggestion: 'Great platform!',
  mood: 'happy'
};

// Example: Submit complaint form
const complaintData = {
  formType: 'complaint',
  complainantName: 'John Doe',
  complainantEmail: 'john@example.com',
  respondentName: 'Jane Smith',
  complaintNature: 'Ethics Violation',
  incidentDate: '2024-01-15',
  detailedDescription: 'Detailed description...',
  acknowledgement: true
};
```

## Admin Dashboard Integration

The leads management page (`/leads/leads-management`) can now filter by form type:

```javascript
// Filter leads by form type
fetch('/api/leads?formType=grievance')
  .then(response => response.json())
  .then(data => {
    // Display filtered leads
  });
```

This allows administrators to:
- View all submissions by type
- Handle sensitive forms (grievance/complaint) appropriately
- Track form performance and usage statistics