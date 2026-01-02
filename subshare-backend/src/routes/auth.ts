import { Hono } from 'hono';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { generateToken } from '@/utils/jwt';
import { sanitizeUser, isValidEmail, isValidPassword } from '@/utils/helpers';
import { validate, schemas } from '@/middleware/validator';
import { authenticate } from '@/middleware/auth';
import { strictRateLimiter } from '@/middleware/rateLimiter';
import { RegisterRequest, LoginRequest, AuthResponse } from '@/types';

const auth = new Hono();

/**
 * POST /api/auth/register
 * Register a new user
 */
auth.post('/register', strictRateLimiter(), validate(schemas.register), async (c) => {
  try {
    const { name, email, password } = await c.req.json() as RegisterRequest;

    // Validate email format
    if (!isValidEmail(email)) {
      return c.json({
        success: false,
        error: 'Invalid email format',
      }, 400);
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return c.json({
        success: false,
        error: 'Password validation failed',
        details: passwordValidation.errors,
      }, 400);
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json({
        success: false,
        error: 'Email already registered',
      }, 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user',
        balance: 0,
      })
      .returning();

    // Generate JWT token
    const token = generateToken({
      id: newUser[0].id,
      email: newUser[0].email,
      role: newUser[0].role,
    });

    const response: AuthResponse = {
      user: sanitizeUser(newUser[0]),
      token,
    };

    return c.json({
      success: true,
      data: response,
      message: 'User registered successfully',
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({
      success: false,
      error: 'Failed to register user',
    }, 500);
  }
});

/**
 * POST /api/auth/login
 * User login
 */
auth.post('/login', strictRateLimiter(), validate(schemas.login), async (c) => {
  try {
    const { email, password } = await c.req.json() as LoginRequest;

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user.length === 0) {
      return c.json({
        success: false,
        error: 'Invalid email or password',
      }, 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return c.json({
        success: false,
        error: 'Invalid email or password',
      }, 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: user[0].id,
      email: user[0].email,
      role: user[0].role,
    });

    const response: AuthResponse = {
      user: sanitizeUser(user[0]),
      token,
    };

    return c.json({
      success: true,
      data: response,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({
      success: false,
      error: 'Failed to login',
    }, 500);
  }
});

/**
 * POST /api/auth/logout
 * User logout (client-side token removal)
 */
auth.post('/logout', authenticate, async (c) => {
  try {
    // In JWT-based auth, logout is handled client-side by removing the token
    // This endpoint exists for consistency and future token blacklisting
    
    return c.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({
      success: false,
      error: 'Failed to logout',
    }, 500);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
auth.get('/me', authenticate, async (c) => {
  try {
    const userId = c.get('userId') as number;

    // Fetch fresh user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return c.json({
        success: false,
        error: 'User not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: sanitizeUser(user[0]),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch user data',
    }, 500);
  }
});

export default auth;