import { Auth } from "@auth/core"
import { authConfig } from "@/lib/auth"

export async function GET(request: Request) {
  return Auth(request, authConfig)
}

export async function POST(request: Request) {
  return Auth(request, authConfig)
}
