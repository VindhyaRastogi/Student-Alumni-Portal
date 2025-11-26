const Report = require("../models/Report");
const User = require("../models/User");

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, reporterId, reason, description } = req.body || {};
    // prefer authenticated user if present
    const authReporter = req.user && req.user.id ? req.user.id : null;
    const rId = reporterId || authReporter || null;

    if (!reportedUserId || !reason) {
      return res
        .status(400)
        .json({ message: "reportedUserId and reason are required" });
    }

    const report = await Report.create({
      reportedUserId,
      reporterId: rId,
      reason,
      description,
    });

    // Notify admins: simple server-side notification via console and optional email hook
    try {
      const admins = await User.find({ role: "admin" }).select(
        "email fullName"
      );
      admins.forEach((a) => {
        // For now, log — you can hook in email/SMS providers here
        console.log(
          `New report submitted: reporter=${rId} reported=${reportedUserId} reason=${reason} -> notify ${
            a.email || a.fullName
          }`
        );
      });
    } catch (notifErr) {
      console.warn(
        "Failed to query admins for notification:",
        notifErr && notifErr.message
      );
    }

    res.status(201).json({ message: "Report submitted", report });
  } catch (err) {
    console.error("createReport error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: list reports
exports.listReports = async (req, res) => {
  try {
    // Support filters via query params: reporterRole, reportedRole, category, status
    // Support sorting: sort=latest|oldest
    // Support pagination: page, limit
    const {
      reporterRole,
      reportedRole,
      category,
      status,
      sort = "latest",
      page = 1,
      limit = 50,
      search,
    } = req.query || {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));

    // Build aggregation to allow filtering by referenced user roles
    const pipeline = [];

    // lookup reporter
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "reporterId",
        foreignField: "_id",
        as: "reporter",
      },
    });
    pipeline.push({
      $unwind: { path: "$reporter", preserveNullAndEmptyArrays: true },
    });

    // lookup reported user (by User._id)
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "reportedUserId",
        foreignField: "_id",
        as: "reported",
      },
    });
    pipeline.push({ $unwind: { path: "$reported", preserveNullAndEmptyArrays: true } });

    // fallback: lookup in Alumni collection in case reportedUserId references an Alumni doc
    pipeline.push({
      $lookup: {
        from: "alumnis",
        localField: "reportedUserId",
        foreignField: "_id",
        as: "reportedAlumni",
      },
    });
    pipeline.push({ $unwind: { path: "$reportedAlumni", preserveNullAndEmptyArrays: true } });

    const match = {};
    if (category) {
      // case-insensitive match for reason/category
      match.reason = { $regex: `^${category}$`, $options: "i" };
    }

    if (status) {
      // accept both friendly names and internal enum values, case-insensitive
      const statusMap = {
        pending: "open",
        reviewed: "in_review",
        rejected: "closed",
      };
      const s = (status || "").toString().toLowerCase();
      const resolved = statusMap[s] || s;
      match.status = { $regex: `^${resolved}$`, $options: "i" };
    }

    if (search) {
      match.$or = [
        { description: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    if (Object.keys(match).length) pipeline.push({ $match: match });

    // filter by reporterRole / reportedRole if provided (BEFORE pagination!)
    if (reporterRole)
      pipeline.push({ $match: { "reporter.role": reporterRole } });
    if (reportedRole)
      pipeline.push({ $match: { "reported.role": reportedRole } });

    // sort BEFORE pagination
    if (sort === "oldest") pipeline.push({ $sort: { createdAt: 1 } });
    else pipeline.push({ $sort: { createdAt: -1 } });

    // pagination (AFTER filtering and sorting)
    pipeline.push({ $skip: (pageNum - 1) * lim });
    pipeline.push({ $limit: lim });

    // prefer reported user object, otherwise use reportedAlumni fields
    pipeline.push({
      $addFields: {
        reportedResolved: {
          $cond: [
            { $ifNull: ["$reported", false] },
            "$reported",
            {
              _id: "$reportedAlumni._id",
              fullName: "$reportedAlumni.fullName",
              email: "$reportedAlumni.email",
              role: "alumni",
            },
          ],
        },
      },
    });

    // project useful fields
    pipeline.push({
      $project: {
        _id: 1,
        reporter: { _id: 1, fullName: 1, email: 1, role: 1 },
        reported: "$reportedResolved",
        reason: 1,
        description: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });

    const results = await Report.aggregate(pipeline);

    // normalize to match previous populate shape
    const reports = results.map((r) => ({
      _id: r._id,
      reporterId: r.reporter || null,
      reportedUserId: r.reported || null,
      reason: r.reason,
      description: r.description,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    // Debug: log first report to check reported user data
    if (reports.length > 0) {
      console.log('DEBUG listReports - first report:', JSON.stringify(reports[0], null, 2));
    }

    res.json(reports);
  } catch (err) {
    console.error("listReports error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!["open", "in_review", "closed"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    const report = await Report.findByIdAndUpdate(
      id,
      { status, handledBy: req.user && req.user.id },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    console.error("updateReportStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: get single report by id
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id)
      .populate("reportedUserId", "fullName email role")
      .populate("reporterId", "fullName email role")
      .lean();
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    console.error("getReportById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: stats (counts for dashboard badge)
exports.getStats = async (req, res) => {
  try {
    const pendingCount = await Report.countDocuments({ status: "open" });
    res.json({ pending: pendingCount });
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
