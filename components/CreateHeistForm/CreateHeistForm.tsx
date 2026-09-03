"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/AuthContext";
import {
  User,
  COLLECTIONS,
  userConverter,
  CreateHeistInput,
} from "@/types/firestore";
import styles from "./CreateHeistForm.module.css";

export default function CreateHeistForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(
          collection(db, COLLECTIONS.USERS).withConverter(userConverter),
        );
        const fetched = snapshot.docs.map((doc) => doc.data() as User);
        setUsers(fetched);
        if (fetched.length > 0) setAssignedTo(fetched[0].id);
      } catch {
        setError("Failed to load users. Please refresh and try again.");
      }
    }
    fetchUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const assignedUser = users.find((u) => u.id === assignedTo);
      const payload: CreateHeistInput = {
        title,
        description,
        createdBy: user.uid,
        createdByCodename: user.displayName ?? "",
        assignedTo,
        assignedToCodename: assignedUser?.codename ?? "",
        createdAt: serverTimestamp(),
        deadline: Timestamp.fromMillis(Date.now() + 48 * 60 * 60 * 1000),
        finalStatus: null,
      };
      await addDoc(collection(db, COLLECTIONS.HEISTS), payload);
      router.push("/heists");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={styles.input}
          value={title}
          disabled={isLoading}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className={styles.textarea}
          value={description}
          disabled={isLoading}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="assignedTo">Assign to</label>
        <select
          id="assignedTo"
          name="assignedTo"
          className={styles.input}
          value={assignedTo}
          disabled={isLoading || users.length === 0}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.codename}
            </option>
          ))}
        </select>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="submit"
        className="btn"
        disabled={isLoading || users.length === 0}
      >
        {isLoading ? "Creating..." : "Create Heist"}
      </button>
    </form>
  );
}
