import LoginPage from '@/components/loginPage/loginPage';
import Layout from '@/components/shared/layout/layout';
import { UserProvider } from '@/context/user-context';
import { COOKIES, ROUTES } from '@/utils/constants';
import Cookies from 'cookies';

export default function Home() {
  return (
    <UserProvider>
      <Layout>
        <LoginPage />
      </Layout>
    </UserProvider>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  const cookies = new Cookies(req, res);
  const uid = cookies.get(COOKIES.USER_RECORD);
  if (uid) {
    return {
      redirect: {
        destination:
          context.query.returnTo === ROUTES.DIETARY_INTAKE
            ? ROUTES.DIETARY_INTAKE
            : ROUTES.SUMMARY,
        permanent: false,
      },
    };
  }
  return { props: {} };
}
