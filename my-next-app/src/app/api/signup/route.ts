import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { hash } from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { user: null, message: "All fields are required." },
        { status: 400 }
      );
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { user: null, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: newUserPassword, ...rest } = newUser;

    return NextResponse.json(
      {
        user: rest,
        message: "User created successfully. Redirecting to sign-in page.",
      },
      { status: 201, headers: { Location: "/sign-in" } }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { user: null, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
