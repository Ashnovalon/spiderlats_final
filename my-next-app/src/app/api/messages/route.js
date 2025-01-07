import prisma from "@/lib/db"; // Prisma client

export async function GET(req) {
  // Extract the URL parameters from the request object
  const url = new URL(req.url);
  const room = url.searchParams.get("room"); // Get the "room" query parameter

  if (!room) {
    return new Response("Room is required", { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { room: room },
      orderBy: { createdAt: "desc" },
      take: 2, // Fetch the last 5 messages
    });
    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response("Error fetching messages", { status: 500 });
  }
}
