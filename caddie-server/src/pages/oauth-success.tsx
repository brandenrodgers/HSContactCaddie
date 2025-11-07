import type { NextPage } from 'next';
import Head from 'next/head';
import { commonStyles, globalAnimations } from '../lib/styles';

const OAuthSuccess: NextPage = () => {
  return (
    <>
      <Head>
        <title>Authentication Successful - Contact Caddie</title>
        <style>{globalAnimations}</style>
      </Head>

      <div style={commonStyles.container}>
        <div style={commonStyles.backgroundGradient} />
        <main style={commonStyles.main}>
          <div style={styles.content}>
            <div style={styles.iconContainer}>
              <svg
                style={commonStyles.successIcon}
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

            <h1 style={commonStyles.titleMedium}>Authentication Successful!</h1>

            <p style={commonStyles.descriptionCentered}>
              Your HubSpot account has been successfully connected to Contact Caddie.
            </p>

            <p style={commonStyles.subtext}>You can now close this tab and return to HubSpot.</p>
          </div>
        </main>
      </div>
    </>
  );
};

const styles = {
  content: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
};

export default OAuthSuccess;
