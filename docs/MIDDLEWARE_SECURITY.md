# Middleware Security Implementation

## Overview

The middleware.ts file implements comprehensive route protection for theAGNT.ai application, with specific focus on securing internal routes for authorized domain users only.

## Security Architecture

### Route Categories

1. **Public Routes** - No authentication required
   - Homepage (`/`)
   - API routes (`/api/*`)
   - Static assets

2. **Auth Routes** (`/auth/*`) - Authentication pages
   - Accessible to unauthenticated users
   - Authenticated users redirected to dashboard

3. **Dashboard Routes** (`/dashboard/*`) - General user area
   - Requires authentication
   - Accessible to all authenticated users

4. **Internal Routes** (`/internal/*`) - Restricted to theAGNT.ai domain
   - Requires authentication AND domain validation
   - Only @theagnt.ai users and admin can access

5. **Admin Routes** (`/admin/*`) - Admin-only access
   - Requires authentication AND admin privileges
   - Only admin user can access

### Security Logic Flow

```
Request → Check Route Type → Apply Protection Rules → Allow/Redirect
```

#### Internal Route Protection Logic

```typescript
if (isInternalPage) {
  // Step 1: Authentication Check
  if (!isAuth) {
    return redirect('/auth/signin?from=originalURL');
  }

  // Step 2: Domain Validation
  if (!canAccessInternal(userEmail)) {
    return redirect('/dashboard'); // External users go to dashboard
  }
  
  // Step 3: Allow Access
  return null; // Continue to route
}
```

## Domain Validation

### Authorized Users

1. **Admin User**: `darrenapfel@gmail.com`
   - Full system access (admin + internal + dashboard)
   - Can access all route categories

2. **Internal Users**: `*@theagnt.ai`
   - Internal + dashboard access
   - Cannot access admin routes

3. **External Users**: All other domains
   - Dashboard access only
   - Redirected away from internal/admin routes

### Validation Functions

The middleware uses domain-utils.ts functions:

- `canAccessInternal(email)` - Checks if user can access internal routes
- `canAccessAdmin(email)` - Checks if user has admin privileges

## Redirect Behavior

### Unauthenticated Users

- **Target**: Any protected route
- **Action**: Redirect to `/auth/signin?from=originalURL`
- **Benefit**: After login, user returns to intended destination

### External Users (Authenticated)

- **Target**: Internal or admin routes
- **Action**: Redirect to `/dashboard`
- **Benefit**: No error page, smooth user experience

### Internal Users

- **Target**: Admin routes
- **Action**: Redirect to `/dashboard`
- **Benefit**: Clear separation of admin vs internal access

## Implementation Details

### Performance Optimizations

1. **Early Returns**: Auth page logic exits early
2. **Single Session Fetch**: Session retrieved once per request
3. **Minimal Route Checks**: Only check relevant route types

### Security Features

1. **Query Parameter Preservation**: Original URL with params preserved in redirects
2. **No Infinite Redirects**: Careful redirect logic prevents loops
3. **Graceful Degradation**: Handles missing user data safely

### Error Handling

- Missing session data handled gracefully
- Invalid user objects don't break the flow
- Defaults to most restrictive access level

## Testing Strategy

### Unit Tests

- Route protection logic for each user type
- Redirect URL construction
- Edge cases (missing data, invalid sessions)

### Integration Tests

- Full user flows through authentication
- Cross-browser compatibility
- Real session data validation

### Security Tests

- URL manipulation attempts
- Direct route access attempts
- Session tampering scenarios

## Deployment Considerations

### Environment Variables

No additional environment variables required - uses existing NextAuth configuration.

### Performance Impact

- Minimal latency added to requests
- Server-side validation prevents unnecessary client-side checks
- Efficient domain validation with cached results

### Monitoring

Recommended monitoring points:
- Unauthorized access attempts
- Redirect patterns
- Authentication failures
- Domain validation errors

## Configuration

### Middleware Matcher

```typescript
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

This configuration:
- Excludes API routes (handled separately)
- Excludes Next.js internal routes
- Excludes static assets for performance

### Route Patterns

Routes are matched using `startsWith()` for flexibility:
- `/internal` matches `/internal`, `/internal/waitlist`, `/internal/any/nested/path`
- `/admin` matches `/admin`, `/admin/users`, `/admin/settings`

## Security Considerations

### Threats Mitigated

1. **Unauthorized Access**: External users cannot access internal features
2. **Privilege Escalation**: Users cannot access higher-privilege routes
3. **Direct URL Access**: All routes protected regardless of entry method
4. **Session Bypass**: Server-side validation prevents client-side manipulation

### Potential Attack Vectors

1. **Session Hijacking**: Mitigated by NextAuth.js security features
2. **Domain Spoofing**: Email validation prevents fake domain access
3. **Route Bypassing**: Comprehensive matcher prevents route skipping

## Maintenance

### Adding New Protected Routes

1. Add route pattern check in middleware
2. Define access level using domain-utils functions
3. Add appropriate test cases
4. Update documentation

### Modifying Access Rules

1. Update domain-utils.ts functions
2. Verify middleware logic still applies correctly
3. Update test cases
4. Test with real user accounts

## Troubleshooting

### Common Issues

1. **Redirect Loops**: Check auth page logic and user session state
2. **Access Denied**: Verify user email domain and access functions
3. **Missing Redirects**: Ensure matcher includes all necessary routes

### Debug Information

The middleware logs can be enhanced for debugging:
- User email and domain validation results
- Route matching results
- Redirect decisions

## Future Enhancements

### Planned Features

1. **Rate Limiting**: Add request rate limiting for security
2. **Audit Logging**: Log access attempts for security monitoring  
3. **Feature Flags**: Dynamic route protection based on feature flags
4. **Role-Based Access**: More granular permission system

### Scalability Considerations

- Consider caching domain validation results
- Implement database-driven access control for larger teams
- Add API-based access control for mobile apps