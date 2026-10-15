"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { projectMatchScore } from "@/lib/ai";
import { useAppState } from "@/lib/AppState";
import { Avatar, Badge, Button, Card, EmptyState, Modal, ToastBanner } from "@/components/ui";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>(); 
  const { projects, profiles, requests, currentProfileId, addRequest, resolveRequest } = useAppState(); 
  const [open, setOpen] = useState(false); 
  const [toast, setToast] = useState<string | null>(null);

  const project = projects.find(item => item.id === id); 
  const current = profiles.find(item => item.id === currentProfileId);

  if (!project || !current) return <section className="mx-auto max-w-content px-5 py-24 text-center md:px-8"><p className="eyebrow">Not found</p><h1 className="mt-3 font-display text-5xl tracking-editorial">This project is not here.</h1><Link href="/projects" className="mt-7 inline-block text-sm font-bold text-terra hover:text-terra-dark">Return to projects →</Link></section>;

  const members = project.memberIds.map(memberId => profiles.find(item => item.id === memberId)).filter(Boolean); 
  const isHead = project.authorId === currentProfileId; 
  const joined = project.memberIds.includes(currentProfileId); 
  const myRequest = requests.find(item => item.projectId === project.id && item.profileId === currentProfileId); 
  const pending = requests.filter(item => item.projectId === project.id && item.status === "pending"); 
  const candidates = profiles.filter(profile => !project.memberIds.includes(profile.id));

  const request = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const note = String(new FormData(event.currentTarget).get("note") || "I’d love to learn more and see how I can contribute.");
    setOpen(false);
    await addRequest({ id: `request-${Date.now()}`, projectId: project.id, profileId: currentProfileId, status: "pending", note });
    setToast("Your request to join has been sent to the project head.");
  };

  const handleResolve = async (requestId: string, decision: "accepted" | "declined") => {
    await resolveRequest(requestId, decision);
    setToast(decision === "accepted" ? "Member added to project team!" : "Request declined.");
  };

  return <section className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-18">
    <Link href="/projects" className="text-sm font-semibold text-terra hover:text-terra-dark transition-colors">← All projects</Link>
    {toast && <div className="mt-4"><ToastBanner message={toast} onClose={() => setToast(null)} /></div>}
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div>
        <div className="flex flex-wrap gap-3"><Badge tone="accent">{project.domain}</Badge><Badge>{project.stage}</Badge></div>
        <h1 className="mt-5 font-display text-5xl tracking-editorial md:text-7xl">{project.title}</h1>
        <p className="mt-6 max-w-3xl text-xl leading-8 text-muted">{project.summary}</p>
        <div className="mt-10 space-y-10">
          <section><p className="eyebrow">The problem</p><h2 className="mt-3 font-display text-3xl tracking-editorial">Why this work matters</h2><p className="mt-4 max-w-3xl leading-7 text-muted">{project.problemStatement}</p></section>
          <section className="border-t border-line pt-8"><p className="eyebrow">Overview</p><p className="mt-4 max-w-3xl leading-7 text-muted">{project.overview}</p></section>
          <section className="border-t border-line pt-8"><p className="eyebrow">Objectives</p><ul className="mt-4 grid gap-3 sm:grid-cols-3">{project.objectives.map((item, index) => <li key={item} className="border-l-2 border-terra pl-4 text-sm leading-6">0{index + 1}. {item}</li>)}</ul></section>
          <section className="border-t border-line pt-8"><p className="eyebrow">How we’ll work</p><div className="mt-6 space-y-5">{project.timeline.map((item, index) => <div key={item.phase} className="grid gap-2 border-b border-line pb-5 sm:grid-cols-[3rem_11rem_1fr]"><span className="font-display text-xl text-terra">0{index + 1}</span><h3 className="font-semibold">{item.phase}</h3><p className="text-sm leading-6 text-muted">{item.detail}</p></div>)}</div></section>
        </div>
      </div>
      <aside className="space-y-5">
        <Card className="p-6 lg:sticky lg:top-6">
          <p className="text-sm font-semibold text-muted">Join the team</p>
          <p className="mt-2 font-display text-3xl tracking-editorial">Bring a useful point of view.</p>
          {isHead ? <p className="mt-4 text-sm leading-6 text-muted">You are the project head. Review incoming requests below.</p> : joined ? <Link href={`/projects/${project.id}/chat`} className="mt-6 block"><Button className="w-full">Open team workspace</Button></Link> : <Button className="mt-6 w-full" onClick={() => setOpen(true)} disabled={Boolean(myRequest)}>{myRequest?.status === "pending" ? "Request pending" : myRequest?.status === "declined" ? "Request declined" : "Request to join"}</Button>}
          <div className="mt-6 space-y-4 border-t border-line pt-5 text-sm"><div className="flex justify-between"><span className="text-muted">Difficulty</span><b>{project.difficulty}</b></div><div className="flex justify-between"><span className="text-muted">Commitment</span><b>{project.commitment}</b></div><div className="flex justify-between"><span className="text-muted">Team</span><b>{project.members} of {project.teamSize}</b></div></div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-2xl tracking-editorial">Current members</h2>
          <div className="mt-5 space-y-4">{members.map(member => member && <Link href={`/profile/${member.id}`} key={member.id} className="flex items-center gap-3 transition-opacity hover:opacity-80"><Avatar initials={member.initials} color={member.color} photo={member.photo}/><div><p className="text-sm font-bold">{member.name}</p><p className="text-xs text-muted">{member.role}</p></div></Link>)}</div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-2xl tracking-editorial">Tools & skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">{project.techStack.map(item => <Badge key={item} tone="accent">{item}</Badge>)}{project.skills.map(item => <Badge key={item}>{item}</Badge>)}</div>
        </Card>
        <Card className="p-6">
          <p className="eyebrow">AI team match</p>
          <h2 className="mt-2 font-display text-2xl tracking-editorial">Potential collaborators</h2>
          {candidates.length ? <div className="mt-5 space-y-4">{candidates.slice(0, 3).map(profile => <Link href={`/profile/${profile.id}`} key={profile.id} className="flex items-center justify-between border-t border-line pt-4 transition-opacity hover:opacity-80"><div className="flex items-center gap-3"><Avatar initials={profile.initials} color={profile.color} photo={profile.photo}/><div><p className="text-sm font-bold">{profile.name}</p><p className="text-xs text-muted">{profile.role}</p></div></div><span className="text-xs font-bold text-terra">{projectMatchScore(profile, project)}%</span></Link>)}</div> : <p className="mt-4 text-xs text-muted">All active profiles have joined this team!</p>}
        </Card>
        {isHead && <Card className="p-6"><p className="eyebrow">Project head</p><h2 className="mt-2 font-display text-2xl tracking-editorial">Incoming requests</h2>{pending.length ? <div className="mt-5 space-y-5">{pending.map(item => { const profile = profiles.find(person => person.id === item.profileId); return profile ? <div key={item.id} className="border-t border-line pt-4"><Link href={`/profile/${profile.id}`} className="flex items-center justify-between"><div className="flex items-center gap-3"><Avatar initials={profile.initials} color={profile.color} photo={profile.photo}/><div><p className="text-sm font-bold">{profile.name}</p><p className="text-xs text-muted">{profile.role}</p></div></div><span className="text-xs font-bold text-terra">{projectMatchScore(profile, project)}%</span></Link><p className="mt-3 text-sm leading-6 text-muted">“{item.note}”</p><div className="mt-4 flex gap-2"><Button className="min-h-9 px-3 text-xs" onClick={() => handleResolve(item.id, "accepted")}>Accept</Button><Button className="min-h-9 px-3 text-xs" variant="secondary" onClick={() => handleResolve(item.id, "declined")}>Reject</Button></div></div> : null; })}</div> : <div className="mt-4"><EmptyState icon="✉" title="No incoming requests" description="No pending requests right now. Future team members will appear here when they request to join." /></div>}</Card>}
      </aside>
    </div>
    <Modal open={open} onClose={() => setOpen(false)} title={`Join ${project.title}`}><form onSubmit={request}><div className="-mt-1 flex items-center gap-3 rounded-xl bg-cream p-4"><Avatar initials={current.initials} color={current.color} photo={current.photo}/><div><p className="text-sm font-bold">{current.name}</p><p className="text-xs text-muted">{current.role} · {current.availability}</p></div></div><p className="mt-4 text-sm leading-6 text-muted">This mini-profile accompanies your request to the project head.</p><label className="mt-5 block text-sm font-semibold">Your note<textarea name="note" required rows={5} className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-terra focus:ring-2 focus:ring-terra/20" defaultValue="I’d love to learn more and see how I can contribute."/></label><div className="mt-5 flex justify-end gap-3"><Button type="button" variant="text" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Send request</Button></div></form></Modal>
  </section>;
}
