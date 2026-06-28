import AdminLayout from "@/components/admin/AdminLayout";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";


export const metadata = {
    title: "VetteClothing. - Admin",
    description: "VetteClothing. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
        <SignedIn>
          <AdminLayout>
            {children}
          </AdminLayout>
        </SignedIn>
        <SignedOut>
          <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <SignIn fallbackRedirectUrl="/admin" routing="hash" />
          </div>
        </SignedOut>
      </>
    );
}
