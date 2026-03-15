const express = require('express');
const { auth } = require('../middleware/auth');
const Achievement = require('../models/Achievement');
const Student = require('../models/Student');

const router = express.Router();

// Google Gemini API call function
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  const data = await response.json();
  console.log('Gemini API Status:', response.status);
  console.log('Gemini API Response:', JSON.stringify(data));

  if (!response.ok) {
    throw new Error(data.error?.message || 'Gemini API error');
  }

  return data.candidates[0].content.parts[0].text;
};

// Generate AI summary of achievements
router.post('/achievement-summary', auth, async (req, res) => {
  try {
    const { achievementId } = req.body;
    const achievement = await Achievement.findOne({ _id: achievementId, student: req.user._id });
    if (!achievement) return res.status(404).json({ message: 'Achievement not found' });

    const prompt = `Generate a professional 2-3 sentence summary for a student's academic achievement portfolio entry:
    
Title: ${achievement.title}
Category: ${achievement.category}
Level: ${achievement.level}
Organization: ${achievement.organizingBody || 'N/A'}
Position/Result: ${achievement.position || 'Participant'}
Date: ${achievement.startDate?.toDateString() || 'N/A'}
Description: ${achievement.description || 'N/A'}

Write a concise, professional summary suitable for an academic portfolio or resume. Highlight the achievement's significance.`;

    const summary = await callGemini(prompt);

    achievement.aiSummary = summary;
    await achievement.save();

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

// Generate student profile analysis
router.post('/profile-analysis', auth, async (req, res) => {
  try {
    const [student, achievements] = await Promise.all([
      Student.findById(req.user._id).select('-password'),
      Achievement.find({ student: req.user._id })
    ]);

    const categoryCount = {};
    achievements.forEach(a => {
      categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
    });

    const prompt = `Analyze this student's academic profile and achievements, then provide:
1. A brief overall profile assessment (2-3 sentences)
2. Key strengths (3 bullet points)
3. Areas for improvement (2-3 suggestions)
4. Career readiness score out of 10 with brief justification

Student Details:
- Program: ${student.program}, Branch: ${student.branch}
- Current Semester: ${student.currentSemester}
- Admission Category: ${student.admissionCategory}

Achievement Summary:
${Object.entries(categoryCount).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}
Total Achievements: ${achievements.length}

International/National Level achievements: ${achievements.filter(a => ['INTERNATIONAL', 'NATIONAL'].includes(a.level)).length}
Research Publications: ${achievements.filter(a => a.category === 'RESEARCH_PUBLICATION').length}
Internships: ${achievements.filter(a => a.category === 'INTERNSHIP').length}

Provide actionable, encouraging feedback suitable for an academic counselor's report.`;

    const analysis = await callGemini(prompt);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

// Generate resume content from achievements
router.post('/generate-resume-content', auth, async (req, res) => {
  try {
    const [student, achievements] = await Promise.all([
      Student.findById(req.user._id).select('-password'),
      Achievement.find({ student: req.user._id, status: 'APPROVED' })
    ]);

    const prompt = `Generate professional resume content sections based on this student's data:

Student: ${student.firstName} ${student.lastName}
Program: ${student.program} in ${student.branch}
Batch: ${student.batch}

Achievements:
${achievements.map(a => `- ${a.title} (${a.category}, ${a.level}, ${a.position || 'Participant'})`).join('\n')}

Generate:
1. Professional Summary (3-4 sentences)
2. Skills section (based on achievements)
3. Key Projects/Achievements section (formatted for resume)
4. Extracurricular Activities section

Format as clean, professional resume content.`;

    const resumeContent = await callGemini(prompt);
    res.json({ resumeContent });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

// AI-powered achievement recommendations
router.post('/recommendations', auth, async (req, res) => {
  try {
    const [student, achievements] = await Promise.all([
      Student.findById(req.user._id).select('-password'),
      Achievement.find({ student: req.user._id })
    ]);

    const prompt = `Based on this student's profile, recommend 5 specific opportunities they should pursue to enhance their academic profile:

Student Profile:
- Program: ${student.program}, Branch: ${student.branch}
- Semester: ${student.currentSemester} of 8
- Current Achievements: ${achievements.length} total
- Categories covered: ${[...new Set(achievements.map(a => a.category))].join(', ')}

For each recommendation provide:
1. Opportunity name/type
2. Why it's valuable for this student
3. How to get started
4. Expected benefit

Focus on practical, achievable opportunities for an Indian engineering student.`;

    const recommendations = await callGemini(prompt);
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

// Admin AI: Generate accreditation report
router.post('/accreditation-report', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { branch, academicYear } = req.body;
    const filter = {};
    if (branch) filter['student.branch'] = branch;
    if (academicYear) filter.academicYear = academicYear;

    const achievements = await Achievement.find({ status: 'APPROVED', ...(academicYear && { academicYear }) })
      .populate('student', 'branch program');

    const stats = {
      total: achievements.length,
      byCategory: {},
      byLevel: {},
      national: achievements.filter(a => a.level === 'NATIONAL').length,
      international: achievements.filter(a => a.level === 'INTERNATIONAL').length
    };

    achievements.forEach(a => {
      stats.byCategory[a.category] = (stats.byCategory[a.category] || 0) + 1;
      stats.byLevel[a.level] = (stats.byLevel[a.level] || 0) + 1;
    });

    const prompt = `Generate an NAAC accreditation report summary for student achievements:

Academic Year: ${academicYear || 'All Years'}
Total Approved Achievements: ${stats.total}
National Level: ${stats.national}
International Level: ${stats.international}

Category Breakdown:
${Object.entries(stats.byCategory).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Level Distribution:
${Object.entries(stats.byLevel).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Generate a formal accreditation report paragraph (for NAAC/NBA documentation) highlighting student achievement metrics, with appropriate academic language. Include key performance indicators and how they align with accreditation criteria 5.3 (Student Participation and Activities).`;

    const report = await callGemini(prompt);
    res.json({ report, stats });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

module.exports = router;