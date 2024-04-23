import AdminModel from "./../models/AdminModel.js";
export const AdminLoginService = async (req) => {
  try {
    let reqBody = req.body;
    const data = await AdminModel.findOne(reqBody);
    if (!data) {
      return { status: "fail", mesasage: "No user found" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};

