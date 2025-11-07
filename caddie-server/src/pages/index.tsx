import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>HubSpot Contact Caddie</title>
        <meta
          name="description"
          content="Track golf stats for your HubSpot contacts"
        />
      </Head>

      <div style={styles.container}>
        <main style={styles.main}>
          <h1 style={styles.title}>HubSpot Contact Caddie ⛳️</h1>
          <p style={styles.description}>
            Track golf stats for your HubSpot contacts
          </p>
          <button style={styles.button}>Get Started</button>
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
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  main: {
    textAlign: 'center' as const,
    padding: '2rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 700,
    color: '#1a202c',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1.25rem',
    color: '#4a5568',
    marginBottom: '2rem',
  },
  button: {
    backgroundColor: '#ff7a59',
    color: 'white',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default Home;
