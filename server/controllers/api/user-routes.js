const router = require("express").Router();
const withAuth = require("../../config/auth.config")
// goes to folder / index file, not direct path
const { User } = require("../../models");
const jwt = require("jsonwebtoken");
// for env secret
require("dotenv").config();
// for JWT
const secret = process.env.JWT_SECRET;

// GET ALL users - works
router.get("/", async (req, res) => {
  const allUsers = await User.find({});
  res.json(allUsers);
});

// CREATE new user / set Token
router.post("/", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    const newUserId = newUser.id
    // issue token
    if (!newUser) {
      res.json({ message: "Error creating user" });
    } else {
      // issue token
      const payload = {
        user: {
          _id: newUser._id,
          first_name: newUser.first_name,
        },
      };
      const token = jwt.sign(payload, secret, {
        expiresIn: "1h",
      });
      res.status(200).json({token, newUserId});
    }
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate email error (unique constraint violation)
      res.status(400).json({ message: "Email address is already in use." });
    } else {
      console.error(error);
      res.json({ message: error });
    }
  }
});

// delete user
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findOneAndDelete({ _id: userId });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user." });
  }
});

// Login / Set Token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const userId = user._id;
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // validate password
    const validatePassword = await user.comparePassword(password);

    if (!validatePassword) {
      return res.status(401).json({ message: "Invalid login" });
    } else {
      // issue token
      const payload = { user };
      const token = jwt.sign(payload, secret, {
        expiresIn: "1h",
      });
      res.json({token, userId});
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while logging in." });
  }
});

// find logged in user info
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing." });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token.", err });
    }

    // The token is valid; you can access the user's data in the 'decoded' object
    req.user = decoded.user;
    next();
  });
};

// Example protected route
router.get("/check-token", verifyToken, (req, res) => {
  // Access user data from req.user
  const username = req.user.first_name;
  const userId = req.user.id;
  const returnObject = {user: username, id: userId}
  res.json(returnObject);
});

module.exports = router;
