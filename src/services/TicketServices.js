import AdminModel from "../models/AdminModel.js";
import TicketModel from "../models/TicketModel.js";
import { calculatePagination } from "./../utils/PaginationUtility.js";

export const createTicketByUserService = async (req, next) => {
  try {
    const { title, description } = req.body;
    const { id, name, role } = req.headers.id;
    const query = {
      title,
      description,
      userID: id,
      createdBy: {
        userId: id,
        name: name,
        role: role,
      },
    };
    const data = await TicketModel.create(query);
    if (!data) {
      return { status: "fail", message: "Failed to create new ticket" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const getUserTicketService = async (req, next) => {
  try {
    const ticketID = req.params.id;
    //If ticket id is passed inside parameter it will return the specific ticket else it will return all the ticket of this user
    if (ticketID) {
      const data = await TicketModel.find({
        _id: ticketID,
        userID: req.headers.id,
      });
      return { status: "success", data: data };
    }
    const data = await TicketModel.find({ userID: req.headers.id })
      .populate("assignments.assignedTo", "name role")
      .populate("assignments.assignedBy", "name role")
      .populate("userID", "name role");

    if (!data) {
      return { status: "fail", message: "Ticket or user not found" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const commentByUserService = async (req, next) => {
  try {
    const ticketID = req.params.id;
    const { id, name, role } = req.headers;
    const newComment = {
      userId: id,
      name: name,
      role: role,
      comment: req.body.comment,
    };
    const data = await TicketModel.findOneAndUpdate(
      { _id: ticketID, userID: req.headers.id },
      { $push: { comments: newComment } },
      { new: true }
    );

    if (!data) {
      return { status: "fail", message: "Ticket or user not found" };
    }
    return {
      status: "success",
      message: "A new comment added to the ticket",
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

//_____Admin_____//
export const createTicketByAdminService = async (req, next) => {
  try {
    const { userId } = req.params;
    const { title, description } = req.body;
    const { id, name, role } = req.headers;
    const query = {
      userID: userId,
      title,
      description,
      createdBy: {
        userId: id,
        name: name,
        role: role,
      },
    };
    const data = await TicketModel.create(query);
    if (!data) {
      return { status: "fail", message: "Failed to create new ticket" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};
export const getAllTicketService = async (req, next) => {
  try {
    let query = {};
    const { status, priority, id, page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({ page, limit, sortBy, sortOrder });

    if (id) query.id = id;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const totalCount = await TicketModel.countDocuments(query);

    const data = await TicketModel.find(query)
      .sort({
        [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1,
      })
      .limit(pagination.limit)
      .skip(pagination.skip)
      .populate("assignments.assignedTo", "name role")
      .populate("assignments.assignedBy", "name role")
      .populate("userID", "name role");

    if (!data) {
      return { status: "fail", message: "Failed to load ticket" };
    }
    return {
      status: "success",
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPage: Math.ceil(totalCount / pagination.limit),
      },
      data: data,
    };
  } catch (error) {
    next(error);
  }
};
export const commentByAdminService = async (req, next) => {
  try {
    const ticketID = req.params.id;
    const { id, name, role } = req.headers;

    if (!req.body.comment) {
      return { status: "fail", message: "Comment not found" };
    }

    const newComment = {
      comment: req.body.comment,
      userId: id,
      name: name,
      role: role,
    };

    // Initial query to update the comment
    let updateQuery = {
      $push: { comments: newComment },
    };

    // Check if the role is Admin or SuperAdmin
    if (role === "Admin" || role === "SuperAdmin") {
      // Fetch the ticket to check if assigned fields are already present
      const ticket = await TicketModel.findById(ticketID);

      if (ticket) {
        // If the assignments array is empty, initialize it with the new assignment
        if (ticket.assignments.length === 0) {
          updateQuery.$push.assignments = {
            assignedTo: id,
            assignedBy: id,
          };
          updateQuery.$set = {
            status: "In-Progress",
          };
        } else {
          // If assignments already exist, only update the status
          updateQuery.$set = {
            status: "In-Progress",
          };
        }
      } else {
        return { status: "fail", message: "Ticket not found" };
      }
    }

    // Update ticket
    const data = await TicketModel.findOneAndUpdate(
      { _id: ticketID },
      updateQuery,
      { new: true }
    );

    if (!data) {
      return { status: "fail", message: "Ticket or user not found" };
    }

    return {
      status: "success",
      message: "A new comment added to the ticket",
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatusandPriorityService = async (req, next) => {
  try {
    let query = {};
    const ticketId = req.params.id;
    const { status, priority } = req.query;

    if (status) {
      query.status = status;

      if (status === "Solved" || status === "Closed") {
        query.resolvedAt = new Date();
      }
    }

    if (priority) {
      query.priority = priority;
    }
    const update = await TicketModel.findOneAndUpdate(
      { _id: ticketId },
      { $set: query },
      { runValidators: true, new: true }
    );
    if (!update) {
      return { status: "fail", message: "Failed to update ticket" };
    }
    return { status: "success", data: update };
  } catch (error) {
    next(error);
  }
};

export const assignNewAdminToTicketService = async (req, next) => {
  try {
    const ticketId = req.params.id;
    const { adminId } = req.body;
    const admin = await AdminModel.findById(adminId);
    if (admin) {
      const newAssignment = {
        assignedTo: adminId,
        assignedBy: req.headers.id,
      };

      const result = await TicketModel.findOneAndUpdate(
        { _id: ticketId },
        { $push: { assignments: newAssignment } },
        { new: true }
      );
      if (!result) {
        return { status: "fail", message: "Failed to assign another admin" };
      }
      return { status: "success", data: result };
    }
    return { status: "fail", message: "Failed to assign another admin" };
  } catch (error) {
    next(error);
  }
};
