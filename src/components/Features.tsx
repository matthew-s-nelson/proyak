import React from 'react';
import { DollarSign, CheckCircle, Target, Zap, Shield, TrendingUp } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  const features = [
    {
      icon: <DollarSign size={24} color="white" />,
      title: "100% Free for Job Seekers",
      description: "We believe job searching should never cost money. Our platform will be completely free for all job seekers, forever."
    },
    {
      icon: <CheckCircle size={24} color="white" />,
      title: "Verified Credentials",
      description: "We'll verify skills, education, and experience to ensure employers see authentic, qualified candidates and reduce hiring time."
    },
    {
      icon: <Target size={24} color="white" />,
      title: "Smart Matching",
      description: "Our planned AI-powered matching system will connect job seekers with opportunities that perfectly fit their verified skills."
    },
    {
      icon: <Zap size={24} color="white" />,
      title: "Faster Hiring",
      description: "By pre-verifying candidate profiles, we aim to help employers make hiring decisions 3x faster than traditional platforms."
    },
    {
      icon: <Shield size={24} color="white" />,
      title: "Secure & Private",
      description: "User data will be protected with enterprise-grade security. Candidates will control who sees their profile and when."
    },
    {
      icon: <TrendingUp size={24} color="white" />,
      title: "Career Growth Tools",
      description: "We plan to offer application tracking and insights to help job seekers improve their search strategy."
    }
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <h2>What We're Building</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
