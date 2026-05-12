"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { Eye, EyeOff, ImagePlus, LockKeyhole, Save, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EmployeeProfile } from "@/types/talent";

type VisibilityStatus = "public" | "private" | "fixed_private";
type VisibilityKey =
  | "photo"
  | "selfIntroduction"
  | "careerHistories"
  | "qualifications"
  | "strengths"
  | "skillsToGrow"
  | "desiredCareerPublic"
  | "desiredCareerPrivate"
  | "mobility"
  | "preMeetingMemo"
  | "currentWork";

type ProfileDraft = {
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
  visibility: Record<VisibilityKey, VisibilityStatus>;
};

type FieldConfig = {
  key: Exclude<keyof ProfileDraft, "visibility" | "updatedAt">;
  visibilityKey: VisibilityKey;
  label: string;
  description: string;
  placeholder: string;
  toggleable?: boolean;
  fixedPrivate?: boolean;
  rows?: number;
};

const keyPrefix = "profile-edit-v4-";
const publicToggleText =
  "この項目を公開すると、全社員が閲覧できるようになります。公開してもよろしいですか？";

const fields: FieldConfig[] = [
  {
    key: "selfIntroduction",
    visibilityKey: "selfIntroduction",
    label: "自己紹介",
    description: "公開プロフィールで最初に読まれる本人の説明です。",
    placeholder: "担当領域、働き方、周囲に知ってほしいことを記入",
    toggleable: true,
  },
  {
    key: "currentWork",
    visibilityKey: "currentWork",
    label: "現在の仕事内容",
    description: "自分の整理用情報です。MVP 0では公開プロフィールには表示しません。",
    placeholder: "今担当している業務、役割、主な責任範囲",
  },
  {
    key: "careerHistories",
    visibilityKey: "careerHistories",
    label: "社内経歴",
    description: "社内での異動、担当変更、プロジェクト経験を整理します。",
    placeholder: "2024年4月 プロダクト開発部に異動、決済基盤の改善を担当",
    toggleable: true,
  },
  {
    key: "qualifications",
    visibilityKey: "qualifications",
    label: "保有資格",
    description: "公開すると、社内で資格保有者を探す時に見つかりやすくなります。",
    placeholder: "AWS SAA、簿記2級、TOEIC 850",
    toggleable: true,
  },
  {
    key: "strengths",
    visibilityKey: "strengths",
    label: "得意領域",
    description: "公開すると、相談先や協業相手として見つかりやすくなります。",
    placeholder: "要件整理、データ分析、顧客折衝",
    toggleable: true,
  },
  {
    key: "skillsToGrow",
    visibilityKey: "skillsToGrow",
    label: "伸ばしたいスキル",
    description: "公開すると、学びたい領域が周囲に伝わります。",
    placeholder: "プロダクト戦略、ピープルマネジメント、英語でのファシリテーション",
    toggleable: true,
  },
  {
    key: "desiredCareerPublic",
    visibilityKey: "desiredCareerPublic",
    label: "希望キャリア 公開用コメント",
    description: "他社員に見せてもよい将来像です。",
    placeholder: "将来的にプロダクトマネジメント領域に挑戦したい",
    toggleable: true,
  },
  {
    key: "desiredCareerPrivate",
    visibilityKey: "desiredCareerPrivate",
    label: "希望キャリア 非公開コメント",
    description: "本人だけが管理する相談用メモです。公開プロフィールには表示しません。",
    placeholder: "現部署では成長機会が少ないため、異動も含めて相談したい",
    fixedPrivate: true,
  },
  {
    key: "mobility",
    visibilityKey: "mobility",
    label: "異動希望",
    description: "非公開固定です。公開プロフィールには表示しません。",
    placeholder: "半年以内にデータ領域への異動を相談したい",
    fixedPrivate: true,
  },
  {
    key: "preMeetingMemo",
    visibilityKey: "preMeetingMemo",
    label: "面談前メモ",
    description: "非公開固定です。MVP 1の面談支援で使う予定の本人メモです。",
    placeholder: "面談で相談したいこと、今後整理したいこと",
    fixedPrivate: true,
  },
];

type ProfileEditFormProps = {
  employee: EmployeeProfile;
};

