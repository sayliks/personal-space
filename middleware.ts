import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (isLoggedIn) {
        return Response.redirect(new URL("/admin", req.url));
      }
      return;
    }

    if (!isLoggedIn) {
      return Response.redirect(
        new URL(`/admin/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
