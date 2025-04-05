import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  building: {
    type: String,
    required: [true, 'Building is required'],
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // Allow any non-empty string after trimming
        return v && v.trim().length > 0;
      },
      message: 'Building name cannot be empty'
    }
  },
  floor: {
    type: String,
    required: [true, 'Floor is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Floor cannot be empty'
    }
  },
  flat: {
    type: String,
    required: [true, 'Flat number is required'],
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Flat number cannot be empty'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  code: {
    type: String,
    required: true,
    default: function() {
      if (this.building && this.flat) {
        return `${this.building}${this.flat}`.toUpperCase();
      }
      return undefined;
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update code when building or flat changes
userSchema.pre('save', function(next) {
  if (this.isModified('building') || this.isModified('flat')) {
    this.code = `${this.building}${this.flat}`.toUpperCase();
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User; 