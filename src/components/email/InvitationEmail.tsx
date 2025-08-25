import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface BoardInvitationEmailProps {
  inviterName?: string;
  inviterEmail?: string;
  boardName?: string;
  inviteLink?: string;
}

const baseUrl = process.env.NEXTAUTH_URL || 'https://apptasktracker.vercel.app';

export const BoardInvitationEmail = ({
  inviterName = 'John Doe',
  inviterEmail = 'john.doe@example.com',
  boardName = 'Project Planning',
  inviteLink = 'https://apptasktracker.vercel.app/accept-invite?token=abc123',
}: BoardInvitationEmailProps) => {
  const previewText = `${inviterName} has invited you to join the "${boardName}" board on TaskTracker`;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white mx-auto my-auto font-sans">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto my-[40px] p-[20px] border border-[#eaeaea] border-solid rounded max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/logo.png`}
                width="50"
                height="50"
                alt="TaskTracker Logo"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 font-normal text-[24px] text-black text-center">
              Join <strong>{boardName}</strong> on <strong>TaskTracker</strong>
            </Heading>
            <Text className="text-[14px] text-black leading-[24px]">
              Hello there,
            </Text>
            <Text className="text-[14px] text-black leading-[24px]">
              <strong>{inviterName}</strong> (
              <Link
                href={`mailto:${inviterEmail}`}
                className="text-blue-600 no-underline"
              >
                {inviterEmail}
              </Link>
              ) has invited you to collaborate on the <strong>{boardName}</strong> board on TaskTracker.
            </Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="bg-[#0052CC] px-5 py-3 rounded font-semibold text-[12px] text-white text-center no-underline"
                href={inviteLink}
              >
                Join the Board
              </Button>
            </Section>
            <Text className="text-[14px] text-black leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] border border-[#eaeaea] border-solid w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This invitation was sent to you by {inviterName}. If you were not expecting this invitation, you can ignore this email. TaskTracker helps teams organize projects and collaborate effectively.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

BoardInvitationEmail.PreviewProps = {
  inviterName: 'Sarah Johnson',
  inviterEmail: 'sarah.johnson@example.com',
  boardName: 'Q3 Product Launch',
  inviteLink: 'https://apptasktracker.vercel.app/accept-invite?token=sample-token-123',
} as BoardInvitationEmailProps;

export default BoardInvitationEmail;