const { createClient } = require('@supabase/supabase-js');
const userModel = require('../models/userModel');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const authController = {
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      // Register with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create user in our database
      const userData = {
        id: authData.user.id,
        email: authData.user.email,
        name: name || null,
        avatar_url: null
      };

      const user = await userModel.createUser(userData);

      res.status(201).json({
        message: 'Registration successful',
        user: user
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      res.status(200).json({
        message: 'Login successful',
        user: data.user,
        session: data.session
      });
    } catch (error) {
      res.status(401).json({
        error: error.message
      });
    }
  },

  logout: async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      res.status(200).json({
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  checkEmailVerification: async (req, res) => {
    try {
      const { email } = req.params;
      
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        filters: {
          email: email
        }
      });

      if (error) throw error;

      if (!data?.users || data.users.length === 0) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      const user = data.users[0];

      res.status(200).json({
        email: user.email,
        email_verified: user.email_confirmed_at !== null,
        verification_date: user.email_confirmed_at
      });
      
    } catch (error) {
      console.error('Error checking email verification:', error);
      res.status(500).json({
        error: error.message
      });
    }
  }
};

module.exports = authController; 