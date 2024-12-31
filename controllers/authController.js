const { createClient } = require('@supabase/supabase-js');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

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
      
      // Default name is the part before @ in email if name not provided
      const defaultName = name || email.split('@')[0];

      // Register with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;

      // Create user in our database
      const { data: userData, error: userError } = await userModel.createUser({
        id: authData.user.id,
        email: authData.user.email,
        name: defaultName,
        created_at: new Date(),
        updated_at: new Date()
      });

      if (userError) throw userError;

      res.status(201).json({
        message: 'Registration successful. Please check your email for verification.',
        email: authData.user.email
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
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

      // Create JWT with expiration
      const token = jwt.sign(
        { 
          user_id: data.user.id,
          email: data.user.email 
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
      );

      res.status(200).json({
        token,
        user: data.user,
        expiresIn: 24 * 60 * 60 * 1000 // milliseconds until expiration
      });

    } catch (error) {
      res.status(500).json({
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
      const requestingUser = req.user; // From auth middleware

      // Only allow users to check their own email verification status
      if (email.toLowerCase() !== requestingUser.email.toLowerCase()) {
        return res.status(403).json({
          error: 'You can only check your own email verification status'
        });
      }
      
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        filters: {
          email: email.toLowerCase()
        }
      });

      if (error) throw error;

      const user = data?.users?.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Base response
      const response = {
        email: user.email,
        email_verified: false // Default to false
      };

      // Only set to true and add verification_date if it exists
      if (user.email_confirmed_at) {
        response.email_verified = true;
        response.verification_date = user.email_confirmed_at;
      }

      res.status(200).json(response);
      
    } catch (error) {
      console.error('Error checking email verification:', error);
      res.status(500).json({
        error: error.message
      });
    }
  },

  resendVerificationEmail: async (req, res) => {
    try {
      const { email } = req.body;
      
      const { data, error } = await supabaseAdmin.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      res.status(200).json({
        message: 'Verification email resent successfully'
      });
      
    } catch (error) {
      console.error('Error resending verification email:', error);
      res.status(500).json({
        error: error.message
      });
    }
  }
};

module.exports = authController; 