import { AdminShell } from '@/components/admin/AdminShell'

export const metadata = {
  title: '관리자 콘솔 — 이직추천',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
