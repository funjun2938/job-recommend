import { ConnectedProfile } from '@/components/connect/ConnectedProfile'

export const metadata = {
  title: '연동 결과 — careerly',
  robots: { index: false, follow: false },
}

export default function ConnectedPage() {
  return <ConnectedProfile />
}
