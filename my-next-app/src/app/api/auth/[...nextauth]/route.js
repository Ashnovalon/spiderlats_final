import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/db"; // Make sure prisma client is imported correctly

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // Fetch user from Prisma database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email, // Destructure from credentials
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Return user if credentials match
        return {
          id: user.id,
          name: user.name || user.email, // Adjust based on your schema
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Make sure you have this in your .env file
};

// Export handlers for Next.js App Router
export const POST = NextAuth(authOptions);
export const GET = NextAuth(authOptions);
