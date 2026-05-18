"use client";

import type { ChangeEvent, ReactNode, RefObject } from "react";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProfileDraft } from "@/hooks/use-profile-draft";
import {
  publicProfileFieldKeys,
  type Mvp0Profile,
  type ProfileFieldKey,
  type ProfileVisibilityStatus,
} from "@/lib/profile-storage";
import type { EmployeeProfile } from "@/types/talent";

type ProfileEditFormProps = {
  employee: EmployeeProfile;
};

type ProfileFieldConfig = {
  key: keyof Omit<Mvp0Profile, "visibility" | "updatedAt">;
  visibilityKey: ProfileFieldKey;
  title: string;
  eyebrow: string;
  description: string;
  placeholder: string;
  rows?: number;
  toggleable?: boolean;
  fixedPrivate?: boolean;
};

const publicToggleText =
  "この項目を公開すると、全社員が閲覧できるようになります。公開してもよろしいですか？";

const fieldSections: Array<{
  id: string;
  title: string;
  description: string;
  fields: ProfileFieldConfig[];
}> = [
  {
    id: "intro",
    title: "自己紹介",
    description: "他社員が最初に読むプロフィールです。担当領域や話しかけてほしいテーマを書きます。",
    fields: [
      {
        key: "selfIntroduction",
        visibilityKey: "selfIntroduction",
        title: "自己紹介",
        eyebrow: "公開プロフィールの中心",
        description: "あなたの役割、得意なこと、周囲に知ってほしいことを短くまとめます。",
        placeholder:
          "例: プロダクト開発部で決済領域の改善を担当しています。ユーザー課題の整理や関係者との合意形成が得意です。",
        rows: 5,
        toggleable: true,
      },
    ],
  },
  {
    id: "work",
    title: "現在の仕事内容",
    description: "いま何を担当しているかを整理します。自分の役割を言葉にしておくための項目です。",
    fields: [
      {
        key: "currentWork",
        visibilityKey: "currentWork",
        title: "現在の仕事内容",
        eyebrow: "自分の情報",
        description: "担当業務、責任範囲、最近取り組んでいるテーマを書きます。",
        placeholder:
          "例: 決済導線の改善、開発優先度の整理、CSから上がる問い合わせの分析を担当しています。",
        rows: 4,
      },
    ],
  },
  {
    id: "history",
    title: "社内経歴",
    description: "社内で積み上げてきた経験を整理します。公開するとキャリア参考情報になります。",
    fields: [
      {
        key: "careerHistories",
        visibilityKey: "careerHistories",
        title: "社内経歴",
        eyebrow: "Experience",
        description: "異動、担当変更、プロジェクト経験を時系列で書きます。",
        placeholder:
          "例:\n2024年4月 プロダクト開発部へ異動。決済基盤の改善を担当。\n2025年1月 新規オンボーディング改善プロジェクトをリード。",
        rows: 6,
        toggleable: true,
      },
    ],
  },
  {
    id: "skills",
    title: "資格・得意領域",
    description: "社内で相談されやすくなる情報です。公開範囲を見ながら整えます。",
    fields: [
      {
        key: "qualifications",
        visibilityKey: "qualifications",
        title: "保有資格",
        eyebrow: "Qualifications",
        description: "資格、認定、研修修了などをカンマ区切りまたは改行で入力します。",
        placeholder: "例: 認定スクラムプロダクトオーナー、応用情報技術者、TOEIC 850",
        rows: 3,
        toggleable: true,
      },
      {
        key: "strengths",
        visibilityKey: "strengths",
        title: "得意領域",
        eyebrow: "Strengths",
        description: "周囲から相談してほしい領域や、得意な仕事の進め方を書きます。",
        placeholder: "例: 課題構造化、合意形成、顧客理解、プロジェクト推進",
        rows: 3,
        toggleable: true,
      },
      {
        key: "skillsToGrow",
        visibilityKey: "skillsToGrow",
        title: "伸ばしたいスキル",
        eyebrow: "Growth",
        description: "これから伸ばしたい力を書きます。公開すると学びたい方向性が周囲に伝わります。",
        placeholder: "例: プロダクト戦略、データ分析、ピープルマネジメント、英語でのファシリテーション",
        rows: 3,
        toggleable: true,
      },
    ],
  },
  {
    id: "future",
    title: "将来やりたいこと",
    description: "公開できるキャリア意向と、本人だけの非公開メモを分けて書けます。",
    fields: [
      {
        key: "desiredCareerPublic",
        visibilityKey: "desiredCareerPublic",
        title: "希望キャリア 公開用コメント",
        eyebrow: "公開できる将来像",
        description: "他社員にも見せてよい将来像を記入してください。協業や相談につながる粒度がおすすめです。",
        placeholder: "例: 将来的にはプロダクト戦略や新規事業の立ち上げに挑戦したいです。",
        rows: 4,
        toggleable: true,
      },
      {
        key: "desiredCareerPrivate",
        visibilityKey: "desiredCareerPrivate",
        title: "希望キャリア 非公開コメント",
        eyebrow: "非公開の本音メモ",
        description: "上司や人事と相談したい本音のキャリア希望を記入してください。社員全体には公開されません。",
        placeholder: "例: 現部署での成長機会に不安があり、異動も含めて相談したい。",
        rows: 4,
        fixedPrivate: true,
      },
    ],
  },
  {
    id: "private",
    title: "非公開メモ",
    description: "社員全体には公開しない情報です。自分の考えや相談したいことを整理するために使います。",
    fields: [
      {
        key: "mobility",
        visibilityKey: "mobility",
        title: "異動希望",
        eyebrow: "非公開固定",
        description: "この情報はセンシティブなため、社員全体には公開されません。",
        placeholder: "例: 半年以内にデータ領域への異動を相談したい。",
        rows: 3,
        fixedPrivate: true,
      },
      {
        key: "preMeetingMemo",
        visibilityKey: "preMeetingMemo",
        title: "面談前メモ",
        eyebrow: "非公開固定",
        description: "上司との面談準備に使う情報です。社員全体には公開されません。",
        placeholder: "例: 今の業務負荷、今後挑戦したい仕事、キャリアの不安について相談したい。",
        rows: 4,
        fixedPrivate: true,
      },
    ],
  },
];

