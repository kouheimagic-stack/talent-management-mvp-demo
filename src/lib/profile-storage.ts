import type { EmployeeProfile } from "@/types/talent";

export type ProfileVisibilityStatus = "public" | "private" | "fixed_private";

export type ProfileFieldKey =
  | "photo"
  | "selfIntroduction"
  | "currentWork"
  | "careerHistories"
  | "qualifications"
  | "strengths"
  | "skillsToGrow"
  | "desiredCareerPublic"
  | "desiredCareerPrivate"
  | "mobility"
  | "preMeetingMemo";

export type Mvp0Profile = {
  photoUrl: string;
  selfIntroduction: string;
  currentWork: string;
  careerHistories: string;
  qualifications: string;
  strengths: string;
  skillsToGrow: string;
  desiredCareerPublic: string;
  desiredCareerPrivate: string;
  mobility: string;
  preMeetingMemo: string;
  updatedAt?: string;
  visibility: Record<ProfileFieldKey, ProfileVisibilityStatus>;
};

export const profileStorageVersion = 1;
export const profileStorageNamespace = "talent-mvp0";
export const legacyProfileStoragePrefix = "profile-edit-v4-";

export const publicProfileFieldKeys: ProfileFieldKey[] = [
  "photo",
  "selfIntroduction",
  "careerHistories",
  "qualifications",
  "strengths",
  "skillsToGrow",
  "desiredCareerPublic",
];

export const fixedPrivateProfileFieldKeys: ProfileFieldKey[] = [
  "desiredCareerPrivate",
  "mobility",
  "preMeetingMemo",
];

export const completionItems: Array<{
  key: keyof Omit<Mvp0Profile, "visibility" | "updatedAt">;
  label: string;
  help: string;
}> = [
  { key: "photoUrl", label: "顔写真を設定", help: "社内で本人を認識しやすくなります。" },
  { key: "selfIntroduction", label: "自己紹介を書く", help: "周囲が話しかけやすくなります。" },
  { key: "currentWork", label: "現在の仕事内容を書く", help: "自分の役割を整理できます。" },
  { key: "careerHistories", label: "社内経歴を書く", help: "経験が伝わりやすくなります。" },
  { key: "qualifications", label: "資格を登録", help: "詳しい領域を見つけてもらいやすくなります。" },
  { key: "strengths", label: "得意領域を追加", help: "相談や協業につながります。" },
  { key: "skillsToGrow", label: "伸ばしたいスキルを書く", help: "学びたい方向性を整理できます。" },
  { key: "desiredCareerPublic", label: "将来やりたいことを書く", help: "公開できるキャリア意向を伝えられます。" },
];

export function getProfileStorageKey(employeeId: string) {
  return `${profileStorageNamespace}:profile:${employeeId}`;
}

export function getDefaultVisibility(): Record<ProfileFieldKey, ProfileVisibilityStatus> {
  return {
    photo: "public",
    selfIntroduction: "public",
    currentWork: "private",
    careerHistories: "public",
    qualifications: "public",
    strengths: "public",
    skillsToGrow: "private",
    desiredCareerPublic: "private",
    desiredCareerPrivate: "fixed_private",
    mobility: "fixed_private",
    preMeetingMemo: "fixed_private",
  };
}

export function createDefaultProfile(employee: EmployeeProfile): Mvp0Profile {
  return {
    photoUrl: employee.photoUrl,
    selfIntroduction: `${employee.department}で${employee.position}を担当しています。`,
    currentWork: `${employee.focusTheme}を中心に担当しています。`,
    careerHistories: employee.careerHistories
      .map((history) => `${history.title}: ${history.summary}`)
      .join("\n"),
    qualifications: employee.certifications.map((certification) => certification.name).join("、"),
    strengths: employee.strengths.join("、"),
    skillsToGrow: employee.careerPreference.skillsToDevelop.join("、"),
    desiredCareerPublic: "",
    desiredCareerPrivate: "",
    mobility: employee.careerPreference.mobility,
    preMeetingMemo: "",
    visibility: getDefaultVisibility(),
  };
}

