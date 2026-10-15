"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { useAppState } from "@/lib/AppState";
import { Avatar, Badge, Button, EmptyState } from "@/components/ui";
import type { Message } from "@/lib/mockData";

const time = (stamp: string) => new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(stamp));

export default function ChatPage() {
  const { id } = useParams<{ id: string }>(); 
  const { projects, profiles, messages, currentProfileId, sendMessage } = useAppState(); 
  const [text, setText] = useState(""); 
  const [attachment, setAttachment] = useState<Message["attachment"]>(); 
  const fileInput = useRef<HTMLInputElement>(null); 
  const imageInput = useRef<HTMLInputElement>(null); 
  const project = projects.find(item => item.id === id); 
  const current = profiles.find(item => item.id === currentProfileId); 
  const joined = projects.filter(item => item.memberIds.includes(currentProfileId));

  if (!project || !current || !project.memberIds.includes(currentProfileId)) return <section className="mx-auto max-w-content px-5 py-24 text-center md:px-8"><p className="eyebrow">Private workspace</p><h1 className="mt-3 font-display text-5xl tracking-editorial">This room is for project members.</h1><Link href={`/projects/${id}`} className="mt-7 inline-block text-sm font-bold text-terra hover:text-terra-dark transition-colors">Return to project →</Link></section>;

  const thread = messages.filter(message => message.projectId === project.id); 
  const attachFile = (type: "file" | "image", event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) setAttachment({ type, name: file.name }); event.target.value = ""; };
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return;
    const content = text.trim() || "Shared an attachment";
    const pendingAttachment = attachment;
    setText("");
    setAttachment(undefined);
    await sendMessage({ id: `message-${Date.now()}`, projectId: project.id, fromId: currentProfileId, content, sentAt: new Date().toISOString(), attachment: pendingAttachment });
  };

  return <section className="mx-auto max-w-content px-5 py-8 md:px-8">
    <div className="overflow-hidden rounded-card border border-line bg-paper shadow-sm">
      <div className="grid min-h-[680px] lg:grid-cols-[15rem_1fr]">
        <aside className="border-b border-line bg-cream p-5 lg:border-b-0 lg:border-r">
          <p className="eyebrow">Your workspaces</p>
          <div className="mt-4 space-y-1">
            {joined.length ? (
              joined.map(item => <Link href={`/projects/${item.id}/chat`} key={item.id} className={`block rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${item.id === project.id ? "bg-terra-pale text-terra-dark" : "text-muted hover:bg-paper hover:text-ink"}`}>{item.title}<span className="mt-1 block text-xs font-normal opacity-75">{item.domain}</span></Link>)
            ) : (
              <p className="mt-2 text-xs text-muted">No workspaces yet.</p>
            )}
          </div>
          <Link href={`/projects/${project.id}`} className="mt-8 inline-block text-xs font-bold text-terra hover:text-terra-dark transition-colors">← Project overview</Link>
        </aside>
        <div className="flex min-h-[610px] flex-col">
          <header className="flex items-center justify-between border-b border-line px-5 py-5">
            <div>
              <h1 className="font-display text-3xl tracking-editorial">{project.title}</h1>
              <p className="mt-1 text-xs text-muted">Private team conversation</p>
            </div>
            <Badge tone="accent">{project.members} members</Badge>
          </header>
          <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-7">
            {thread.length ? (
              thread.map(message => { 
                const author = profiles.find(item => item.id === message.fromId); 
                const own = message.fromId === currentProfileId; 
                return author ? (
                  <div key={message.id} className={`flex gap-3 ${own ? "flex-row-reverse" : ""}`}>
                    <Avatar initials={author.initials} color={author.color} photo={author.photo} size="sm"/>
                    <div className={`max-w-[78%] ${own ? "text-right" : ""}`}>
                      <div className={`inline-block rounded-card px-4 py-3 text-left text-sm leading-6 transition-all duration-200 ${own ? "bg-terra text-white" : "bg-cream text-ink"}`}>
                        <p>{message.content}</p>
                        {message.attachment && <div className={`mt-2 rounded-lg border px-3 py-2 text-xs ${own ? "border-paper/40" : "border-line"}`}>{message.attachment.type === "image" ? "Image" : message.attachment.type === "code" ? "Code snippet" : "File"}: {message.attachment.name}</div>}
                      </div>
                      <p className="mt-1 text-xs text-muted">{own ? "You · " : `${author.name} · `}{time(message.sentAt)}</p>
                    </div>
                  </div>
                ) : null; 
              })
            ) : (
              <div className="my-auto py-12">
                <EmptyState icon="💬" title="Welcome to the team room!" description="No messages sent yet. Kick off the project conversation by saying hello or sharing a file." />
              </div>
            )}
          </div>
          <form onSubmit={send} className="border-t border-line p-4 md:p-5">
            <input ref={fileInput} type="file" className="hidden" onChange={event => attachFile("file", event)}/>
            <input ref={imageInput} type="file" accept="image/*" className="hidden" onChange={event => attachFile("image", event)}/>
            {attachment && <div className="mb-3 flex items-center justify-between rounded-lg bg-cream px-3 py-2 text-xs"><span>{attachment.type === "code" ? "Code snippet attached" : attachment.name}</span><button type="button" className="font-bold text-terra" onClick={() => setAttachment(undefined)}>Remove</button></div>}
            <div className="flex gap-2">
              <textarea value={text} onChange={event => setText(event.target.value)} rows={2} placeholder="Write to the team…" className="min-w-0 flex-1 resize-none rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-terra focus:ring-2 focus:ring-terra/20"/>
              <Button type="submit" className="self-end">Send</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-muted">
              <button type="button" onClick={() => fileInput.current?.click()} className="hover:text-terra transition-colors">＋ File</button>
              <button type="button" onClick={() => imageInput.current?.click()} className="hover:text-terra transition-colors">＋ Image</button>
              <button type="button" onClick={() => setAttachment({ type: "code", name: "Code snippet" })} className="hover:text-terra transition-colors">&lt;/&gt; Code snippet</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>;
}
