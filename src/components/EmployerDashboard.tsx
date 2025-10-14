import React from 'react'

const mockCandidates = [
  { id: 'cand-1', name: 'Alex Johnson', title: 'Frontend Engineer', score: 84 },
  { id: 'cand-2', name: 'Priya Singh', title: 'Data Analyst', score: 77 },
  { id: 'cand-3', name: 'Miguel Santos', title: 'DevOps Engineer', score: 69 }
]

const EmployerDashboard: React.FC = () => {
  return (
    <section className="employer-dashboard">
      <div className="container">
        <header className="dashboard-header">
          <h2>Employer Dashboard</h2>
          <p className="muted">Search candidates, view merit scores, and invite for interviews (MVP placeholders).</p>
        </header>

        <div className="candidate-grid">
          {mockCandidates.map(c => (
            <div key={c.id} className="candidate-card">
              <div className="candidate-name">{c.name}</div>
              <div className="candidate-title">{c.title}</div>
              <div className="candidate-score">Merit: <strong>{c.score}</strong></div>
              <div className="candidate-actions">
                <button className="btn-small">View Profile</button>
                <button className="btn-small secondary">Invite</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EmployerDashboard
