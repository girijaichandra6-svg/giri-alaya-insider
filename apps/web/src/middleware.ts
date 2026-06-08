import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/electronics(.*)",
  "/fashion(.*)",
  "/beauty(.*)",
  "/home-living(.*)",
  "/travel(.*)",
  "/health-wellness(.*)",
  "/food-nutrition(.*)",
  "/search(.*)",
  "/deals(.*)",
  "/blog(.*)",
  "/guides(.*)",
  "/collections(.*)",
  "/go(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
