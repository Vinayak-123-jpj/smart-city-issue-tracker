// AI Service for Smart City Tracker
// Handles all AI-powered features using Claude API

const AI_API_URL = "https://api.anthropic.com/v1/messages";
const AI_MODEL = "claude-sonnet-4-20250514";

/**
 * Check for duplicate issues
 */
export const checkDuplicates = async (title, description, location, existingIssues) => {
  try {
    // Only check against recent and pending/in-progress issues
    const relevantIssues = existingIssues
      .filter(issue => issue.status !== 'Resolved')
      .slice(0, 20); // Check against last 20 issues

    if (relevantIssues.length === 0) {
      return { isDuplicate: false, matchedIssueId: null, confidence: 0, reason: '' };
    }

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Analyze if this new issue is a duplicate of any existing issues.

NEW ISSUE:
Title: ${title}
Description: ${description}
Location: ${location || 'Not specified'}

EXISTING ISSUES:
${relevantIssues.map((issue, i) => `
${i + 1}. ID: ${issue._id}
   Title: ${issue.title}
   Description: ${issue.description}
   Location: ${issue.location || 'Not specified'}
   Status: ${issue.status}
`).join('\n')}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "isDuplicate": true or false,
  "matchedIssueId": "issue id or null",
  "confidence": number from 0-100,
  "reason": "brief explanation"
}`
        }]
      })
    });

    const data = await response.json();
    const jsonText = data.content[0].text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Duplicate check error:', error);
    return { isDuplicate: false, matchedIssueId: null, confidence: 0, reason: 'Error checking duplicates' };
  }
};

/**
 * Get smart suggestions for description
 */
export const improveDescription = async (currentText, title, category) => {
  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are helping a citizen write a better civic issue report.

Title: ${title}
Category: ${category}
Current Description: ${currentText}

Improve this description to be:
- Clear and specific
- Include relevant details (what, where, when, impact)
- Professional but concise (3-5 sentences)
- Actionable for authorities

Return ONLY the improved description text, nothing else.`
        }]
      })
    });

    const data = await response.json();
    return data.content[0].text.trim();
  } catch (error) {
    console.error('Description improvement error:', error);
    return currentText;
  }
};

/**
 * Analyze issue sentiment and priority
 */
export const analyzeIssuePriority = async (title, description, upvoteCount = 0, category) => {
  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Analyze this civic issue for priority and sentiment:

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
}`
        }]
      })
    });

    const data = await response.json();
    const jsonText = data.content[0].text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Priority analysis error:', error);
    return {
      urgencyScore: 5,
      sentiment: 'neutral',
      priority: 'medium',
      suggestedAction: 'Review and assign to appropriate team',
      estimatedImpact: 'Unknown'
    };
  }
};

/**
 * Get smart title suggestions
 */
export const suggestTitle = async (partialTitle, category) => {
  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Generate 3 clear, concise issue titles for a ${category} problem based on: "${partialTitle}"

Requirements:
- Each title should be 5-10 words
- Clear and specific
- Action-oriented

Return ONLY a JSON array of 3 strings (no markdown, no backticks):
["title 1", "title 2", "title 3"]`
        }]
      })
    });

    const data = await response.json();
    const jsonText = data.content[0].text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Title suggestion error:', error);
    return [];
  }
};