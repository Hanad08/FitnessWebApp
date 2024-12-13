import NextAuth from "next-auth";
import { authController } from "./authController";
import { NextRequest, NextResponse } from "next/server";

const options = authController;

export async function GET(req: NextRequest) {
    const res = NextResponse.next();
    await NextAuth(options);
    return res;
}

export async function POST(req: NextRequest) {
    const res = NextResponse.next();
    await NextAuth(options);
    return res;
}