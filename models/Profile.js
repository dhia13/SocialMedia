const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      unique: true
    },
    accountType: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    website: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      unique: true,
    },
    gender: {
      type: String,
      select: false,
    },
    birthday: {
      type: String,
      select: false,
    },
    closeFriends: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false,
    },
    photo: {
      type: Object,
      default: 'https://e7.pngegg.com/pngimages/867/694/png-clipart-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text.png'
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: 'Profile'
    },

    following: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: 'Profile'
    },
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    Conversations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
      },
    ],
    feed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }
    ],
    saved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }
    ],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// profileSchema.set('toObject', { virtuals: true });
// profileSchema.set('toJSON', { virtuals: true });

// profileSchema.virtual('posts', {
//   ref: 'Post',
//   localField: '_id',
//   foreignField: 'profile',
// });

// profileSchema.pre(/^find/, function (next) {
//   this.find().populate('posts');

//   next();
// });

const Profile = mongoose.model('Profile', profileSchema);
module.exports = { Profile }
