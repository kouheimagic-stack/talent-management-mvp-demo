"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCompletion,
  getVisibilitySummary,
  readProfileFromLocalStorage,
  writeProfileToLocalStorage,
  type Mvp0Profile,
  type ProfileFieldKey,
  type ProfileVisibilityStatus,
} from "@/lib/profile-storage";
import type { EmployeeProfile } from "@/types/talent";

export function useProfileDraft(employee: EmployeeProfile) {
  const [draft, setDraft] = useState<Mvp0Profile>(() => readProfileFromLocalStorage(employee));
  const [lastSaved, setLastSaved] = useState<Mvp0Profile>(() => readProfileFromLocalStorage(employee));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(lastSaved),
    [draft, lastSaved],
  );
  const completion = useMemo(() => getCompletion(draft), [draft]);
  const visibilitySummary = useMemo(() => getVisibilitySummary(draft), [draft]);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "未保存の変更があります";
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedChanges]);

  function updateField<K extends keyof Omit<Mvp0Profile, "visibility" | "updatedAt">>(
    key: K,
    value: Mvp0Profile[K],
  ) {
    setSaveState("idle");
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateVisibility(key: ProfileFieldKey, value: ProfileVisibilityStatus) {
    setSaveState("idle");
    setDraft((current) => ({
      ...current,
      visibility: { ...current.visibility, [key]: value },
    }));
  }

  async function save() {
    setSaveState("saving");
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const nextDraft = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    writeProfileToLocalStorage(employee.id, nextDraft);
    setDraft(nextDraft);
    setLastSaved(nextDraft);
    setSaveState("saved");
  }

  return {
    draft,
    setDraft,
    updateField,
    updateVisibility,
    save,
    saveState,
    hasUnsavedChanges,
    completion,
    visibilitySummary,
  };
}
