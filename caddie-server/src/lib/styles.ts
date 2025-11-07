export const commonStyles = {
  container: {
    minHeight: '100vh',
    position: 'relative' as const,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    overflow: 'hidden' as const,
  },
  backgroundGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
    backgroundSize: '400% 400%',
    animation: 'gradient 15s ease infinite',
    opacity: 0.1,
    zIndex: 0,
  },
  main: {
    position: 'relative' as const,
    zIndex: 1,
    maxWidth: '1200px',
    width: '100%',
    padding: '3rem 2rem',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  titleLarge: {
    fontSize: '3.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  titleMedium: {
    fontSize: '2.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  tagline: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#2d3748',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1.125rem',
    color: '#4a5568',
    maxWidth: '600px',
    margin: '0 auto 2.5rem',
    lineHeight: 1.6,
  },
  descriptionCentered: {
    fontSize: '1.125rem',
    color: '#4a5568',
    maxWidth: '600px',
    margin: '0 auto 1rem',
    lineHeight: 1.6,
  },
  subtext: {
    fontSize: '1rem',
    color: '#718096',
    marginBottom: '2rem',
  },
  button: {
    backgroundColor: '#ff7a59',
    color: 'white',
    padding: '1rem 2.5rem',
    fontSize: '1.125rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(255, 122, 89, 0.3)',
    transform: 'translateY(0)',
  },
  buttonHover: {
    backgroundColor: '#ff6347',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 15px rgba(255, 122, 89, 0.4)',
  },
  emojiContainer: {
    marginBottom: '1.5rem',
  },
  emoji: {
    fontSize: '4rem',
    display: 'inline-block',
    animation: 'bounce 2s ease-in-out infinite',
  },
  emojiLarge: {
    fontSize: '5rem',
    display: 'inline-block',
    animation: 'bounce 2s ease-in-out infinite',
  },
  successIcon: {
    width: '5rem',
    height: '5rem',
    color: '#48bb78',
    marginBottom: '1.5rem',
    animation: 'scaleIn 0.5s ease-out',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid #e2e8f0',
  },
};

export const globalAnimations = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes scaleIn {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
`;
