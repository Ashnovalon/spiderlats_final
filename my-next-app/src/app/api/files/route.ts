// Import dependencies
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import fs from "fs";
import path from "path";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Handle file uploads
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const workspaceId = formData.get("workspaceId");

    if (!file || !workspaceId) {
      return NextResponse.json(
        { error: "File and workspace ID are required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = `${workspaceId}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("workspace-files")
      .upload(filePath, buffer);

    if (error) throw error;

    const fileUrl = `${supabaseUrl}/storage/v1/object/public/workspace-files/${filePath}`;

    // Save file details in the database
    await prisma.file.create({
      data: {
        name: file.name,
        url: fileUrl,
        workspaceId: parseInt(workspaceId.toString(), 10),
      },
    });

    return NextResponse.json({
      message: "File uploaded successfully",
      url: fileUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle listing files
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const workspaceId = req.nextUrl.searchParams.get("workspaceId");
    const fileName = req.nextUrl.searchParams.get("fileName");

    // If workspaceId and fileName are provided, handle downloads
    if (workspaceId && fileName) {
      const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/workspace-files/${workspaceId}/${fileName}`;
      return NextResponse.redirect(fileUrl);
    }

    // Otherwise, handle listing files
    if (workspaceId) {
      const files = await prisma.file.findMany({
        where: { workspaceId: parseInt(workspaceId, 10) },
      });
      return NextResponse.json(files);
    }

    // Missing query parameters
    return NextResponse.json(
      { error: "workspaceId or fileName is required" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
