import { clerkClient } from "@clerk/nextjs/server"
import { isAdminEmail, isAdminEmailConfigured } from "@/lib/requiredEnv"

const authAdmin = async (userId) => {
  try {
    if (!userId) return false

    if (!isAdminEmailConfigured()) {
      console.error('[security] ADMIN_EMAIL is not configured; denying admin access')
      return false
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress
    return isAdminEmail(email)
  } catch (error) {
    console.error(error)
    return false
  }
}

export default authAdmin