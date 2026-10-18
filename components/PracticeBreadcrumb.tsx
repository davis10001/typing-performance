import Link from "next/link";
import BackIcon from "@/components/BackIcon";

export default function PracticeBreadcrumb({ href = "/learn", children = "All practice options" }: { href?: string; children?: string }) {
  return <nav className="practice-breadcrumb" aria-label="Breadcrumb"><Link href={href}><BackIcon />{children}</Link></nav>;
}
