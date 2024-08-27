import mongoose from "mongoose";

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
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
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        role: {
          type: String,
        },
        name: {
          type: String,
        },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const TicketModel = mongoose.model("tickets", ticketSchema);

export default TicketModel;
