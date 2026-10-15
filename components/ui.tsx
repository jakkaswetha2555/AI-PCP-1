"use client";
import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

export function Button({ children, variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "text" }) {
  const styles = { primary: "bg-terra text-white border-terra hover:bg-terra-dark shadow-sm hover:shadow active:scale-[0.98]", secondary: "bg-transparent text-ink border-ink hover:bg-ink hover:text-paper active:scale-[0.98]", text: "border-transparent text-terra hover:text-terra-dark px-0" };
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none ${styles[variant]} ${className}`} {...props}>{children}</button>;
}
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) { return <article className={`rounded-card border border-line bg-paper transition-all duration-200 ease-out ${className}`}>{children}</article>; }
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" }) { return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200 ${tone === "accent" ? "bg-terra-pale text-terra-dark" : "bg-cream text-muted"}`}>{children}</span>; }
export function Avatar({ initials, color, photo, size = "md" }: { initials: string; color: string; photo?: string; size?: "sm" | "md" | "lg" }) { const s = { sm: "h-8 w-8 text-[10px]", md: "h-11 w-11 text-xs", lg: "h-16 w-16 text-base" }[size]; return <span aria-label={initials} className={`${s} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-ink shadow-sm`} style={{ background: color }}>{photo ? <img src={photo} alt="" className="h-full w-full object-cover"/> : initials}</span>; }
export function Input({ label, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) { return <label className="block text-sm font-semibold text-ink">{label && <span className="mb-2 block">{label}</span>}<input className={`w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-terra focus:ring-2 focus:ring-terra/20 ${className}`} {...props} /></label>; }
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) { useEffect(() => { const f = (e: KeyboardEvent) => e.key === "Escape" && onClose(); addEventListener("keydown", f); return () => removeEventListener("keydown", f); }, [onClose]); if (!open) return null; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px] transition-opacity duration-200" onMouseDown={onClose}><div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-card border border-line bg-paper p-6 shadow-lg shadow-ink/5 transition-transform duration-200 ease-out" onMouseDown={e => e.stopPropagation()}><div className="mb-5 flex items-start justify-between"><h2 className="font-display text-3xl tracking-editorial">{title}</h2><button onClick={onClose} aria-label="Close" className="text-2xl text-muted hover:text-ink transition-colors">×</button></div>{children}</div></div>; }
export function Tabs({ tabs, onChange }: { tabs: string[]; onChange?: (tab: string) => void }) { const [active, setActive] = useState(tabs[0]); return <div className="flex gap-5 border-b border-line" role="tablist">{tabs.map(tab => <button key={tab} role="tab" aria-selected={active === tab} onClick={() => { setActive(tab); onChange?.(tab); }} className={`border-b-2 py-3 text-sm font-semibold transition-all duration-200 ${active === tab ? "border-terra text-terra" : "border-transparent text-muted hover:text-ink"}`}>{tab}</button>)}</div>; }

export function EmptyState({ icon = "✦", title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-paper/60 px-6 py-12 text-center transition-all duration-200">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-terra-pale text-xl text-terra">
        {icon}
      </div>
      <h3 className="font-display text-2xl tracking-editorial text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ToastBanner({ message, type = "success", onClose }: { message: string; type?: "success" | "info"; onClose?: () => void }) {
  return (
    <div className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out ${type === "success" ? "border-terra/30 bg-terra-pale text-terra-dark" : "border-line bg-cream text-ink"}`}>
      <div className="flex items-center gap-2">
        <span>{type === "success" ? "✓" : "ℹ"}</span>
        <span>{message}</span>
      </div>
      {onClose && <button onClick={onClose} aria-label="Dismiss banner" className="ml-4 text-xs opacity-75 hover:opacity-100">✕</button>}
    </div>
  );
}

