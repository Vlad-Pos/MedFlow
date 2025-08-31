# MedFlow

## 🚨 CRITICAL: BRANCH MANAGEMENT DOCUMENTATION

**⚠️ IMPORTANT: Before working with this repository, READ THE BRANCH MANAGEMENT DOCUMENTATION!**

This repository has a complex branch structure that requires careful management to avoid breaking the application.

### **📚 Required Reading (In Order):**

1. **[`BRANCH_MERGE_QUICK_REFERENCE.md`](BRANCH_MERGE_QUICK_REFERENCE.md)** - Quick overview for AI agents
2. **[`BRANCH_MANAGEMENT_SUMMARY.md`](BRANCH_MANAGEMENT_SUMMARY.md)** - Complete overview and workflow
3. **[`BRANCH_MERGE_ANALYSIS_AND_STRATEGY.md`](BRANCH_MERGE_ANALYSIS_AND_STRATEGY.md)** - Detailed analysis and implementation guide

### **🚫 CRITICAL WARNING:**

**NEVER merge `fix/blank-screen` directly to `main` - This will break the application completely!**

The `fix/blank-screen` branch represents a **COMPLETE PLATFORM TRANSFORMATION** (155x code increase) that requires incremental integration.

---

## 🏗️ Repository Structure

### **Current Branches:**
- **`main`** - Production-ready simple React app (~20 files, ~1,000 lines)
- **`fix/blank-screen`** - Enterprise platform development (791 files, 155K+ lines)
- **`backup/*`** - Historical and functional backups

### **Branch Status:**
- **Main:** ✅ Stable, production-ready
- **Fix/Blank-Screen:** ⚠️ Feature complete, untested in production
- **Risk Level:** EXTREMELY HIGH for direct merge

---

## 🎯 Quick Start for AI Agents

1. **Read the documentation** - Start with `BRANCH_MERGE_QUICK_REFERENCE.md`
2. **Understand the branches** - Know what each branch contains
3. **Follow safe practices** - Use incremental integration only
4. **Test everything** - Never skip testing
5. **Document changes** - Keep documentation updated

---

## 📋 Development Workflow

### **For New Features:**
- Work in `fix/blank-screen` branch
- Create feature branches as needed
- Test thoroughly before merging

### **For Production Updates:**
- Follow incremental integration plan
- Use staging environment
- Implement feature flags
- Monitor performance

### **For Emergency Fixes:**
- Create hotfix from `main`
- Minimal changes only
- Test thoroughly
- Merge to both branches

---

## 🔧 Technical Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Firebase (Firestore, Auth, Storage)
- **UI:** Custom component library + Tailwind CSS
- **Testing:** Jest + React Testing Library
- **Deployment:** Firebase Hosting

---

## 📞 Support

- **Documentation:** See branch management docs above
- **Issues:** Create detailed issue reports
- **Questions:** Review documentation first

---

## ⚠️ Final Reminder

**This is a COMPLETE PLATFORM TRANSFORMATION, not a simple update!**

Success requires:
- Careful planning
- Incremental implementation  
- Extensive testing
- Continuous monitoring
- Clear communication

**When in doubt, READ THE DOCUMENTATION FIRST!**

---

*Last Updated: 2025-01-01*  
*Status: ACTIVE - CRITICAL DECISION REQUIRED*