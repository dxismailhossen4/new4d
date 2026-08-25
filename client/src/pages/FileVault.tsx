import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { PageMeta, SiteLayout } from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";
import { FileDown, FileUp, FolderLock, Loader2, ShieldCheck } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function readableSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.readAsDataURL(file);
  });
}

export default function FileVault() {
  const { user, loading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const utils = trpc.useUtils();
  const files = trpc.files.list.useQuery(undefined, { enabled: Boolean(user) });
  const upload = trpc.files.upload.useMutation({
    onSuccess: async () => {
      setSelectedFile(null);
      await utils.files.list.invalidate();
      toast.success("File stored securely.");
    },
    onError: error => toast.error(error.message || "Upload could not be completed."),
  });
  const download = trpc.files.downloadUrl.useMutation({
    onSuccess: data => window.open(data.url, "_blank", "noopener,noreferrer"),
    onError: error => toast.error(error.message || "File access could not be verified."),
  });

  const uploadLabel = useMemo(() => selectedFile ? `${selectedFile.name} · ${readableSize(selectedFile.size)}` : "Choose a document or image", [selectedFile]);

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return setSelectedFile(null);
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_BYTES) {
      event.target.value = "";
      toast.error("Use a JPG, PNG, WEBP, or PDF file no larger than 5 MB.");
      return;
    }
    setSelectedFile(file);
  };

  const submit = async () => {
    if (!selectedFile) return toast.error("Choose a file before uploading.");
    await upload.mutateAsync({
      fileName: selectedFile.name,
      contentType: selectedFile.type,
      contentBase64: await toBase64(selectedFile),
    });
  };

  return <SiteLayout><PageMeta title="Secure file vault" description="Upload and access your protected New4D documents." />
    <section className="border-b border-white/10 bg-[radial-gradient(circle_at_85%_0%,rgba(213,168,65,.16),transparent_30%),#060a15] pb-12 pt-32 sm:pt-40"><div className="container"><p className="eyebrow">Protected storage</p><h1 className="mt-3 font-display text-5xl text-ivory sm:text-6xl">Your secure file vault.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">Files are uploaded through the application server and stored privately. Only the authenticated owner can request access links.</p></div></section>
    <section className="container py-14 lg:py-20">{loading ? <div className="empty-state"><Loader2 className="animate-spin text-gold-300" /><p>Checking secure access…</p></div> : !user ? <div className="panel max-w-xl p-8"><FolderLock className="text-gold-300" size={28} /><h2 className="mt-5 font-display text-3xl text-ivory">Sign in to access files</h2><p className="mt-3 text-sm leading-6 text-slate-400">File storage uses the secure full-stack account session.</p><button className="btn-gold mt-6" onClick={() => startLogin()}>Sign in securely</button></div> : <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div className="panel h-fit p-7"><ShieldCheck className="text-gold-300" size={24} /><h2 className="mt-5 font-display text-3xl text-ivory">Upload a file</h2><p className="mt-3 text-sm leading-6 text-slate-400">JPG, PNG, WEBP, or PDF. Maximum 5 MB.</p><label className="mt-6 block cursor-pointer rounded-lg border border-dashed border-gold-300/35 bg-white/[.025] p-5 text-sm text-slate-300 transition hover:border-gold-300"><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={selectFile} /><FileUp className="mb-3 text-gold-300" size={20} />{uploadLabel}</label><button className="btn-gold mt-5" disabled={!selectedFile || upload.isPending} onClick={submit}>{upload.isPending ? "Storing securely…" : "Upload file"}</button></div><div><div className="flex items-end justify-between border-b border-white/10 pb-5"><div><p className="eyebrow">Stored files</p><h2 className="mt-2 font-display text-3xl text-ivory">Private archive</h2></div></div><div className="mt-5 space-y-3">{files.isLoading ? <div className="empty-state"><Loader2 className="animate-spin text-gold-300" /><p>Loading archive…</p></div> : files.data?.length ? files.data.map(file => <div className="panel flex items-center justify-between gap-4 p-5" key={file.id}><div className="min-w-0"><p className="truncate font-medium text-ivory">{file.originalName}</p><p className="mt-1 text-xs text-slate-500">{file.contentType} · {readableSize(file.byteSize)} · {new Date(file.createdAt).toLocaleDateString()}</p></div><button className="btn-quiet shrink-0" onClick={() => download.mutate({ fileId: file.id })} disabled={download.isPending}>Open <FileDown size={15} /></button></div>) : <div className="empty-state"><FolderLock className="text-gold-300" /><p>No files are stored in this archive yet.</p></div>}</div></div></div>}</section>
  </SiteLayout>;
}
