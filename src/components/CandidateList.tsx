import React from 'react'

const candidates = [
  { id: 'c1', name: 'Alex Johnson', role: 'Frontend Engineer', score: 84 },
  { id: 'c2', name: 'Priya Singh', role: 'Data Analyst', score: 77 },
  { id: 'c3', name: 'Miguel Santos', role: 'DevOps Engineer', score: 69 }
]

const CandidateList: React.FC = () => {
  return (
    <section className="candidate-list">
      <div className="container">
        <h2>Candidate Directory</h2>
        <div className="candidate-grid">
          {candidates.map(c => (
            <div key={c.id} className="candidate-card">
              <div className="candidate-name">{c.name}</div>
              <div className="candidate-title">{c.role}</div>
              <div>Merit Score: <strong>{c.score}</strong></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CandidateList
