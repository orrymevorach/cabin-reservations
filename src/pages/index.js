import LoginPage from '@/components/loginPage/loginPage';
import Layout from '@/components/shared/layout/layout';
import { UserProvider } from '@/context/user-context';

export default function Home() {
  return (
    <UserProvider>
      <Layout>
        <LoginPage />
      </Layout>
    </UserProvider>
  );
}
