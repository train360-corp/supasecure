import {createServerClient} from "@supabase/ssr";
import {type NextRequest, NextResponse} from "next/server";


export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.SUPABASE_PUBLIC_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({name, value, options}) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    const {data: {user}} = await supabase.auth.getUser();

    // handle client attempt to login
    if (user !== null && user.role === "client") throw new Error("clients do not have access to web portal");

    // redirect to login if not authenticated
    if (!user && (request.nextUrl.pathname.startsWith("/dashboard") || (request.nextUrl.pathname.startsWith("/api") && !request.nextUrl.pathname.startsWith("/api/public"))))
        return NextResponse.redirect(`${request.nextUrl.origin}/login?error=unauthorized&next=${encodeURIComponent(request.nextUrl.pathname)}`);

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse;
}