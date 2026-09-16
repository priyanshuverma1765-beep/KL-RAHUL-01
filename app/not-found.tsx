import Link from "next/link";

export default function NotFound() {
  return (
    <main className="error-page">
      <div>
        <span>404 / Outside the archive</span>
        <h1>INNINGS NOT FOUND.</h1>
        <p>The route you requested does not exist. Return to the verified archive and continue from the home section.</p>
        <Link href="/">Return home</Link>
      </div>
    </main>
  );
}
