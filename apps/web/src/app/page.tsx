export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        gap: "1rem",
      }}
    >
      <h1>Ecommerce Platform</h1>
      <p>Web is running ✅</p>
      <p>
        API base URL: <code>{apiUrl}</code>
      </p>
      <a href="/health">→ Web health check</a>
    </main>
  );
}
