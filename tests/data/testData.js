/**
 * Test Data Management
 *
 * Centralized test data for all test suites
 */

module.exports = {
  // User credentials
  users: {
    default: {
      username: 'demo',
      password: 'password',
    },
    invalid: {
      username: 'invalid',
      password: 'wrong',
    },
  },

  // Profile data (expected values from the app)
  profile: {
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    memberSince: '2024',
  },

  // Form test data
  forms: {
    valid: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
      bio: 'Software engineer with 10 years of experience in mobile development.',
      notifications: true,
      newsletter: false,
    },
    minimal: {
      name: 'Jane',
      email: 'jane@test.com',
      age: 25,
      bio: 'Test user',
      notifications: false,
      newsletter: false,
    },
    long: {
      name: 'Alexander Maximilian Christopher',
      email: 'alexander.maximilian.christopher@very-long-domain-name.com',
      age: 99,
      bio: 'This is a very long biography that contains multiple sentences. It should test how the textarea handles longer text input. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      notifications: true,
      newsletter: true,
    },
    special: {
      name: 'Test User #123',
      email: 'test+special@example.com',
      age: 18,
      bio: 'Special characters: @#$%^&*()!',
      notifications: false,
      newsletter: true,
    },
    empty: {
      name: '',
      email: '',
      age: '',
      bio: '',
      notifications: true,
      newsletter: false,
    },
  },

  // List/Task data (matches app's INITIAL_ITEMS)
  tasks: {
    all: [
      { id: '1', title: 'Complete project proposal', status: 'pending' },
      { id: '2', title: 'Review pull requests', status: 'completed' },
      { id: '3', title: 'Update documentation', status: 'pending' },
      { id: '4', title: 'Fix authentication bug', status: 'in-progress' },
      { id: '5', title: 'Deploy to staging', status: 'pending' },
      { id: '6', title: 'Write unit tests', status: 'completed' },
      { id: '7', title: 'Optimize database queries', status: 'pending' },
      { id: '8', title: 'Update dependencies', status: 'in-progress' },
      { id: '9', title: 'Code review session', status: 'completed' },
      { id: '10', title: 'Team standup meeting', status: 'pending' },
    ],
    pending: ['1', '3', '5', '7', '10'],
    inProgress: ['4', '8'],
    completed: ['2', '6', '9'],
  },

  // Navigation routes
  routes: {
    login: '/',
    home: '/home',
    form: '/form',
    list: '/list',
    profile: '/profile',
  },

  // Home screen menu items
  homeMenu: {
    form: 'menu-item-form',
    list: 'menu-item-list',
    profile: 'menu-item-profile',
  },

  // Profile settings
  profileSettings: [
    'Edit Profile',
    'Notifications',
    'Privacy',
    'Help & Support',
    'About',
  ],

  // Timeouts (milliseconds)
  timeouts: {
    short: 1000,
    medium: 3000,
    long: 5000,
    pageLoad: 10000,
  },
};
