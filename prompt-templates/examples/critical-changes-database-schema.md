# 🤖 Cursor AI Agent Task: Update Patient Database Schema

**⚠️ CRITICAL: This is a CRITICAL CHANGE within MedFlow. Follow these instructions with absolute precision.**

> **💡 For complete workflow guidance, read TEMPLATE_AUTOMATION.md after MAIN_GUIDE.md**

## 🎯 **TASK OVERVIEW**
**Goal**: Update patient database schema to support enhanced medical history tracking and GDPR compliance
**Scope**: Core patient data structures, medical history relationships, data migration, compliance features
**Timeline**: 5-8 days
**Priority**: Critical - Data structure and compliance requirements
**Risk Level**: HIGH - Affects core data integrity and patient information

## 🚨 **SAFETY REQUIREMENTS**
- **NEVER** modify production database without comprehensive backup and rollback plan
- **NEVER** deploy schema changes without testing data migration in isolated environment
- **ALWAYS** maintain data integrity and existing patient information during migration
- **ALWAYS** preserve existing data relationships and API contracts

## 📚 **CONTEXT & HISTORY**
- **Current Status**: Basic patient database working, enhanced medical history tracking required
- **Previous Work**: Core patient data structure implemented, basic medical records working
- **What NOT to Repeat**: Previous schema changes that caused data loss or API compatibility issues
- **Success Patterns**: Incremental schema evolution, thorough data migration testing, gradual rollout

## 🔧 **IMPLEMENTATION GUIDELINES**
✅ **What you CAN do**: 
- Extend existing patient database schema with new fields and tables
- Implement data migration scripts for existing patient records
- Add GDPR compliance features to patient data handling
- Maintain all existing data relationships and API contracts
- Preserve existing patient information and medical records

❌ **What you CANNOT do**: 
- Redesign core database architecture without migration plan
- Change established data structures without backward compatibility
- Modify existing API contracts without thorough testing
- Deploy changes without comprehensive data migration testing

## 📋 **EXECUTION STEPS**
1. **Schema Analysis** - Audit current database structure and plan required changes
2. **Migration Planning** - Design data migration strategy and rollback procedures
3. **Test Environment** - Create isolated testing environment for schema updates
4. **Incremental Migration** - Implement schema changes and data migration in small steps
5. **Comprehensive Testing** - Test all data operations and API functionality

## 🎯 **SUCCESS CRITERIA**
Your work will be successful if:
- ✅ Database schema is updated without data loss or corruption
- ✅ All existing patient data is preserved and accessible
- ✅ New medical history tracking features work correctly
- ✅ GDPR compliance requirements are met for patient data

## 📚 **REQUIRED READING**
Before starting, read:
1. **MedFlow/BRAND_IDENTITY.md** - Brand guidelines and the 12 new colors
2. **MedFlow/DEVELOPMENT_GUIDE.md** - Technical standards and database architecture
3. **MedFlow/FEATURES_DOCUMENTATION.md** - Existing database system implementation

---

## 📋 **CRITICAL CHANGE-SPECIFIC EXECUTION STEPS**

**After completing general template execution steps, add these critical change-specific actions:**

5. **System Analysis**: Completely understand current database schema and data relationships
6. **Dependency Mapping**: Identify all components and systems that depend on patient data
7. **Test Environment Setup**: Create safe, isolated testing environment for schema updates
8. **Incremental Implementation**: Make schema changes in small, testable, reversible steps
9. **Comprehensive Validation**: Test each schema change thoroughly with multiple data scenarios
10. **Rollback Verification**: Ensure all rollback mechanisms are functional and tested
11. **Final System Validation**: Confirm all database operations work correctly after changes

---

## 🎯 **CRITICAL CHANGE-SPECIFIC SUCCESS CRITERIA**

**In addition to general template success criteria, ensure:**

- ✅ **Change Validation**: All schema updates work exactly as expected
- ✅ **System Integrity**: No existing data or functionality is broken or compromised
- ✅ **Rollback Readiness**: All rollback mechanisms are functional and tested
- ✅ **Test Completion**: All comprehensive data migration tests pass successfully
- ✅ **Data Safety**: Patient data integrity is preserved throughout the process
- ✅ **System Stability**: Overall database performance and reliability are maintained
- ✅ **Documentation Completeness**: All schema changes are fully documented

---

## 📚 **CRITICAL CHANGE-SPECIFIC REQUIRED READING**

**In addition to general template required reading, review:**

4. **Database architecture documentation** - Understand current schema structure
5. **Data migration procedures** - Study existing migration patterns
6. **API contracts and data relationships** - Understand current data dependencies
7. **Rollback and recovery procedures** - Know how to undo schema changes if needed

---

## 💡 **CRITICAL CHANGE BEST PRACTICES**

- **Plan Thoroughly**: Understand every aspect of database schema before starting
- **Test Everything**: Test each schema change multiple times with real data
- **Have Backup Plans**: Always know how to undo schema changes if problems occur
- **Monitor Closely**: Watch for any data integrity issues during migration
- **Document Everything**: Record every schema change and migration step
- **Communicate Clearly**: Keep team informed of database update progress
- **Expect Problems**: Plan for data issues and have recovery procedures ready
- **Stay Calm**: Critical database changes require patience and careful attention

---

**📋 Status**: SAMPLE - Critical Changes Template Example  
**🚨 Risk Level**: HIGH - Core database structure modification  
**👥 Audience**: AI Agents learning template usage  
**🎯 Purpose**: Demonstrate CRITICAL CHANGES template completion
