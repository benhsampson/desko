import ReactMarkdown from 'react-markdown';
import AuthLayout from '../components/AuthLayout';
import terms from '../lib/md/terms';

export default function TermsPage() {
  return (
    <AuthLayout mainHeading="Terms of Use">
      <ReactMarkdown>{terms}</ReactMarkdown>
    </AuthLayout>
  );
}
