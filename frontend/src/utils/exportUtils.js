import * as XLSX from "xlsx";

/**
 * Export analytics data to Excel file
 * @param {Object} data - Analytics data to export
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToExcel = (data, filename = "civic_issues_report") => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary Statistics
    const summaryData = [
      ["Smart City Tracker - Analytics Report"],
      ["Generated on:", new Date().toLocaleString()],
      [""],
      ["SUMMARY STATISTICS"],
      ["Metric", "Value"],
      ["Total Issues", data.stats.total],
      ["Pending Issues", data.stats.pending],
      ["In Progress Issues", data.stats.inProgress],
      ["Resolved Issues", data.stats.resolved],
      ["Critical Priority", data.stats.critical],
      ["High Priority", data.stats.highPriority],
      ["Average Resolution Time (days)", data.stats.avgResolutionTime],
      ["Citizen Satisfaction (%)", data.stats.citizenSatisfaction],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths
    summarySheet["!cols"] = [{ wch: 30 }, { wch: 15 }];

    // Add styling to header
    if (!summarySheet["!merges"]) summarySheet["!merges"] = [];
    summarySheet["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Sheet 2: Issues Details
    const issuesData = [
      ["ISSUES DETAILS"],
      [
        "Title",
        "Category",
        "Status",
        "Location",
        "Upvotes",
        "Reported By",
        "Created Date",
        "Description",
      ],
    ];

    data.issues.forEach((issue) => {
      issuesData.push([
        issue.title,
        issue.category,
        issue.status,
        issue.location || "N/A",
        issue.upvoteCount || 0,
        issue.reportedBy?.name || "Anonymous",
        new Date(issue.createdAt).toLocaleDateString(),
        issue.description,
      ]);
    });

    const issuesSheet = XLSX.utils.aoa_to_sheet(issuesData);
    issuesSheet["!cols"] = [
      { wch: 30 }, // Title
      { wch: 15 }, // Category
      { wch: 12 }, // Status
      { wch: 25 }, // Location
      { wch: 10 }, // Upvotes
      { wch: 20 }, // Reported By
      { wch: 15 }, // Created Date
      { wch: 50 }, // Description
    ];

    XLSX.utils.book_append_sheet(workbook, issuesSheet, "All Issues");

    // Sheet 3: Category Breakdown
    const categoryData = [
      ["CATEGORY BREAKDOWN"],
      ["Category", "Count", "Percentage"],
    ];

    Object.entries(data.categoryBreakdown || {}).forEach(
      ([category, count]) => {
        const percentage = ((count / data.stats.total) * 100).toFixed(1);
        categoryData.push([category, count, percentage + "%"]);
      },
    );

    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    categorySheet["!cols"] = [{ wch: 20 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, categorySheet, "Category Analysis");

    // Sheet 4: Status Distribution
    const statusData = [
      ["STATUS DISTRIBUTION"],
      ["Status", "Count", "Percentage"],
      [
        "Pending",
        data.stats.pending,
        ((data.stats.pending / data.stats.total) * 100).toFixed(1) + "%",
      ],
      [
        "In Progress",
        data.stats.inProgress,
        ((data.stats.inProgress / data.stats.total) * 100).toFixed(1) + "%",
      ],
      [
        "Resolved",
        data.stats.resolved,
        ((data.stats.resolved / data.stats.total) * 100).toFixed(1) + "%",
      ],
    ];

    const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
    statusSheet["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, statusSheet, "Status Analysis");

    // Sheet 5: Priority Distribution (if available)
    if (data.priorityDistribution) {
      const priorityData = [
        ["PRIORITY DISTRIBUTION"],
        ["Priority Level", "Count", "Percentage"],
      ];

      Object.entries(data.priorityDistribution).forEach(([priority, count]) => {
        const percentage = ((count / data.stats.total) * 100).toFixed(1);
        priorityData.push([
          priority.charAt(0).toUpperCase() + priority.slice(1),
          count,
          percentage + "%",
        ]);
      });

      const prioritySheet = XLSX.utils.aoa_to_sheet(priorityData);
      prioritySheet["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(
        workbook,
        prioritySheet,
        "Priority Analysis",
      );
    }

    // Sheet 6: Trend Data (if available)
    if (data.trendData && data.trendData.length > 0) {
      const trendDataSheet = [
        ["30-DAY TREND DATA"],
        ["Date", "Issues Reported", "Issues Resolved"],
      ];

      data.trendData.forEach((day) => {
        trendDataSheet.push([day.date, day.reported, day.resolved]);
      });

      const trendSheet = XLSX.utils.aoa_to_sheet(trendDataSheet);
      trendSheet["!cols"] = [{ wch: 15 }, { wch: 18 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(workbook, trendSheet, "Trend Data");
    }

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().split("T")[0];
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    // Write the file
    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      filename: finalFilename,
    };
  } catch (error) {
    console.error("Export error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Export to CSV (simpler alternative)
 */
export const exportToCSV = (data, filename = "civic_issues_report") => {
  try {
    // Create CSV content
    let csvContent = "Smart City Tracker - Issues Report\n";
    csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

    // Add summary
    csvContent += "SUMMARY STATISTICS\n";
    csvContent += `Total Issues,${data.stats.total}\n`;
    csvContent += `Pending,${data.stats.pending}\n`;
    csvContent += `In Progress,${data.stats.inProgress}\n`;
    csvContent += `Resolved,${data.stats.resolved}\n\n`;

    // Add issues details
    csvContent += "ISSUES DETAILS\n";
    csvContent +=
      "Title,Category,Status,Location,Upvotes,Reported By,Created Date,Description\n";

    data.issues.forEach((issue) => {
      const row = [
        `"${issue.title.replace(/"/g, '""')}"`,
        issue.category,
        issue.status,
        `"${(issue.location || "N/A").replace(/"/g, '""')}"`,
        issue.upvoteCount || 0,
        issue.reportedBy?.name || "Anonymous",
        new Date(issue.createdAt).toLocaleDateString(),
        `"${issue.description.replace(/"/g, '""')}"`,
      ];
      csvContent += row.join(",") + "\n";
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().split("T")[0];
    const finalFilename = `${filename}_${timestamp}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", finalFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      filename: finalFilename,
    };
  } catch (error) {
    console.error("CSV export error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
