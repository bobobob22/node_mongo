const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Form = require("../models/form");
const AddedForm = require("../models/addedForm");
const Solution = require("../models/solution");

module.exports = {
  createUser: async function ({ userInput }, req) {
    //   const email = args.userInput.email;
    const errors = [];

    if (!userInput.name || userInput.name.length < 3) {
      errors.push({ message: "You should add a valid name" });
    }

    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "E-Mail is invalid." });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Password is too short!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("User exists already!");
      throw error;
    }
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw,
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async function ({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found.");
      error.code = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Password is incorrect.");
      error.code = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "somesupersecretsecret",
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString() };
  },

  createForm: async function ({ formInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }

    const errors = [];
    if (
      validator.isEmpty(formInput.title) ||
      !validator.isLength(formInput.title, { min: 3 })
    ) {
      errors.push({ message: "Title is invalid." });
    }
    if (
      validator.isEmpty(formInput.content) ||
      !validator.isLength(formInput.content, { min: 3 })
    ) {
      errors.push({ message: "Content is invalid." });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("Invalid user.");
      error.code = 401;
      throw error;
    }

    const form = new Form({
      title: formInput.title,
      content: formInput.content,
      questions: formInput.questions,
      formType: formInput.formType,
      creator: user,
    });

    const createdForm = await form.save();
    user.forms.push(createdForm);
    await user.save();
    return {
      ...createdForm._doc,
      _id: createdForm._id.toString(),
      createdAt: createdForm.createdAt.toISOString(),
      updatedAt: createdForm.updatedAt.toISOString(),
    };
  },

  saveForm: async function ({ formInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated you cant save a form!");
      error.code = 401;
      throw error;
    }

    const errors = [];
    if (
      validator.isEmpty(formInput.title) ||
      !validator.isLength(formInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid." });
    }
    if (
      validator.isEmpty(formInput.content) ||
      !validator.isLength(formInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid." });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const addedForm = new AddedForm({
      title: formInput.title,
      content: formInput.content,
      questions: formInput.questions,
      formType: formInput.formType,
      parentId: formInput.parentId,
    });

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("Invalid user.");
      error.code = 401;
      throw error;
    }

    const createdForm = await addedForm.save();
    if (!user.addedForms.includes(formInput.parentId)) {
      user.addedForms.push(formInput.parentId);
    }
    await user.save();

    return {
      ...createdForm._doc,
      _id: createdForm._id.toString(),
      createdAt: createdForm.createdAt.toISOString(),
      updatedAt: createdForm.updatedAt.toISOString(),
    };
  },

  addedForms: async function ({ page, name }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    if (!page) {
      page = 1;
    }
    const totalForms = await AddedForm.find().countDocuments();

    let forms;
    if (name) {
      forms = await AddedForm.find({
        title: name,
      });
    } else {
      forms = await AddedForm.find();
    }
    // .sort({ createdAt: -1 })
    // .skip((page - 1) * perPage)
    // .limit(perPage)
    // .populate('creator');

    return {
      forms: forms.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalForms: totalForms,
    };
  },

  addedForm: async function ({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const form = await AddedForm.findById(id);
    if (!form) {
      const error = new Error("No form found!");
      error.code = 404;
      throw error;
    }
    return {
      ...form._doc,
      _id: form._id.toString(),
      createdAt: form.createdAt.toISOString(),
      updatedAt: form.updatedAt.toISOString(),
    };
  },

  availableForms: async function ({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    if (!page) {
      page = 1;
    }

    const totalForms = await Form.find().countDocuments();
    const user = await User.findById(req.userId);
    const userAddedForms = await user.addedForms;

    const forms = await Form.find({ _id: { $nin: [...userAddedForms] } });

    return {
      forms: forms.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
        };
      }),
      totalForms: totalForms,
    };
  },

  forms: async function ({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    if (!page) {
      page = 1;
    }
    const perPage = 2;
    const totalForms = await Form.find().countDocuments();
    const forms = await Form.find()
      // .sort({ createdAt: -1 })
      // .skip((page - 1) * perPage)
      // .limit(perPage)
      .populate("creator");
    return {
      forms: forms.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalForms: totalForms,
    };
  },

  form: async function ({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const form = await Form.findById(id).populate("creator");
    if (!form) {
      const error = new Error("No form found!");
      error.code = 404;
      throw error;
    }
    return {
      ...form._doc,
      _id: form._id.toString(),
      createdAt: form.createdAt.toISOString(),
      updatedAt: form.updatedAt.toISOString(),
    };
  },

  updateForm: async function ({ id, formInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const form = await Form.findById(id).populate("creator");
    if (!form) {
      const error = new Error("No forms found!");
      error.code = 404;
      throw error;
    }
    // if (form.creator._id.toString() !== req.userId.toString()) {
    //   const error = new Error('Not authorized!');
    //   error.code = 403;
    //   throw error;
    // }
    const errors = [];
    if (
      validator.isEmpty(formInput.title) ||
      !validator.isLength(formInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid." });
    }
    if (
      validator.isEmpty(formInput.content) ||
      !validator.isLength(formInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid." });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    form.title = formInput.title;
    form.content = formInput.content;
    form.questions = formInput.questions;

    const updatedForm = await form.save();
    return {
      ...updatedForm._doc,
      _id: updatedForm._id.toString(),
      createdAt: updatedForm.createdAt.toISOString(),
      updatedAt: updatedForm.updatedAt.toISOString(),
    };
  },

  deleteForm: async function ({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const form = await Form.findById(id);
    if (!form) {
      const error = new Error("No form found!");
      error.code = 404;
      throw error;
    }
    if (form.creator.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized!");
      error.code = 403;
      throw error;
    }
    await Form.findByIdAndRemove(id);

    const user = await User.findById(req.userId);
    user.forms.pull(id);
    await user.save();
    return true;
  },

  user: async function (args, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;
      throw error;
    }
    return { ...user._doc, _id: user._id.toString() };
  },

  users: async function (args, req) {
    const totalUsers = await User.find().countDocuments();
    const users = await User.find();

    return {
      users: users.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          name: p.name,
          email: p.email,
          status: p.status,
          forms: p.forms,
        };
      }),
      totalUsers: totalUsers,
    };
  },

  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;
      throw error;
    }
    user.status = status;
    await user.save();
    return { ...user._doc, _id: user._id.toString() };
  },

  solve: async function ({ solutionInput }, req) {
    const { name, email, number, solution, surveyId } = solutionInput;

    const solutionModel = new Solution({
      email,
      number,
      name,
      solution,
      surveyId,
    });

    const createdSolution = await solutionModel.save();
    return { ...createdSolution._doc, _id: createdSolution._id.toString() };
  },

  solutions: async function (args, req) {
    const total = await Solution.find().countDocuments();
    const solutions = await Solution.find();

    const { name, email, number, surveyId } = args;

    const byName = (s) => {
      if (name && !s.name.includes(name)) {
        return false;
      }

      return true;
    };

    const byEmail = (s) => {
      if (email && !s.email.includes(email)) {
        return false;
      }

      return true;
    };

    const byNumber = (s) => {
      if (number && !s.number.includes(number)) {
        return false;
      }

      return true;
    };

    const bySurveyId = (s) => {
      console.log(s.surveyId, surveyId, s.surveyId.includes(surveyId));

      if (surveyId && !s.surveyId.includes(surveyId)) {
        return false;
      }

      if (surveyId && s.surveyId.includes(surveyId)) {
        return true;
      }

      return true;
    };

    return {
      entries: solutions
        .filter(bySurveyId)
        .filter(byName)
        .filter(byEmail)
        .filter(byNumber)
        .map((p) => {
          console.log(p);
          return {
            _id: p._id.toString(),
            name: p.name,
            email: p.email,
            number: p.number,
            solution: p.solution,
            surveyId: p.surveyId,
          };
        }),
      total,
    };
  },
};
