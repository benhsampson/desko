import ReactMarkdown from 'react-markdown';
import privacy from '../lib/md/privacy';
import AuthLayout from '../components/AuthLayout';

export default function PrivacyPage() {
  return (
    <AuthLayout mainHeading="Privacy Policy">
      <ReactMarkdown>{privacy}</ReactMarkdown>
    </AuthLayout>
  );
}
