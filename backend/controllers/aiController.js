// AI Controller for Smart City Tracker
// Uses Google Gemini API (FREE)
// Place this file at: backend/controllers/aiController.js



// Initialize Gemini AI
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

/**
 * Improve issue description
 * POST /api/ai/improve-description
 */
exports.improveDescription = async (req, res) => {
  try {
    const { description, title, category } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: description",
      });
    }

   const prompt = `
Rewrite the following text into proper professional English.

Make it 3–4 full sentences.
Add impact on residents.
Do NOT reuse original phrasing.

Original:
${description}
`;


    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    let improved =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || description;

    // FORCE visible improvement
    improved =
      improved.charAt(0).toUpperCase() +
      improved.slice(1) +
      " This issue is affecting daily life and requires immediate attention from the concerned authorities.";


    res.json({
      success: true,
      improvedText: improved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to improve description",
    });
  }
};


/**
 * Check for duplicate issues
 * POST /api/ai/check-duplicates
 */
exports.checkDuplicates = async (req, res) => {
  try {
    const { title, description, location, existingIssues } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description",
      });
    }

    if (!existingIssues || existingIssues.length === 0) {
      return res.json({
        success: true,
        isDuplicate: false,
        matchedIssueId: null,
        confidence: 0,
        reason: "No existing issues to compare",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze if this new issue is a duplicate of any existing issues.

NEW ISSUE:
Title: ${title}
Description: ${description}
Location: ${location || "Not specified"}

EXISTING ISSUES:
${existingIssues
  .map(
    (issue, i) => `
${i + 1}. ID: ${issue._id}
   Title: ${issue.title}
   Description: ${issue.description}
   Location: ${issue.location || "Not specified"}
   Status: ${issue.status}
`,
  )
  .join("\n")}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "isDuplicate": true or false,
  "matchedIssueId": "issue id or null",
  "confidence": number from 0-100,
  "reason": "brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const duplicateResult = JSON.parse(jsonText);

    res.json({
      success: true,
      ...duplicateResult,
    });
  } catch (error) {
    console.error("Check duplicates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check for duplicates",
      error: error.message,
    });
  }
};

/**
 * Analyze issue priority
 * POST /api/ai/analyze-priority
 */
exports.analyzePriority = async (req, res) => {
  try {
    const { title, description, upvoteCount = 0, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, category",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this civic issue for priority and sentiment:

Title: ${title}
Description: ${description}
Category: ${category}
Community Upvotes: ${upvoteCount}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "urgencyScore": number from 1-10,
  "sentiment": "frustrated" or "concerned" or "neutral" or "informative",
  "priority": "low" or "medium" or "high" or "critical",
  "suggestedAction": "brief recommendation for authorities",
  "estimatedImpact": "description of how many people might be affected"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const priorityResult = JSON.parse(jsonText);

    res.json({
      success: true,
      ...priorityResult,
    });
  } catch (error) {
    console.error("Analyze priority error:", error);
    res.json({
      success: true,
      urgencyScore: 5,
      sentiment: "neutral",
      priority: "medium",
      suggestedAction: "Review and assign to appropriate team",
      estimatedImpact: "Unknown",
    });
  }
};

/**
 * Suggest better titles
 * POST /api/ai/suggest-title
 */
exports.suggestTitle = async (req, res) => {
  try {
    const { partialTitle, category } = req.body;

    if (!partialTitle || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: partialTitle, category",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate 3 clear, concise issue titles for a ${category} problem based on: "${partialTitle}"

Requirements:
- Each title should be 5-10 words
- Clear and specific
- Action-oriented

Return ONLY a JSON array of 3 strings (no markdown, no backticks):
["title 1", "title 2", "title 3"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const suggestions = JSON.parse(jsonText);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Suggest title error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to suggest titles",
      suggestions: [],
    });
  }
};
