const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const SALT = 10;

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      getters: true,
    },
    collection: "Users",
  }
);

// presave
userSchema.pre("save", function (next) {
  var user = this;
  // only continue if password is new
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(SALT, function (err, salt) {
    if (err) return next(err);
    // encrypt passowrd
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// compare passwords
userSchema.methods.comparePassword = function (candiatePassword) {
  return bcrypt.compare(candiatePassword, this.password);
};
//initalize
const User = model("Users", userSchema);

//error handling
const handleError = (err) => console.error(err);

// seed
User.create({
  first_name: "Merel",
  email: "test@test.com",
  password: "test",
})
  .then((result) => console.log("New User seeded: ", result))
  .catch((err) => handleError(err));

// export
module.exports = User;
