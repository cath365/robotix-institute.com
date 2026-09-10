import type { Metadata } from 'next';
import InviteAcceptClient from './InviteAcceptClient';

export const metadata: Metadata = {
  title: 'Accept Team Invite',
  description: 'Accept a Robotix Institute team invitation.',
};

export default function InvitePage({ params }: { params: { token: string } }) {
  return <InviteAcceptClient token={params.token} />;
}
