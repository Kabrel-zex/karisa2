import { NextResponse } from "next/server"
import type { SessionUser } from "./session"

const isProd = process.env.NODE_ENV === "production"

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  user?: SessionUser
) {
  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  })

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  if (user) {
    response.cookies.set("user_session", JSON.stringify(user), {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return response
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete("access_token")
  response.cookies.delete("refresh_token")
  response.cookies.delete("user_session")
  return response
}
