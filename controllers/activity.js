const UserModel = require("../models/store_admin");
const storeAssistantModel = require("../models/storeAssistant");
const Activity = require("../models/activity");
const { body } = require("express-validator/check");
const Customer = require("../models/customer");
const { errorHandler } = require("./login_controler");
const { customerService, storeService } = require("../services");

exports.retrieve = async (req, res) => {
  try {
    const identifier = req.user.phone_number;
    let activity;
    activity = await Activity.find({
      creator_ref: req.user._id,
    }).sort({ createdAt: 1 });
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "No activity",
        error: {
          statusCode: 404,
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Activity retrieved successfully.",
        data: activity,
      });
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

exports.retrieveWeb = async (req, res) => {
  try {
    let data;
    if (req.user.user_role === "super_admin") {
      data = await Activity.find({}).sort({ createdAt: -1 });
    } else {
      data = await Activity.find({
        creator_ref: req.user._id,
      }).sort({ createdAt: -1 });
    }

    data = await data.reduce(async (acc, activity) => {
      acc = await acc;
      activity = activity.toObject();
      let creator_ref = await storeAssistantModel
        .findOne({ _id: activity.creator_ref })
        .populate({ path: "store_admin_ref" })
        .exec();
      let type = 1;
      if (!creator_ref) {
        type = 2;
        creator_ref = await UserModel.findOne({ _id: activity.creator_ref });
        if (!creator_ref) return acc;
      }
      creator_ref = creator_ref.toObject();
      if (type === 1) {
        creator_ref = {
          ...creator_ref.store_admin_ref,
          local: {
            ...creator_ref,
          },
          ...creator_ref,
        };
      }
      return [...acc, { ...activity, creator_ref }];
    }, []);

    res.status(200).json({
      success: true,
      message: "Activity retrieved successfully",
      data,
    });
  } catch (error) {
    errorHandler(error, res);
  }
};
