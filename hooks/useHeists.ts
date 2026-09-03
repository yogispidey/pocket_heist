"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/AuthContext";
import { Heist, COLLECTIONS, heistConverter } from "@/types/firestore";

export type HeistMode = "active" | "assigned" | "expired";

export function useHeists(mode: HeistMode): {
  heists: Heist[];
  isLoading: boolean;
  error: string | null;
} {
  const [heists, setHeists] = useState<Heist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();

  useEffect(() => {
    if ((mode === "active" || mode === "assigned") && !user) return;

    const ref = collection(db, COLLECTIONS.HEISTS).withConverter(
      heistConverter,
    );
    const now = Timestamp.now();

    let q;
    if (mode === "active") {
      q = query(
        ref,
        where("assignedTo", "==", user!.uid),
        where("deadline", ">=", now),
      );
    } else if (mode === "assigned") {
      q = query(
        ref,
        where("createdBy", "==", user!.uid),
        where("deadline", ">=", now),
      );
    } else {
      q = query(
        ref,
        where("deadline", "<", now),
        where("finalStatus", "in", ["success", "failure"]),
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setHeists(snapshot.docs.map((d) => d.data() as Heist));
        setIsLoading(false);
      },
      () => {
        setError("Failed to load heists.");
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [mode, user]);

  return { heists, isLoading, error };
}
