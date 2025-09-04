# 🎯 **ROLE-BASED AUTHENTICATION IMPLEMENTATION PROMPT**

Copy the entire content below the code block:

```markdown
## 🎯 **CRYSTAL-CLEAR PROMPT FOR CURSOR AI AGENT**

---

**TASK: Implement Enterprise-Grade Role-Based Authentication System for MedFlow App**

## 🎯 **OBJECTIVE**
Transform the current basic authentication system into a **bulletproof, modular, high-performance role-based access control (RBAC) system** with **SUPER_ADMIN**, **ADMIN**, and **USER** roles.

## 🏗️ **SYSTEM ARCHITECTURE**

### **Role Hierarchy**
- **SUPER_ADMIN**: Full system control (you)
- **ADMIN**: Limited admin access (expiry-based invitations)
- **USER**: Regular app access

### **Permission System**
```typescript
interface Permission {
  resource: 'users' | 'analytics' | 'settings' | 'reports' | 'appointments' | 'patients';
  action: 'read' | 'write' | 'delete' | 'manage';
  scope: 'own' | 'all' | 'department';
}
```

## 📋 **IMPLEMENTATION REQUIREMENTS**

### **Phase 1: Core RBAC System**
1. **Extend User Interface**
   - Add `role`, `permissions`, `invitedBy`, `invitedAt` fields
   - Update all existing user objects in Firebase
   - Maintain backward compatibility

2. **Create Role Management Hook**
   - `useRole()` hook with role checking
   - `usePermissions()` hook with permission validation
   - High-performance caching and memoization

3. **Update Authentication Provider**
   - Integrate role checking into existing auth flow
   - Add role-based route protection
   - Maintain existing functionality

### **Phase 2: Admin Invitation System**
1. **Create Invitation Service**
   - Generate secure, expiring tokens
   - Track invitation usage and status
   - Configurable expiration times (1h, 24h, 7d)

2. **Admin Creation Flow**
   - Separate admin signup with invitation validation
   - One-time use tokens
   - Automatic role assignment

### **Phase 3: Admin Management Dashboard**
1. **User Management Interface**
   - List all users with roles
   - Role assignment controls
   - Invitation management
   - Bulk operations

2. **Permission Management**
   - Granular permission assignment
   - Role-based permission inheritance
   - Permission validation system

## 🛡️ **SECURITY REQUIREMENTS**

### **Authentication & Authorization**
- **Role-based route protection** for all sensitive routes
- **Permission checking** at component level
- **Invitation token security** (cryptographically secure)
- **Audit logging** for all admin actions

### **Data Protection**
- **Field-level security** in Firestore rules
- **Role-based data access** (users can only see their data)
- **Admin data isolation** (admins see all data)

## ⚡ **PERFORMANCE REQUIREMENTS**

### **Optimization**
- **Lazy loading** for admin components
- **Efficient caching** of user roles and permissions
- **Minimal re-renders** using React.memo and useMemo
- **Optimized Firestore queries** with proper indexing

### **Modularity**
- **Separate modules** for each major feature
- **Reusable components** for role/permission checking
- **Clean separation** of concerns
- **Easy testing** and maintenance

## 📁 **FILE STRUCTURE REQUIREMENTS**

```
src/
├── types/
│   ├── auth.ts (extend with roles)
│   ├── permissions.ts (new)
│   └── invitations.ts (new)
├── hooks/
│   ├── useRole.ts (new)
│   ├── usePermissions.ts (new)
│   └── useInvitations.ts (new)
├── services/
│   ├── roleService.ts (new)
│   ├── invitationService.ts (new)
│   └── permissionService.ts (new)
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx (new)
│   │   ├── UserManagement.tsx (new)
│   │   └── InvitationManager.tsx (new)
│   └── auth/
│       ├── AdminSignup.tsx (new)
│       └── RoleProtection.tsx (new)
├── providers/
│   └── AuthProvider.tsx (update)
└── firestore.rules (update)
```

## ✅ **VALIDATION CHECKLIST**

### **Before Implementation**
- [ ] **Verify current auth system** works correctly
- [ ] **Check Firebase configuration** is accessible
- [ ] **Review existing user data** structure
- [ ] **Confirm all imports** and dependencies

### **During Implementation**
- [ ] **Test each component** individually
- [ ] **Verify role inheritance** works correctly
- [ ] **Check permission validation** at all levels
- [ ] **Test invitation system** end-to-end

### **After Implementation**
- [ ] **All existing functionality** still works
- [ ] **Role-based access** functions correctly
- [ ] **Admin management** is fully functional
- [ ] **Performance** meets requirements
- [ ] **Security** is bulletproof

## 🚀 **IMPLEMENTATION INSTRUCTIONS**

1. **START WITH CORE RBAC**: Implement role system first
2. **MAINTAIN BACKWARD COMPATIBILITY**: Don't break existing features
3. **TEST INCREMENTALLY**: Each phase must work before proceeding
4. **OPTIMIZE PERFORMANCE**: Use React best practices
5. **SECURE BY DEFAULT**: Implement security at every level

## 🎯 **SUCCESS CRITERIA**

- ✅ **All users** can still access the app normally
- ✅ **SUPER_ADMIN** (you) has full control
- ✅ **ADMIN users** can be created via invitations
- ✅ **Role-based access** works for all features
- ✅ **Performance** is maintained or improved
- ✅ **Security** is enterprise-grade
- ✅ **Code** is modular and maintainable

## ⚠️ **CRITICAL NOTES**

- **DO NOT BREAK** existing authentication
- **MAINTAIN** all current user accounts
- **PRESERVE** existing user data
- **TEST THOROUGHLY** before deployment
- **DOCUMENT** all new features

---

**IMPLEMENT THIS SYSTEM WITH 100% PRECISION, MAINTAINING ALL EXISTING FUNCTIONALITY WHILE ADDING ENTERPRISE-GRADE SECURITY AND PERFORMANCE.**

**ONLY PROCEED AFTER ALL VALIDATION CHECKS PASS. IMPLEMENT INCREMENTALLY, TESTING EACH PHASE BEFORE MOVING TO THE NEXT.**

**FOCUS ON MODULARITY, PERFORMANCE, AND BULLETPROOF SECURITY.**
```

---

**📋 COPY THE ENTIRE CONTENT ABOVE THE CODE BLOCK (starting from "## 🎯 **CRYSTAL-CLEAR PROMPT FOR CURSOR AI AGENT**")**

**🚀 READY TO IMPLEMENT THE ROLE-BASED AUTHENTICATION SYSTEM!**
