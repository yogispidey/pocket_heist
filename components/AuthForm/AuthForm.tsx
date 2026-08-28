"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import styles from "./AuthForm.module.css";

interface AuthFormProps {
  mode: "login" | "signup";
}

const copy = {
  login: {
    title: "Log in to Your Account",
    submit: "Log in",
    prompt: "Don't have an account?",
    switchHref: "/signup",
    switchLabel: "Sign up",
  },
  signup: {
    title: "Signup for an Account",
    submit: "Sign up",
    prompt: "Already have an account?",
    switchHref: "/login",
    switchLabel: "Log in",
  },
};

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { title, submit, prompt, switchHref, switchLabel } = copy[mode];

  // no auth backend yet — log the details so the form can be exercised
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log({ email, password });
  }

  return (
    <div className="center-content">
      <div className="page-content">
        <h1 className="form-title">{title}</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.toggleBtn}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((shown) => !shown)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn">
            {submit}
          </button>
        </form>

        <p className={styles.switch}>
          {prompt}{" "}
          <Link href={switchHref} className={styles.switchLink}>
            {switchLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
