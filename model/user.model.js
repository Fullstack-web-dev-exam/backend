const mongoose = require('mongoose');

const {Schema} = mongoose;
const bcrypt = require('bcrypt');

const UserSchema = new Schema(
  {
    name: {
      type: 'string',
      require: true,
      trim: true,
    },
    surname: {
      type: 'string',
      require: true,
      trim: true,
    },
    role: {
      type: 'string',
      require: true,
      enum: ['manager', 'gardener'],
      default: 'gardener',
    },
    email: {
      type: 'string',
      require: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: 'string',
      require: true,
    },
  },
  {timestamps: true}
);

UserSchema.pre('save', async function (next) {
  // Hashes password 10 rounds
  const hash = await bcrypt.hash(this.password, 10);

  this.password = hash;
  next();
});

UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
};

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
