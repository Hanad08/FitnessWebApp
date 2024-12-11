"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.heading}>Welcome to Fitness App</h1>
        {status === "authenticated" && session?.user ? (
          <>
            <p className={styles.text}>
              Hello {session.user.name}! You are logged in as a{" "}
              {session.user.role}.
            </p>
            <Link
              href={`/${session.user.role.toLowerCase()}/dashboard`}
              className={styles.button}
            >
              Go to Your Dashboard
            </Link>
          </>
        ) : (
          <>
            <p className={styles.text}>
            Manage your workout programs, track progress, <br />
            and more, all in one place.
            </p>
            <Link href="/Users/login" className={styles.button}>
              Login to Your Account
            </Link>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Fitness App. All rights reserved.</p>
      </footer>
    </div>
  );
}
