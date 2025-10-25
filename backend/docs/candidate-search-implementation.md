# Candidate Search Implementation Documentation

## Overview

The candidate search functionality allows recruiters to filter and rank job seekers based on multiple criteria including keywords, skills, years of experience, and location.

## API Endpoint

- **URL**: `GET /api/candidate/search`
- **Authentication**: Required (JWT token)
- **Access**: Recruiters only

### Query Parameters

| Parameter            | Type   | Required | Description                                            |
| -------------------- | ------ | -------- | ------------------------------------------------------ |
| `q`                  | string | Optional | Keywords to search in name, summary, location          |
| `skills`             | string | Optional | Comma-separated list of skills to match                |
| `min_exp`            | number | Optional | Minimum years of experience                            |
| `max_exp`            | number | Optional | Maximum years of experience                            |
| `preferred_location` | string | Optional | City/location to match                                 |
| `page`               | number | Optional | Page number (default: 1)                               |
| `per_page`           | number | Optional | Items per page (default: 20, max: 100)                 |
| `sort`               | string | Optional | Sort order: `relevance`, `exp_high`, `exp_low`, `name` |

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "user_id": "string",
      "full_name": "string",
      "summary": "string",
      "preferred_location": "string",
      "total_experience_years": "number",
      "skills_list": "string",
      "match_score": "number",
      "profile_picture": "string or null",
      "status": "profile status enum"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

## Implementation Details

### Database Schema

The implementation includes a database view `job_seekers_with_skills` that combines:

- Job seeker information from the `job_seekers` table
- Calculated total years of experience from the `work_experiences` table
- Aggregated skills from the `job_seeker_skills` and `skills` tables
- Full-text search vector combining name, summary, location and skills

### Migrations

The migration file `20251025120000_add_candidate_search_functionality.sql` creates:

- A function `calculate_total_experience()` to compute years of experience
- A view `job_seekers_with_skills` with aggregated data
- Indexes to optimize search performance

## Ranking Formula

The relevance score is calculated using the following components:

### Score Components

1. **Keyword Matching (0.9 max)**
   - Name match: +0.4 points
   - Summary match: +0.3 points
   - Location match: +0.2 points

2. **Skills Matching (0.2 max)**
   - Proportional to number of matched skills: +0.2 \* (matched / total requested)

3. **Location Bonus (0.15 max)**
   - When preferred location matches: +0.15 points

4. **Experience Range Bonus (0.1 max)**
   - When experience is >= min_exp: +0.05 points
   - When experience is <= max_exp: +0.05 points

### Final Score Calculation

```
total_score = min(1, keyword_score + skills_score + location_bonus + experience_bonus)
```

The scores are normalized to a 0-1 scale where 1 is the highest relevance.

## Performance Considerations

- Full-text search indexes on the combined search vector
- B-tree indexes on experience years and location for filtering
- Computed view to avoid complex joins on each request
- Proper pagination to limit result set size

## Validation

- All inputs are validated and sanitized
- Maximum 20 skills allowed per request
- Experience values limited to 0-50 years
- Page size limited to 1-100 items
- String lengths constrained to prevent abuse
