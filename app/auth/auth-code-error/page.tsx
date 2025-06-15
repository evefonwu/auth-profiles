import Link from "next/link";

export default function AuthError() {
  return (
    <div className="text-center p-8">
      <h1>Authentication Error</h1>
      <p>There was a problem with your login link.</p>
      <p>Please try requesting a new magic link.</p>
      <Link href="/">← Back to Login</Link>
    </div>
  );
}