export function normalizeProfile(
  employee: EmployeeProfile,
  partial?: Partial<Mvp0Profile> & { desiredCareer?: string },
): Mvp0Profile {
  const fallback = createDefaultProfile(employee);

  return {
    ...fallback,
    ...partial,
    desiredCareerPublic: partial?.desiredCareerPublic ?? partial?.desiredCareer ?? fallback.desiredCareerPublic,
    visibility: {
      ...fallback.visibility,
      ...partial?.visibility,
      desiredCareerPrivate: "fixed_private" as const,
      mobility: "fixed_private" as const,
      preMeetingMemo: "fixed_private" as const,
    },
  };
}

export function readProfileFromLocalStorage(employee: EmployeeProfile): Mvp0Profile {
  if (typeof window === "undefined") {
    return createDefaultProfile(employee);
  }

  const currentRaw = window.localStorage.getItem(getProfileStorageKey(employee.id));
  if (currentRaw) {
    try {
      return parseStoredProfilePayload(employee, JSON.parse(currentRaw));
    } catch {
      return createDefaultProfile(employee);
    }
  }

  const legacyRaw = window.localStorage.getItem(`${legacyProfileStoragePrefix}${employee.id}`);
  if (legacyRaw) {
    try {
      const migrated = normalizeProfile(employee, JSON.parse(legacyRaw) as Partial<Mvp0Profile>);
      writeProfileToLocalStorage(employee.id, migrated);
      return migrated;
    } catch {
      return createDefaultProfile(employee);
    }
  }

  return createDefaultProfile(employee);
}

export function writeProfileToLocalStorage(employeeId: string, profile: Mvp0Profile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getProfileStorageKey(employeeId),
    JSON.stringify({
      version: profileStorageVersion,
      profile: {
        photoUrl: profile.photoUrl,
        selfIntroduction: profile.selfIntroduction,
        currentWork: profile.currentWork,
        careerHistories: profile.careerHistories,
        qualifications: profile.qualifications,
        strengths: profile.strengths,
        skillsToGrow: profile.skillsToGrow,
        desiredCareerPublic: profile.desiredCareerPublic,
        desiredCareerPrivate: profile.desiredCareerPrivate,
        mobility: profile.mobility,
        preMeetingMemo: profile.preMeetingMemo,
      },
      visibility: profile.visibility,
      updatedAt: profile.updatedAt,
    }),
  );
}

export function parseStoredProfilePayload(employee: EmployeeProfile, raw: unknown): Mvp0Profile {
  if (raw && typeof raw === "object" && "profile" in raw) {
    const payload = raw as {
      profile?: Partial<Mvp0Profile>;
      visibility?: Partial<Record<ProfileFieldKey, ProfileVisibilityStatus>>;
      updatedAt?: string;
    };

    return normalizeProfile(employee, {
      ...payload.profile,
      updatedAt: payload.updatedAt,
      visibility: payload.visibility as Record<ProfileFieldKey, ProfileVisibilityStatus>,
    });
  }

  return normalizeProfile(employee, raw as Partial<Mvp0Profile>);
}

export function readStoredPublicProfile(employee: EmployeeProfile): Mvp0Profile {
  if (typeof window === "undefined") {
    return createDefaultProfile(employee);
  }

  const currentRaw = window.localStorage.getItem(getProfileStorageKey(employee.id));
  if (currentRaw) {
    try {
      return parseStoredProfilePayload(employee, JSON.parse(currentRaw));
    } catch {
      return createDefaultProfile(employee);
    }
  }

  return readProfileFromLocalStorage(employee);
}

export function getCompletion(profile: Mvp0Profile) {
  const completed = completionItems.filter((item) => String(profile[item.key] ?? "").trim());
  const missing = completionItems.filter((item) => !String(profile[item.key] ?? "").trim());

  return {
    completed,
    missing,
    percentage: Math.round((completed.length / completionItems.length) * 100),
  };
}

export function getVisibilitySummary(profile: Mvp0Profile) {
  const publicCount = publicProfileFieldKeys.filter((key) => profile.visibility[key] === "public").length;
  const privateCount = publicProfileFieldKeys.length - publicCount;

  return {
    publicCount,
    privateCount,
    fixedPrivateCount: fixedPrivateProfileFieldKeys.length,
  };
}
