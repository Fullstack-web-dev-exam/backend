const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  /* TEMPORARY DISABLED FOR TESTING
  name: {
    type: 'string',
    require: true,
    trim: true,
  },
  surname: {
    type: 'string',
    require: true,
    trim: true,
  },*/
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
  passwordHash: {
    type: 'string',
    require: true,
  },
  verificationToken: String,
  verified: Date,
  resetToken: {
    token: String,
    expires: Date,
  },
  passwordReset: Date,
  created: { type: Date, default: Date.now },
  updated: Date,
},
  { timestamps: true }
);

userSchema.virtual('isVerified').get(function () {
  return !!(this.verified || this.passwordReset);
});

userSchema.set('toJson', {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.passwordHash;
  },
});

module.exports = mongoose.model('User', userSchema);
