const mongoose = require('mongoose');

const {Schema} = mongoose;
const bcrypt = require('bcrypt');

const UserSchema = new Schema(
  {
    methods: {
      type: [String],
      required: true,
    },
    local: {
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
  },
  {timestamps: true}
);

UserSchema.pre('save', async function (next) {
  try {
    console.log('entrered');

    if (!this.methods.includes('local')) {
      next();
    }

    // Instansiate userSchema
    const user = this;

    // Check if user has been pmodified to know if the password has already been hashed
    if (!user.isModified('local.password')) {
      next();
    }

    // generate a salt
    const salt = await bcrypt.salt(10);
    // generate a password hash (salt + hash)
    const passwordHash = await bcrypt.hash(this.local.password, salt);
    // Re-assign hashed version over original, plain text password
    this.local.password = passwordHash;
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.isValidPassword = async function (newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.local.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Create a model
const UserModel = mongoose.model('User', UserSchema);

// Export model
module.exports = UserModel;
