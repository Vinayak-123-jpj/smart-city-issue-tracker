// AI Service for Smart City Tracker
// Handles all AI-powered features through backend API

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Check for duplicate issues
 */
export const checkDuplicates = async (
  title,
  description,
  location,
  existingIssues,
) => {
  try {
    const relevantIssues = existingIssues
      .filter((issue) => issue.status !== "Resolved")
      .slice(0, 20);

    if (relevantIssues.length === 0) {
      return {
        isDuplicate: false,
        matchedIssueId: null,
        confidence: 0,
        reason: "No existing issues to compare",
      };
    }

    const response = await fetch(`${API_URL}/ai/check-duplicates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        title,
        description,
        location,
        existingIssues: relevantIssues,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to check for duplicates");
    }

    return await response.json();
  } catch (error) {
    console.error("Duplicate check error:", error);
    throw error;
  }
};

/**
 * Get smart suggestions for description
 */
export const improveDescription = async (currentText, title, category) => {
  try {
    const response = await fetch(`${API_URL}/ai/improve-description`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        currentText,
        title,
        category,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to improve description");
    }

    const data = await response.json();
    return data.improvedText;
  } catch (error) {
    console.error("Description improvement error:", error);
    throw error;
  }
};

/**
 * Analyze issue sentiment and priority
 */
export const analyzeIssuePriority = async (
  title,
  description,
  upvoteCount = 0,
  category,
) => {
  try {
    const response = await fetch(`${API_URL}/ai/analyze-priority`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        title,
        description,
        upvoteCount,
        category,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze priority");
    }

    return await response.json();
  } catch (error) {
    console.error("Priority analysis error:", error);
    return {
      urgencyScore: 5,
      sentiment: "neutral",
      priority: "medium",
      suggestedAction: "Review and assign to appropriate team",
      estimatedImpact: "Unknown",
    };
  }
};

/**
 * Get smart title suggestions
 */
export const suggestTitle = async (partialTitle, category) => {
  try {
    const response = await fetch(`${API_URL}/ai/suggest-title`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        partialTitle,
        category,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get title suggestions");
    }

    const data = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error("Title suggestion error:", error);
    return [];
  }
};
