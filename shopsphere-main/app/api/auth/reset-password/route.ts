import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, newPassword, password } = body;
    const targetPassword = newPassword || password;

    if (!email || !targetPassword) {
      return NextResponse.json(
        { error: "Account email and new password are required." },
        { status: 400 }
      );
    }

    if (targetPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found registered with this email address." },
        { status: 404 }
      );
    }

    // 2. Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(targetPassword, 12);

    // 3. Detect the exact password column from SQLite table columns
    const tableColumns = await prisma.$queryRaw<Array<{ name: string }>>`
      PRAGMA table_info("User");
    `;

    const columnNames = tableColumns.map((c) => c.name);
    console.log("Detected User table columns:", columnNames);

    const candidates = [
      "hashedPassword",
      "passwordHash",
      "password",
      "hash",
      "pass",
    ];

    const matchedColumn = candidates.find((col) => columnNames.includes(col));

    if (!matchedColumn) {
      console.error("No recognized password column found in:", columnNames);
      return NextResponse.json(
        { error: `Database column for password not found. Available: ${columnNames.join(", ")}` },
        { status: 500 }
      );
    }

    // 4. Update password directly via raw parameterized SQL to bypass Prisma model typing mismatches
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "${matchedColumn}" = ? WHERE "id" = ?`,
      hashedPassword,
      user.id
    );

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Unable to update password. Please try again." },
      { status: 500 }
    );
  }
}