# 🚨 Section C: Critical Changes

**Use this section when making high-risk changes that affect core MedFlow functionality.**

> **💡 This section extends the general template. Complete the general template first, then add these critical change-specific guidelines.**

---

## 🚨 **CRITICAL CHANGE SPECIFICS**

**Change Impact**: [What parts of the system are affected]
**Dependencies**: [What other systems depend on this]
**Rollback Plan**: [How to undo if problems occur]
**Testing Strategy**: [How to test safely]

**Additional Safety**: Never deploy without comprehensive testing
**Additional Context**: This affects core system functionality

---

## 🔧 **ADDITIONAL IMPLEMENTATION GUIDELINES**

✅ **What you CAN do**:
- Make the specific required changes
- Test thoroughly at each step
- Implement rollback mechanisms
- Document all changes carefully
- Follow incremental testing approach
- Maintain data integrity throughout

❌ **What you CANNOT do**:
- Make changes without testing
- Ignore dependency impacts
- Skip verification steps
- Deploy without rollback plan
- Rush through critical changes
- Ignore potential risks

---

## 📋 **CRITICAL CHANGE-SPECIFIC EXECUTION STEPS**

**After completing general template execution steps, add these critical change-specific actions:**

5. **System Analysis**: Completely understand current system state and architecture
6. **Dependency Mapping**: Identify all components and systems that will be affected
7. **Test Environment Setup**: Create safe, isolated testing environment
8. **Incremental Implementation**: Make changes in small, testable, reversible steps
9. **Comprehensive Validation**: Test each change thoroughly with multiple scenarios
10. **Rollback Verification**: Ensure all rollback mechanisms are functional and tested
11. **Final System Validation**: Confirm all functionality works correctly after changes

---

## 🎯 **CRITICAL CHANGE-SPECIFIC SUCCESS CRITERIA**

**In addition to general template success criteria, ensure:**

- ✅ **Change Validation**: All critical changes work exactly as expected
- ✅ **System Integrity**: No existing functionality is broken or compromised
- ✅ **Rollback Readiness**: All rollback mechanisms are functional and tested
- ✅ **Test Completion**: All comprehensive tests pass successfully
- ✅ **Data Safety**: Data integrity is preserved throughout the process
- ✅ **System Stability**: Overall system stability and performance are maintained
- ✅ **Documentation Completeness**: All changes are fully documented

---

## 📚 **ADDITIONAL REQUIRED READING**

4. **System architecture documentation**
5. **Dependency mapping and relationships**
6. **Testing and deployment procedures**
7. **Rollback and recovery procedures**

---

## 💡 **CRITICAL CHANGE BEST PRACTICES**

- **Plan Thoroughly**: Understand every aspect before starting
- **Test Everything**: Test each change multiple times
- **Have Backup Plans**: Always know how to undo changes
- **Monitor Closely**: Watch for any unexpected behavior
- **Document Everything**: Record every change and decision
- **Communicate Clearly**: Keep team informed of progress
- **Expect Problems**: Plan for things to go wrong
- **Stay Calm**: Critical changes require patience and care
