import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

export async function PUT(req) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await dbConnect();

    const body = await req.json();
    const {
      age,
      address,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactWhatsapp,
    } = body;

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        age: String(age),
        address,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactWhatsapp,
        profileComplete: true,
      },
      { new: true, strict: false }
    );

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function GET(req) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
