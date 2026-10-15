"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppState } from "@/lib/AppState";
import { Button, Input, ToastBanner } from "@/components/ui";

export default function EditProfilePage() {
  const { currentProfileId, profiles, updateProfile } = useAppState(); 
  const router = useRouter(); 
  const profile = profiles.find(item => item.id === currentProfileId); 
  const [form, setForm] = useState(() => profile ? { name: profile.name, role: profile.role, department: profile.department, year: profile.year, location: profile.location, bio: profile.bio, skills: profile.skills.join(", "), interests: profile.interests.join(", "), availability: profile.availability } : null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!profile || !form) return <section className="mx-auto max-w-content px-5 py-24 text-center md:px-8"><p className="eyebrow">Profile unavailable</p><h1 className="mt-3 font-display text-5xl tracking-editorial">Choose a profile to continue.</h1><button onClick={() => router.push("/projects")} className="mt-7 text-sm font-bold text-terra hover:text-terra-dark transition-colors">Explore projects →</button></section>; 
  
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(value => value ? { ...value, [key]: e.target.value } : value); 
  const list = (value: string) => value.split(",").map(item => item.trim()).filter(Boolean);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const skills = list(form.skills);
    await updateProfile({ ...profile, name: form.name.trim(), role: form.role.trim(), department: form.department.trim(), year: form.year.trim(), location: form.location.trim(), bio: form.bio.trim(), skills, skillLevels: skills.map((skill, index) => ({ skill, level: profile.skillLevels.find(item => item.skill === skill)?.level ?? Math.max(65, 85 - index * 7) })), interests: list(form.interests), availability: form.availability });
    setSavedNotice(true);
    setTimeout(() => {
      router.push(`/profile/${profile.id}`);
    }, 600);
  };

  return <section className="mx-auto max-w-2xl px-5 py-14 md:px-8 md:py-20">
    <p className="eyebrow">Your profile</p>
    <h1 className="mt-3 font-display text-5xl tracking-editorial">Keep your invitation current.</h1>
    {savedNotice && <div className="mt-6"><ToastBanner message="Profile changes saved successfully!" /></div>}
    <form onSubmit={save} className="mt-8 space-y-5 rounded-card border border-line bg-paper p-6 md:p-9 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Name" value={form.name} onChange={set("name")} required/>
        <Input label="Role" value={form.role} onChange={set("role")} required/>
        <Input label="Department" value={form.department} onChange={set("department")} required/>
        <Input label="Year" value={form.year} onChange={set("year")} required/>
        <Input label="Location" value={form.location} onChange={set("location")} required/>
      </div>
      <label className="block text-sm font-semibold text-ink">About you
        <textarea value={form.bio} onChange={set("bio")} rows={4} required className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-terra focus:ring-2 focus:ring-terra/20"/>
      </label>
      <Input label="Skills" value={form.skills} onChange={set("skills")} required/>
      <Input label="Domains of interest" value={form.interests} onChange={set("interests")} required/>
      <label className="block text-sm font-semibold text-ink">Availability
        <select value={form.availability} onChange={set("availability")} className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-terra focus:ring-2 focus:ring-terra/20">
          {["Open to collaborate", "Limited availability", "Collaborating"].map(item => <option key={item}>{item}</option>)}
        </select>
      </label>
      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <Button type="button" variant="text" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
      </div>
    </form>
  </section>;
}

