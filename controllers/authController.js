const { createClient } = require('@supabase/supabase-js');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const db = require('../db');

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
      // Decode the email parameter
      const email = decodeURIComponent(req.params.email);

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      console.log('Checking verification for email:', email);

      // Query our users table directly
      const query = `
        SELECT 
          u.id,
          u.email,
          u.created_at,
          auth.users.email_confirmed_at IS NOT NULL as email_verified
        FROM users u
        JOIN auth.users ON u.email = auth.users.email
        WHERE u.email = $1;
      `;

      const result = await db.query(query, [email]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'User not found',
          email: email
        });
      }

      // Return user verification status
      res.json({
        email: result.rows[0].email,
        email_verified: result.rows[0].email_verified,
        created_at: result.rows[0].created_at
      });

    } catch (error) {
      console.error('Error in checkEmailVerification:', error);
      res.status(500).json({ 
        error: 'Error checking email verification status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
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