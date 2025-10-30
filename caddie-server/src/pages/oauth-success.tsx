import type { NextPage } from 'next';
import Head from 'next/head';

const OAuthSuccess: NextPage = () => {

  return (
    <>
      <Head>
        <title>Authentication Successful - Contact Caddie</title>
      </Head>

      <div style={styles.container}>
        <main style={styles.main}>
          <div style={styles.iconContainer}>
            <svg
              style={styles.icon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 style={styles.title}>Authentication Successful! ✅</h1>

          <p style={styles.description}>
            Your HubSpot account has been successfully connected to Contact Caddie.
          </p>

          <p style={styles.subtext}>
            You can now close this tab and return to HubSpot.
          </p>
        </main>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  main: {
    textAlign: 'center' as const,
    padding: '2rem',
    maxWidth: '500px',
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  icon: {
    width: '4rem',
    height: '4rem',
    color: '#48bb78',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1a202c',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1.125rem',
    color: '#4a5568',
    marginBottom: '1rem',
    lineHeight: '1.6',
  },
  subtext: {
    fontSize: '1rem',
    color: '#718096',
    marginBottom: '2rem',
  },
};

export default OAuthSuccess;