export function ProfileEditForm({ employee }: ProfileEditFormProps) {
  const [draft, setDraft] = useState<ProfileDraft>(() => initialDraft(employee));
  const [errors, setErrors] = useState<string[]>([]);
  const [savedMessage, setSavedMessage] = useState("");
  const [confirmingKey, setConfirmingKey] = useState<VisibilityKey | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const summary = useMemo(() => {
    const publicItems = [
      ["顔写真", draft.visibility.photo],
      ["自己紹介", draft.visibility.selfIntroduction],
      ["社内経歴", draft.visibility.careerHistories],
      ["保有資格", draft.visibility.qualifications],
      ["得意領域", draft.visibility.strengths],
      ["伸ばしたいスキル", draft.visibility.skillsToGrow],
      ["希望キャリア 公開用コメント", draft.visibility.desiredCareerPublic],
    ];
    return {
      publicItems: publicItems.filter(([, visibility]) => visibility === "public").map(([label]) => label),
      privateItems: publicItems.filter(([, visibility]) => visibility !== "public").map(([label]) => label),
      fixedPrivateItems: ["現在の仕事内容", "希望キャリア 非公開コメント", "異動希望", "面談前メモ"],
    };
  }, [draft.visibility]);

  function update<K extends Exclude<keyof ProfileDraft, "visibility" | "updatedAt">>(key: K, value: ProfileDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSavedMessage("");
  }

  function requestToggle(key: VisibilityKey) {
    if (draft.visibility[key] === "public") {
      setVisibility(key, "private");
      return;
    }
    setConfirmingKey(key);
  }

  function confirmPublic() {
    if (!confirmingKey) {
      return;
    }
    setVisibility(confirmingKey, "public");
    setConfirmingKey(null);
  }

  function setVisibility(key: VisibilityKey, value: VisibilityStatus) {
    setErrors([]);
    setDraft((current) => ({
      ...current,
      visibility: { ...current.visibility, [key]: value },
    }));
    setSavedMessage("");
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors(["顔写真の形式が不正です。画像ファイルを選択してください。"]);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      update("photoUrl", String(reader.result));
      setErrors([]);
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    update("photoUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function save() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      setSavedMessage("");
      return;
    }

    const nextDraft = {
      ...draft,
      updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    window.localStorage.setItem(`${keyPrefix}${employee.id}`, JSON.stringify(nextDraft));
    setDraft(nextDraft);
    setSavedMessage("保存しました。リロード後も保存内容が再表示されます。");
  }

  return (
    <div className="space-y-6">
      <Card className="border-sky-100 bg-gradient-to-br from-white to-sky-50/60 shadow-none">
        <CardHeader>
          <CardTitle>プロフィール編集</CardTitle>
          <CardDescription>
            自分の情報を入力し、全社員に公開する項目だけを選びます。非公開固定の項目は公開プロフィールには表示されません。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="space-y-5">
            <PhotoEditor
              employee={employee}
              photoUrl={draft.photoUrl}
              visibility={draft.visibility.photo}
              onUrlChange={(value) => update("photoUrl", value)}
              onUpload={handleImageUpload}
              onRemove={removePhoto}
              onToggle={() => requestToggle("photo")}
              fileInputRef={fileInputRef}
            />

            <SaveReview summary={summary} />

            <Button type="button" variant="secondary" onClick={() => setShowPreview((value) => !value)} className="w-full">
              <Eye size={17} />
              公開プロフィールプレビュー
            </Button>
            {showPreview ? <PublicPreview draft={draft} employee={employee} /> : null}
          </section>

          <section className="space-y-4">
            {fields.map((field) => (
              <ProfileField
                key={field.key}
                field={field}
                value={String(draft[field.key])}
                visibility={draft.visibility[field.visibilityKey]}
                onChange={(value) => update(field.key, value)}
                onToggle={() => requestToggle(field.visibilityKey)}
              />
            ))}

            {errors.length > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-semibold">保存できません。理由を確認してください。</p>
                <ul className="mt-2 list-disc pl-5">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {savedMessage ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                {savedMessage}
              </div>
            ) : null}

            <Button type="button" onClick={save} className="w-full">
              <Save size={17} />
              保存
            </Button>
          </section>
        </CardContent>
      </Card>

      {confirmingKey ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <Badge variant="warning">公開設定の確認</Badge>
            <h2 className="mt-4 text-xl font-bold text-[#0f2f57]">この項目を公開しますか</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{publicToggleText}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setConfirmingKey(null)}>
                キャンセル
              </Button>
              <Button type="button" onClick={confirmPublic}>
                公開する
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PhotoEditor({
  employee,
  photoUrl,
  visibility,
  onUrlChange,
  onUpload,
  onRemove,
  onToggle,
  fileInputRef,
}: {
  employee: EmployeeProfile;
  photoUrl: string;
  visibility: VisibilityStatus;
  onUrlChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onToggle: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl || employee.photoUrl}
            alt={`${employee.fullName}の顔写真プレビュー`}
            className="size-28 rounded-3xl border border-slate-200 object-cover"
          />
          <div className="absolute -right-2 -top-2">
            <VisibilityBadge visibility={visibility} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold text-[#0f2f57]">{employee.fullName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {employee.department} / {employee.position}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="sky" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus size={17} />
              画像アップロード
            </Button>
            <Button type="button" variant="secondary" onClick={onRemove}>
              <Trash2 size={17} />
              画像削除
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
        </div>
      </div>
      <label className="mt-5 block text-sm font-semibold text-slate-700">
        顔写真URL
        <div className="relative mt-2">
          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <Input
            value={photoUrl}
            onChange={(event) => onUrlChange(event.target.value)}
            className="pl-10"
            placeholder="https://... または画像アップロード"
          />
        </div>
      </label>
      <div className="mt-4">
        <VisibilityToggle
          label={visibility === "public" ? "顔写真を公開中" : "顔写真を社員全体に公開する"}
          visibility={visibility}
          onToggle={onToggle}
        />
      </div>
    </div>
  );
}

function SaveReview({ summary }: { summary: { publicItems: string[]; privateItems: string[]; fixedPrivateItems: string[] } }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="font-semibold text-[#0f2f57]">保存前確認</p>
      <p className="mt-1 text-sm text-slate-500">保存すると、以下の公開状態で反映されます。</p>
      <ReviewGroup title="今回公開される項目" items={summary.publicItems} tone="public" />
      <ReviewGroup title="非公開のまま保存される項目" items={summary.privateItems} tone="private" />
      <ReviewGroup title="非公開固定の項目" items={summary.fixedPrivateItems} tone="fixed" />
    </div>
  );
}

function ReviewGroup({ title, items, tone }: { title: string; items: string[]; tone: "public" | "private" | "fixed" }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <Badge key={item} variant={tone === "public" ? "success" : tone === "fixed" ? "warning" : "default"}>
              {item}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-slate-400">なし</span>
        )}
      </div>
    </div>
  );
}

