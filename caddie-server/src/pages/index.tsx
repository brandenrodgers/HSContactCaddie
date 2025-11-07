import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { commonStyles, globalAnimations } from '../lib/styles';

const Home: NextPage = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      emoji: '📊',
      title: 'Track Rounds',
      description: 'Record and manage golf rounds directly in HubSpot',
    },
    {
      emoji: '📈',
      title: 'Calculate Handicap',
      description: 'Automatically calculate and update handicaps',
    },
    {
      emoji: '🔗',
      title: 'Contact Integration',
      description: 'Seamlessly link golf data to your contacts',
    },
  ];

  return (
    <>
      <Head>
        <title>HubSpot Contact Caddie</title>
        <meta name="description" content="Track golf stats for your HubSpot contacts" />
        <style>{globalAnimations}</style>
      </Head>

      <div style={commonStyles.container}>
        <div style={commonStyles.backgroundGradient} />
        <main style={commonStyles.main}>
          <div style={styles.hero}>
            <div style={commonStyles.emojiContainer}>
              <span style={commonStyles.emoji}>⛳️</span>
            </div>
            <h1 style={commonStyles.title}>HubSpot Contact Caddie</h1>
            <p style={commonStyles.tagline}>The perfect way to track golf stats for your contacts</p>
            <p style={commonStyles.description}>
              Connect with your clients on the course. Track rounds, calculate handicaps, and build stronger
              relationships—all within HubSpot.
            </p>
            <button
              style={{
                ...commonStyles.button,
                ...(isHovered ? commonStyles.buttonHover : {}),
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => {
                window.location.href = '/api/oauth-callback';
              }}
            >
              Connect with HubSpot
            </button>
          </div>

          <div style={styles.features}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  ...commonStyles.card,
                  ...(hoveredCard === index ? styles.featureCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={styles.featureEmoji}>{feature.emoji}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

const styles = {
  hero: {
    marginBottom: '4rem',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
  },
  featureCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    borderColor: '#667eea',
  },
  featureEmoji: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1a202c',
    marginBottom: '0.75rem',
  },
  featureDescription: {
    fontSize: '1rem',
    color: '#4a5568',
    lineHeight: 1.6,
  },
};

export default Home;
