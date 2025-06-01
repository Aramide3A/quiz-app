import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';

const prisma = new PrismaClient();

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret', // Use your actual secret or environment variable
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (user) {
        // Attach user object to request (excluding password)
        const { password, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      }
      return done(null, false); // User not found
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;