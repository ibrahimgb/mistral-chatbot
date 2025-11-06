import { sendChat } from "@/app/api/mistral";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log(body)
    const { messages, model } = ( body) as {
      messages: ChatMessage[];
      model: string;
    };
    const result = await sendChat(messages, model);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to send chat", err },
      { status: 500 },
    );
  }
}
