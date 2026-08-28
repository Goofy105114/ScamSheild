export async function GET() {
  return Response.json({
    status: "ok",
    service: "scamshield",
    aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    time: new Date().toISOString(),
  });
}
