# 🎯 Task System Quick Reference

**Quick guide to using the MedFlow Simple Smart Task System**

This document provides a quick overview of how to use the task system for AI agent assessment and system maintenance.

---

## 🚀 **How to Use the Task System**

### **For New AI Agents**
1. **Use the enhanced prompt template** with current task details
2. **Agent reads MAIN_GUIDE.md** completely first
3. **Agent executes assigned task** from TASKS directory
4. **Agent provides comprehensive output** for assessment
5. **You evaluate** comprehension and maintenance value

### **For Weekly Updates**
1. **Check CURRENT_TASK.md** for new assignment
2. **Customize prompt template** with new task details
3. **Update source file** reference
4. **Deploy to agents** as needed

---

## 📋 **Available Tasks**

### **Task 1: Brand Consistency Audit**
- **Purpose**: Brand compliance and visual integrity
- **Source**: `BRAND_CONSISTENCY_AUDIT.md`
- **Frequency**: Weekly rotation
- **Priority**: HIGH - Critical for brand identity

### **Task 2: Performance Optimization Analysis**
- **Purpose**: Performance standards and optimization
- **Source**: `PERFORMANCE_ANALYSIS.md`
- **Frequency**: Monthly rotation
- **Priority**: MEDIUM - When performance issues detected

### **Task 3: Accessibility Compliance Review**
- **Purpose**: WCAG compliance and inclusive design
- **Source**: `ACCESSIBILITY_AUDIT.md`
- **Frequency**: Quarterly rotation
- **Priority**: MEDIUM - When accessibility issues reported

### **Task 4: Security & GDPR Audit**
- **Purpose**: Security verification and compliance
- **Source**: `SECURITY_AUDIT.md`
- **Frequency**: Monthly rotation
- **Priority**: HIGH - When security concerns identified

---

## 🔄 **Task Rotation Schedule**

### **Weekly Rotation**
```
Week 1: Brand Consistency Audit
Week 2: Performance Optimization Analysis
Week 3: Accessibility Compliance Review
Week 4: Security & GDPR Audit
Week 5: Brand Consistency Audit (repeat)
```

### **Priority Override Rules**
- **Brand violations** → Brand Consistency Audit (immediate)
- **Performance issues** → Performance Optimization Analysis (immediate)
- **Security concerns** → Security & GDPR Audit (immediate)
- **Accessibility complaints** → Accessibility Compliance Review (immediate)

---

## 📝 **Your Prompt Template**

### **Basic Version**
```
🤖 AI Agent: Please read MAIN_GUIDE.md before conducting any work. After reading, you will be assigned a specific task from our maintenance system. The task will test your understanding while serving our current system needs.

🎯 ASSIGNED TASK: [Task Name]
📋 Task Details: [Brief description]
 Source File: [TASK_FILE].md
📊 Expected Output: [Output requirements]

🚀 Begin by reading MAIN_GUIDE.md, then execute the assigned task completely.
```

### **Current Week Example**
```
🎯 ASSIGNED TASK: Brand Consistency Audit
📋 Task Details: Comprehensive brand compliance check of the entire codebase
 Source File: BRAND_CONSISTENCY_AUDIT.md
📊 Expected Output: Detailed analysis with violations, fixes, and brand health score
```

---

## 🎯 **Success Metrics**

### **For AI Agent Assessment**
- ✅ **Comprehensive understanding** of MedFlow requirements
- ✅ **Practical application** of knowledge to real problems
- ✅ **Quality output** that meets professional standards
- ✅ **Problem-solving ability** demonstrated through analysis

### **For System Maintenance**
- ✅ **Issues identified** and documented
- ✅ **Actionable recommendations** provided
- ✅ **Quality improvements** implemented
- ✅ **Standards maintained** across all systems

---

## 🚀 **Quick Commands**

### **Check Current Task**
```bash
# View currently assigned task
cat CURRENT_TASK.md
```

### **View Task Library**
```bash
# See all available tasks
cat MAINTENANCE_TASKS.md
```

### **Check Task Selection Logic**
```bash
# Understand task assignment system
cat TASK_SELECTION.md
```

### **View Specific Task Details**
```bash
# See detailed task instructions
cat [TASK_NAME].md
```

---

## 🏆 **Benefits of the System**

### **Simplicity**
- **One template** for all agents
- **Weekly updates** take 5 minutes
- **Clear structure** for agents to follow
- **Easy maintenance** and updates

### **Effectiveness**
- **Dual purpose** - testing + maintenance
- **Consistent quality** across all assessments
- **Adaptable priorities** based on current needs
- **Immediate value** generation

### **Scalability**
- **Easy to add** new task types
- **Simple to modify** priorities
- **Flexible deployment** for different scenarios
- **Low maintenance** overhead

---

## 📋 **Weekly Workflow**

### **Monday**
- Review current system state
- Check for override conditions
- Plan this week's task

### **Tuesday**
- Update CURRENT_TASK.md
- Customize prompt template
- Deploy to new agents

### **Wednesday-Friday**
- Monitor task execution
- Assess agent performance
- Document any issues

### **Weekend**
- Plan next week's task
- Review task effectiveness
- Update rotation schedule

---

**🎯 This task system gives you sophisticated task assignment with minimal complexity. You get smart task selection while maintaining your simple workflow.**

---

**📋 Last Updated**: August 13, 2025  
**📋 Status**: ACTIVE - Task System Quick Reference  
**📋 Purpose**: Quick Guide to Task System Usage  
**📋 Maintenance**: Updated with system changes
