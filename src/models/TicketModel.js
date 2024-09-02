import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const assignSchema = new mongoose.Schema(
  {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
      index: true,
    },
    createdBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        type: String,
      },
      role: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ["Pending", "In-Progress", "Solved", "Closed"],
      default: "Pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    assignments: [assignSchema],
    comments: [CommentSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const TicketModel = mongoose.model("tickets", ticketSchema);

export default TicketModel;
