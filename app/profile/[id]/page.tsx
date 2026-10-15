"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppState } from "@/lib/AppState";
import { Avatar, Badge, Button, Card, EmptyState } from "@/components/ui";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>(); 
  const { profiles, projects, currentProfileId } = useAppState(); 
  const profile = profiles.find(item => item.id === id);

  if (!profile) return <section className="mx-auto max-w-content px-5 py-24 text-center md:px-8"><p className="eyebrow">Not found</p><h1 className="mt-3 font-display text-5xl tracking-editorial">This profile is not here.</h1><Link href="/projects" className="mt-7 inline-block text-sm font-bold text-terra hover:text-terra-dark transition-colors">Explore projects →</Link></section>;

  const memberProjects = projects.filter(project => project.memberIds.includes(profile.id));

  return <section className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-18">
    <Link href="/projects" className="text-sm font-semibold text-terra hover:text-terra-dark transition-colors">← Discover projects</Link>
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div>
        <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-center">
          <Avatar initials={profile.initials} color={profile.color} photo={profile.photo} size="lg"/>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-5xl tracking-editorial">{profile.name}</h1>
              <Badge tone="accent">{profile.availability}</Badge>
            </div>
            <p className="mt-2 text-sm font-semibold">{profile.role}</p>
            <p className="mt-1 text-sm text-muted">{profile.department} · {profile.year} · {profile.location}</p>
          </div>
          {profile.id === currentProfileId && <Link href="/profile/edit" className="sm:ml-auto"><Button variant="secondary">Edit profile</Button></Link>}
        </div>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">{profile.bio}</p>
        <section className="mt-12">
          <p className="eyebrow">Skills</p>
          {profile.skillLevels.length ? (
            <div className="mt-5 space-y-5">{profile.skillLevels.map(item => <div key={item.skill}><div className="mb-2 flex justify-between text-sm"><span className="font-semibold">{item.skill}</span><span className="text-muted">{item.level}%</span></div><div className="h-2 overflow-hidden rounded-full bg-cream"><div className="h-full rounded-full bg-terra transition-all duration-300" style={{ width: `${item.level}%` }}/></div></div>)}</div>
          ) : (
            <p className="mt-3 text-sm text-muted">No skills listed yet.</p>
          )}
        </section>
        <section className="mt-12 border-t border-line pt-8">
          <p className="eyebrow">Domains of interest</p>
          <div className="mt-4 flex flex-wrap gap-2">{profile.interests.map(item => <Badge key={item} tone="accent">{item}</Badge>)}</div>
        </section>
        <section className="mt-12 border-t border-line pt-8">
          <p className="eyebrow">Experience</p>
          {profile.experience.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">{profile.experience.map(item => <Card key={item.title} className="p-5"><p className="text-xs font-bold uppercase tracking-widest text-terra">{item.kind}</p><h2 className="mt-3 font-display text-2xl tracking-editorial">{item.title}</h2><p className="mt-2 text-sm text-muted">{item.detail}</p></Card>)}</div>
          ) : (
            <p className="mt-3 text-sm text-muted">No experience details added yet.</p>
          )}
        </section>
      </div>
      <aside className="space-y-5">
        <Card className="p-6">
          <p className="eyebrow">Previous projects</p>
          {memberProjects.length ? (
            <div className="mt-5 space-y-4">{memberProjects.map(project => <Link href={`/projects/${project.id}`} key={project.id} className="block border-b border-line pb-4 last:border-0 last:pb-0 transition-opacity hover:opacity-80"><p className="font-display text-2xl tracking-editorial">{project.title}</p><p className="mt-1 text-xs text-muted">{project.domain} · {project.stage}</p></Link>)}</div>
          ) : (
            <div className="mt-4"><EmptyState icon="🌱" title="No projects yet" description="Has not joined any projects yet. Discover open projects or start a new one!" action={<Link href="/projects"><Button className="text-xs min-h-9">Discover projects</Button></Link>} /></div>
          )}
        </Card>
        <Card className="p-6">
          <p className="eyebrow">Achievements</p>
          {profile.achievements.length ? (
            <ul className="mt-4 space-y-3">{profile.achievements.map(item => <li key={item} className="border-l-2 border-terra pl-3 text-sm leading-6">{item}</li>)}</ul>
          ) : (
            <p className="mt-3 text-xs text-muted">No achievements listed yet.</p>
          )}
        </Card>
      </aside>
    </div>
  </section>;
}
