const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // Hashes password 10 rounds
  const hash = await bcrypt.hash(this.password, 10);

  this.password = hash;
  next();
});

userSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
};

module.exports = mongoose.model('Users', userSchema);