const fieldLabels: Record<ProfileFieldKey, string> = {
  photo: "顔写真",
  selfIntroduction: "自己紹介",
  currentWork: "現在の仕事内容",
  careerHistories: "社内経歴",
  qualifications: "保有資格",
  strengths: "得意領域",
  skillsToGrow: "伸ばしたいスキル",
  desiredCareerPublic: "希望キャリア 公開用コメント",
  desiredCareerPrivate: "希望キャリア 非公開コメント",
  mobility: "異動希望",
  preMeetingMemo: "面談前メモ",
};

export function ProfileEditForm({ employee }: ProfileEditFormProps) {
  const {
    draft,
    updateField,
    updateVisibility,
    save,
    saveState,
    saveError,
    hasUnsavedChanges,
    completion,
    visibilitySummary,
  } = useProfileDraft(employee);
  const [errors, setErrors] = useState<string[]>([]);
  const [confirmingKey, setConfirmingKey] = useState<ProfileFieldKey | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveReview = useMemo(() => {
    const publicItems = publicProfileFieldKeys
      .filter((key) => draft.visibility[key] === "public")
      .map((key) => fieldLabels[key]);
    const privateItems = publicProfileFieldKeys
      .filter((key) => draft.visibility[key] !== "public")
      .map((key) => fieldLabels[key]);

    return {
      publicItems,
      privateItems,
      fixedPrivateItems: ["希望キャリア 非公開コメント", "異動希望", "面談前メモ"],
    };
  }, [draft.visibility]);

  function requestToggle(key: ProfileFieldKey) {
    if (draft.visibility[key] === "public") {
      updateVisibility(key, "private");
      return;
    }
    setConfirmingKey(key);
  }

  function confirmPublic() {
    if (!confirmingKey) return;
    updateVisibility(confirmingKey, "public");
    setConfirmingKey(null);
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors(["顔写真の形式が不正です。画像ファイルを選択してください。"]);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("photoUrl", String(reader.result));
      setErrors([]);
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    updateField("photoUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (nextErrors.length > 0) return;
    await save();
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="rounded-[1.5rem] border border-sky-100 bg-gradient-to-br from-white via-white to-sky-50 p-4 shadow-sm sm:rounded-[2rem] sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-center">
          <PhotoPanel
            employee={employee}
            draft={draft}
            fileInputRef={fileInputRef}
            onUpload={handleImageUpload}
            onRemove={removePhoto}
            onToggle={() => requestToggle("photo")}
          />
          <div className="min-w-0">
            <Badge variant="blue" className="w-fit">
              <Sparkles size={13} />
              プロフィールを育てる
            </Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0f2f57] md:mt-4 md:text-3xl">
              {employee.fullName}さんの社内プロフィール
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:mt-3 md:text-base md:leading-7">
              公開したい情報だけを選びながら、他社員に伝わるプロフィールを整えます。非公開固定の項目は公開プロフィールには表示されません。
            </p>
            <div className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
              <GuideLabel
                icon={<Eye size={15} />}
                title="公開中"
                description="公開プロフィールに表示されます"
                tone="public"
              />
              <GuideLabel
                icon={<EyeOff size={15} />}
                title="非公開"
                description="自分のみが確認できます"
                tone="private"
              />
              <GuideLabel
                icon={<LockKeyhole size={15} />}
                title="非公開固定"
                description="社員全体には公開されません"
                tone="fixed"
              />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="完成度" value={`${completion.percentage}%`} tone="blue" />
              <Metric label="公開中" value={`${visibilitySummary.publicCount}項目`} tone="green" />
              <Metric
                label="非公開"
                value={`${visibilitySummary.privateCount + visibilitySummary.fixedPrivateCount}項目`}
                tone="slate"
              />
            </div>
            {hasUnsavedChanges ? (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                <AlertCircle size={17} />
                未保存の変更があります
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
        <main className="space-y-6 md:space-y-8">
          <CompletionGuide completion={completion} />

          {fieldSections.map((section) => (
            <section key={section.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-7">
              <div className="mb-5 max-w-2xl sm:mb-6">
                <p className="text-sm font-semibold text-sky-600">{section.title}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#0f2f57] md:mt-2 md:text-2xl">{section.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base md:leading-7">{section.description}</p>
              </div>
              <div className="space-y-5">
                {section.fields.map((field) => (
                  <ProfileField
                    key={field.key}
                    field={field}
                    value={String(draft[field.key] ?? "")}
                    visibility={draft.visibility[field.visibilityKey]}
                    onChange={(value) => updateField(field.key, value)}
                    onToggle={() => requestToggle(field.visibilityKey)}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>

        <aside className="space-y-5 xl:sticky xl:top-28">
          <PublicPreview employee={employee} draft={draft} />
          <SaveReview review={saveReview} />
          {errors.length > 0 ? <ErrorPanel errors={errors} /> : null}
          <SavePanel
            saveState={saveState}
            saveError={saveError}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={handleSave}
          />
        </aside>
      </div>

      <div className="sticky bottom-24 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:hidden">
        <Button type="button" onClick={handleSave} disabled={saveState === "saving"} className="w-full">
          <Save size={17} />
          {saveState === "saving" ? "保存中..." : "保存する"}
        </Button>
      </div>

      {confirmingKey ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/35 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <Badge variant="warning">公開設定の確認</Badge>
            <h2 className="mt-4 text-xl font-bold text-[#0f2f57]">
              {fieldLabels[confirmingKey]}を公開しますか
            </h2>
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

function PhotoPanel({
  employee,
  draft,
  fileInputRef,
  onUpload,
  onRemove,
  onToggle,
}: {
  employee: EmployeeProfile;
  draft: Mvp0Profile;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:rounded-3xl sm:p-5">
      <div className="relative mx-auto w-fit">
        {draft.photoUrl || employee.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={draft.photoUrl || employee.photoUrl}
            alt={`${employee.fullName}の顔写真プレビュー`}
            className="size-36 rounded-[1.5rem] border border-slate-200 object-cover ring-4 ring-sky-50 sm:size-40 sm:rounded-[1.75rem]"
          />
        ) : (
          <DefaultAvatar
            name={employee.fullName}
            className="size-36 rounded-[1.5rem] border border-slate-200 ring-4 ring-sky-50 sm:size-40 sm:rounded-[1.75rem]"
          />
        )}
        <div className="absolute -right-2 -top-2">
          <VisibilityBadge visibility={draft.visibility.photo} />
        </div>
      </div>
      <div className="mt-5 grid gap-2">
        <Button type="button" variant="sky" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus size={17} />
          画像を選ぶ
        </Button>
        <Button type="button" variant="secondary" onClick={onRemove}>
          <Trash2 size={17} />
          画像を削除
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
      </div>
      <div className="mt-4">
        <VisibilityToggle
          visibility={draft.visibility.photo}
          label={draft.visibility.photo === "public" ? "顔写真は公開中" : "顔写真を公開する"}
          onToggle={onToggle}
        />
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "blue" | "green" | "slate" }) {
  const toneClass =
    tone === "blue"
      ? "border-sky-100 bg-sky-50 text-sky-800"
      : tone === "green"
        ? "border-emerald-100 bg-emerald-50 text-emerald-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function GuideLabel({
  icon,
  title,
  description,
  tone,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  tone: "public" | "private" | "fixed";
}) {
  const toneClass =
    tone === "public"
      ? "border-emerald-100 bg-emerald-50 text-emerald-900"
      : tone === "fixed"
        ? "border-amber-100 bg-amber-50 text-amber-900"
        : "border-slate-200 bg-white text-slate-700";

  return (
    <div className={`rounded-2xl border p-3 ${toneClass}`}>
      <p className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </p>
      <p className="mt-1 text-xs leading-5 opacity-80">{description}</p>
    </div>
  );
}

function CompletionGuide({
  completion,
}: {
  completion: {
    percentage: number;
    missing: Array<{ key: string; label: string; help: string }>;
  };
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-600">Completion guide</p>
          <h3 className="mt-2 text-xl font-semibold text-[#0f2f57] md:text-2xl">完成度を上げるために</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            未入力の項目を埋めると、社内プロフィールとして伝わりやすくなります。
          </p>
        </div>
        <div className="min-w-32 rounded-2xl bg-[#0f2f57] px-5 py-4 text-center text-white">
          <p className="text-sm">完成度</p>
          <p className="text-3xl font-bold">{completion.percentage}%</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {completion.missing.length > 0 ? (
          completion.missing.map((item) => (
            <div key={item.key} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-900">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-amber-800">{item.help}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:col-span-2">
            <p className="flex items-center gap-2 font-semibold text-emerald-900">
              <CheckCircle2 size={18} />
              基本項目は入力済みです
            </p>
            <p className="mt-1 text-sm text-emerald-800">公開プロフィールの見え方を確認して保存してください。</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ProfileField({
  field,
  value,
  visibility,
  onChange,
  onToggle,
}: {
  field: ProfileFieldConfig;
  value: string;
  visibility: ProfileVisibilityStatus;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-4 sm:rounded-3xl sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">{field.eyebrow}</p>
          <h4 className="mt-1 text-lg font-semibold text-[#0f2f57]">{field.title}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">{field.description}</p>
        </div>
        <VisibilityBadge visibility={visibility} />
      </div>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className="mt-4 min-h-28 bg-white text-base leading-7"
        rows={field.rows ?? 4}
      />
      <div className="mt-4">
        {field.toggleable ? (
          <VisibilityToggle
            visibility={visibility}
            label={visibility === "public" ? "公開中。押すと非公開" : "社員全体に公開する"}
            onToggle={onToggle}
          />
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500">
            <LockKeyhole size={15} />
            {field.fixedPrivate ? "非公開固定" : "非公開"}
          </div>
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
  visibility: ProfileVisibilityStatus;
  onToggle: () => void;
}) {
  const isPublic = visibility === "public";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition sm:w-auto ${
        isPublic
          ? "border-sky-200 bg-sky-50 text-sky-800"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${isPublic ? "bg-sky-500" : "bg-slate-300"}`}>
        <span
          className={`absolute top-1 size-4 rounded-full bg-white transition ${isPublic ? "left-6" : "left-1"}`}
        />
      </span>
    </button>
  );
}

function VisibilityBadge({ visibility }: { visibility: ProfileVisibilityStatus }) {
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

function PublicPreview({ employee, draft }: { employee: EmployeeProfile; draft: Mvp0Profile }) {
  const rows = [
    { key: "selfIntroduction", label: "自己紹介", value: draft.selfIntroduction },
    { key: "careerHistories", label: "社内経歴", value: draft.careerHistories },
    { key: "qualifications", label: "保有資格", value: draft.qualifications },
    { key: "strengths", label: "得意領域", value: draft.strengths },
    { key: "skillsToGrow", label: "伸ばしたいスキル", value: draft.skillsToGrow },
    { key: "desiredCareerPublic", label: "将来やりたいこと", value: draft.desiredCareerPublic },
  ].filter((row) => draft.visibility[row.key as ProfileFieldKey] === "public" && row.value.trim());

  return (
    <section className="rounded-[2rem] border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-sky-600">Live preview</p>
          <h3 className="mt-1 text-xl font-semibold text-[#0f2f57]">他社員からの見え方</h3>
          <p className="mt-1 text-sm text-slate-500">
            プレビュー：他社員から見える表示を確認できます。
          </p>
        </div>
        <Badge variant="blue">リアルタイム</Badge>
      </div>
      <div className="mt-5 rounded-3xl bg-slate-50 p-4">
        <div className="flex gap-4">
          {draft.visibility.photo === "public" && (draft.photoUrl || employee.photoUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={draft.photoUrl || employee.photoUrl}
              alt="公開プロフィールの顔写真"
              className="size-20 rounded-2xl object-cover"
            />
          ) : (
            <DefaultAvatar name={employee.fullName} className="size-20 rounded-2xl" />
          )}
          <div className="min-w-0">
            <p className="font-bold text-[#0f2f57]">{employee.fullName}</p>
            <p className="mt-1 text-sm text-slate-500">
              {employee.department} / {employee.position}
            </p>
            <p className="mt-2 text-xs text-slate-500">非公開項目と空項目は表示されません。</p>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div key={row.key} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#0f2f57]">{row.label}</p>
                <Badge variant="success">公開中</Badge>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{row.value}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <Camera className="mx-auto text-slate-400" size={24} />
            <p className="mt-2 font-semibold text-[#0f2f57]">公開される追加情報はまだありません</p>
            <p className="mt-1 text-sm text-slate-500">公開トグルをオンにするとここに表示されます。</p>
          </div>
        )}
      </div>
      <Button asChild variant="secondary" className="mt-4 w-full">
        <Link href={`/employees/${employee.id}`}>
          <Eye size={17} />
          実際の公開プロフィールを開く
        </Link>
      </Button>
    </section>
  );
}

function SaveReview({
  review,
}: {
  review: { publicItems: string[]; privateItems: string[]; fixedPrivateItems: string[] };
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#0f2f57]">保存前確認</h3>
      <p className="mt-1 text-sm text-slate-500">保存すると、この公開状態で反映されます。</p>
      <ReviewGroup title="今回公開される項目" items={review.publicItems} variant="success" />
      <ReviewGroup title="非公開のまま保存される項目" items={review.privateItems} variant="default" />
      <ReviewGroup title="非公開固定の項目" items={review.fixedPrivateItems} variant="warning" />
    </section>
  );
}

function ReviewGroup({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "success" | "default" | "warning";
}) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <Badge key={item} variant={variant}>
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

function ErrorPanel({ errors }: { errors: string[] }) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <p className="font-semibold">保存できません。理由を確認してください。</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

function SavePanel({
  saveState,
  saveError,
  hasUnsavedChanges,
  onSave,
}: {
  saveState: "idle" | "saving" | "saved" | "error";
  saveError: string;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}) {
  return (
    <section className="hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:block">
      {hasUnsavedChanges ? (
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700">
          <AlertCircle size={16} />
          未保存の変更があります
        </p>
      ) : saveState === "saved" ? (
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={16} />
          保存しました
        </p>
      ) : saveState === "error" ? (
        <p className="mb-3 flex items-start gap-2 text-sm font-semibold text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {saveError || "保存に失敗しました。"}
        </p>
      ) : (
        <p className="mb-3 text-sm text-slate-500">変更後は保存してください。</p>
      )}
      <Button type="button" onClick={onSave} disabled={saveState === "saving"} className="w-full">
        <Save size={17} />
        {saveState === "saving" ? "保存中..." : "保存する"}
      </Button>
    </section>
  );
}

function DefaultAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div className={`flex shrink-0 items-center justify-center bg-slate-100 text-xl font-bold text-slate-500 ${className ?? ""}`}>
      {name.slice(0, 1)}
    </div>
  );
}

function validate(draft: Mvp0Profile) {
  const errors: string[] = [];
  if (!draft.photoUrl.trim()) {
    errors.push("顔写真が未入力です。画像をアップロードしてください。");
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
