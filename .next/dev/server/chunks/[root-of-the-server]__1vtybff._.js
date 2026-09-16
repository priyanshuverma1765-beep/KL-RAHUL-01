module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/app/api/predict/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/request-guard.ts [app-route] (ecmascript)");
;
const formats = new Set([
    "Test",
    "ODI",
    "T20I",
    "IPL"
]);
function validPayload(body) {
    if (!body || typeof body !== "object") return null;
    const value = body;
    const format = String(value.format ?? "");
    const opponent = String(value.opponent ?? "").trim();
    const venue = String(value.venue ?? "").trim();
    const battingPosition = Number(value.batting_position);
    const inningsNumber = Number(value.innings_number ?? 1);
    if (!formats.has(format) || !opponent || opponent.length > 100 || !venue || venue.length > 160) return null;
    if (!Number.isInteger(battingPosition) || battingPosition < 1 || battingPosition > 11) return null;
    if (!Number.isInteger(inningsNumber) || inningsNumber < 1 || inningsNumber > 4) return null;
    return {
        format,
        opponent,
        venue,
        batting_position: battingPosition,
        innings_number: inningsNumber,
        chasing: Boolean(value.chasing)
    };
}
async function POST(request) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sameOrigin"])(request)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
        error: "Cross-origin requests are not accepted."
    }, {
        status: 403
    });
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withinRateLimit"])(request, 12)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
        error: "Too many estimates. Please wait a minute and try again."
    }, {
        status: 429
    });
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
        error: "Send match context as JSON."
    }, {
        status: 415
    });
    try {
        const payload = validPayload(await request.json());
        if (!payload) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
            error: "The match context is invalid."
        }, {
            status: 400
        });
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), 12_000);
        const apiUrl = (process.env.KLR_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
        try {
            const response = await fetch(`${apiUrl}/predict`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                cache: "no-store",
                signal: controller.signal
            });
            if (!response.ok) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
                error: "The prediction service rejected this request."
            }, {
                status: 502
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])(await response.json());
        } finally{
            clearTimeout(timeout);
        }
    } catch  {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$request$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
            error: "The prediction service is unavailable. Start the FastAPI service or configure KLR_API_URL."
        }, {
            status: 503
        });
    }
}
}),
"[project]/lib/request-guard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "json",
    ()=>json,
    "sameOrigin",
    ()=>sameOrigin,
    "withinRateLimit",
    ()=>withinRateLimit
]);
const buckets = new Map();
function sameOrigin(request) {
    const origin = request.headers.get("origin");
    if (!origin) return true;
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost ?? request.headers.get("host");
    if (!host) return false;
    try {
        return new URL(origin).host === host;
    } catch  {
        return false;
    }
}
function withinRateLimit(request, limit = 20, windowMs = 60_000) {
    const now = Date.now();
    const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const bucket = buckets.get(address);
    if (!bucket || bucket.resetAt <= now) {
        buckets.set(address, {
            count: 1,
            resetAt: now + windowMs
        });
        return true;
    }
    if (bucket.count >= limit) return false;
    bucket.count += 1;
    return true;
}
function json(data, init) {
    const headers = new Headers(init?.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("Content-Type", "application/json; charset=utf-8");
    headers.set("X-Content-Type-Options", "nosniff");
    return Response.json(data, {
        ...init,
        headers
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1vtybff._.js.map