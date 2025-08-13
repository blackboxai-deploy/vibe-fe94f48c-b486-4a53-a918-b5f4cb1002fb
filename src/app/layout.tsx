import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Todo App",
  description: "A simple Todo list built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Todo List</h1>
          </header>
          <main>{children}</main>
          <footer className="footer">Built with Next.js</footer>
        </div>
      </body>
    </html>
  );
}
