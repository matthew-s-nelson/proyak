import React from "react";

const MeritScore: React.FC = () => {
    // Placeholder user score breakdown
    const score = 78;
    const breakdown = [
        { label: "Verified Skills", points: 30 },
        { label: "Work History", points: 20 },
        { label: "Endorsements", points: 18 },
        { label: "Assessments", points: 10 },
    ];

    return (
        <section className="merit-score-section">
            <div className="container">
                <h2>Perfect Fit Score(MVP)</h2>
                <p className="muted">
                    A simple, transparent preference, value, and skill based
                    score candidates can accumulate to show compatibility.
                </p>

                <div className="score-card">
                    <div className="score-number">{score}</div>
                    <div className="score-label">Perfect Fit Score</div>
                </div>

                <div className="score-breakdown">
                    {breakdown.map((b, i) => (
                        <div key={i} className="breakdown-item">
                            <div className="breakdown-label">{b.label}</div>
                            <div className="breakdown-points">{b.points}</div>
                        </div>
                    ))}
                </div>

                <p className="muted small">
                    Note: This is a placeholder algorithm. In production, scores
                    are calculated by comparing a candidates preferences,
                    skills, and values against job requirements and company
                    culture.
                </p>
            </div>
        </section>
    );
};

export default MeritScore;