function ProfileField({
  field,
  value,
  visibility,
  onChange,
  onToggle,
}: {
  field: FieldConfig;
  value: string;
  visibility: VisibilityStatus;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-[#0f2f57]">{field.label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{field.description}</p>
        </div>
        <VisibilityBadge visibility={visibility} />
      </div>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className="mt-4"
        rows={field.rows ?? 4}
      />
      <div className="mt-4">
        {field.toggleable ? (
          <VisibilityToggle
            label={visibility === "public" ? "公開中。クリックで非公開に戻す" : "社員全体に公開する"}
            visibility={visibility}
            onToggle={onToggle}
          />
        ) : (
          <p className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            <LockKeyhole size={14} />
            {field.fixedPrivate ? "非公開固定" : "非公開"}
          </p>
        )}
      </div>
    </div>
  );
}

function VisibilityToggle({
  label,
  visibility,
  onToggle,
}: {
  label: string;
  visibility: VisibilityStatus;
  onToggle: () => void;
}) {
  const isPublic = visibility === "public";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 text-sm font-semibold transition ${
        isPublic
          ? "border-sky-200 bg-sky-50 text-sky-800"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span className={`relative h-5 w-9 rounded-full transition ${isPublic ? "bg-sky-500" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white transition ${isPublic ? "left-4" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

function VisibilityBadge({ visibility }: { visibility: VisibilityStatus }) {
  if (visibility === "public") {
    return (
      <Badge variant="success" className="w-fit">
        <Eye size={13} />
        公開中
      </Badge>
    );
  }

  if (visibility === "fixed_private") {
    return (
      <Badge variant="warning" className="w-fit">
        <LockKeyhole size={13} />
        非公開固定
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="w-fit">
      <EyeOff size={13} />
      非公開
    </Badge>
  );
}

function PublicPreview({ draft, employee }: { draft: ProfileDraft; employee: EmployeeProfile }) {
  const rows: [string, ReactNode, VisibilityStatus][] = [
    ["自己紹介", draft.selfIntroduction, draft.visibility.selfIntroduction],
    ["社内経歴", draft.careerHistories, draft.visibility.careerHistories],
    ["保有資格", draft.qualifications, draft.visibility.qualifications],
    ["得意領域", draft.strengths, draft.visibility.strengths],
    ["伸ばしたいスキル", draft.skillsToGrow, draft.visibility.skillsToGrow],
    ["希望キャリア 公開用コメント", draft.desiredCareerPublic, draft.visibility.desiredCareerPublic],
  ];

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-5">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={draft.visibility.photo === "public" ? draft.photoUrl || employee.photoUrl : employee.photoUrl}
          alt="公開プロフィールの顔写真"
          className="size-16 rounded-2xl object-cover"
        />
        <div>
          <p className="font-bold text-[#0f2f57]">{employee.fullName}</p>
          <p className="text-sm text-slate-500">
            {employee.department} / {employee.position}
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map(([label, value, visibility]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#0f2f57]">{label}</p>
              <VisibilityBadge visibility={visibility} />
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {visibility === "public" ? value : "公開プロフィールには表示されません。"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function initialDraft(employee: EmployeeProfile): ProfileDraft {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(`${keyPrefix}${employee.id}`);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProfileDraft> & { desiredCareer?: string };
      return normalizeDraft(employee, parsed);
    }
  }

  return normalizeDraft(employee, {});
}

function normalizeDraft(employee: EmployeeProfile, draft: Partial<ProfileDraft> & { desiredCareer?: string }): ProfileDraft {
  return {
    photoUrl: draft.photoUrl ?? employee.photoUrl,
    selfIntroduction: draft.selfIntroduction ?? `${employee.department}で${employee.position}を担当しています。`,
    currentWork: draft.currentWork ?? `${employee.focusTheme}を中心に担当しています。`,
    careerHistories:
      draft.careerHistories ??
      employee.careerHistories.map((history) => `${history.title}: ${history.summary}`).join("\n"),
    qualifications: draft.qualifications ?? employee.certifications.map((certification) => certification.name).join("、"),
    strengths: draft.strengths ?? employee.strengths.join("、"),
    skillsToGrow: draft.skillsToGrow ?? employee.careerPreference.skillsToDevelop.join("、"),
    desiredCareerPublic: draft.desiredCareerPublic ?? draft.desiredCareer ?? "",
    desiredCareerPrivate: draft.desiredCareerPrivate ?? "",
    mobility: draft.mobility ?? employee.careerPreference.mobility,
    preMeetingMemo: draft.preMeetingMemo ?? "",
    updatedAt: draft.updatedAt,
    visibility: {
      ...defaultVisibility(),
      ...draft.visibility,
      desiredCareerPrivate: "fixed_private",
      mobility: "fixed_private",
      preMeetingMemo: "fixed_private",
      currentWork: "private",
    },
  };
}

function defaultVisibility(): Record<VisibilityKey, VisibilityStatus> {
  return {
    photo: "public",
    selfIntroduction: "public",
    careerHistories: "public",
    qualifications: "public",
    strengths: "public",
    skillsToGrow: "private",
    desiredCareerPublic: "private",
    desiredCareerPrivate: "fixed_private",
    mobility: "fixed_private",
    preMeetingMemo: "fixed_private",
    currentWork: "private",
  };
}

function validate(draft: ProfileDraft) {
  const errors: string[] = [];
  if (!draft.photoUrl.trim()) {
    errors.push("顔写真が未入力です。画像をアップロードするかURLを入力してください。");
  }
  if (draft.photoUrl && !/^(https?:\/\/|data:image\/)/i.test(draft.photoUrl)) {
    errors.push("顔写真の形式が不正です。https URLまたは画像データURLを指定してください。");
  }
  if (!draft.selfIntroduction.trim()) {
    errors.push("自己紹介が未入力です。");
  }
  if (!draft.currentWork.trim()) {
    errors.push("現在の仕事内容が未入力です。");
  }
  if (!draft.strengths.trim()) {
    errors.push("得意領域が未入力です。");
  }
  return errors;
}
