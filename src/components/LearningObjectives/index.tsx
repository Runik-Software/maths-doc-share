import { CheckCircle2 } from 'lucide-react'
import React from 'react'

type Objective = { text: string; id?: string | null }

export const LearningObjectives: React.FC<{ objectives: Objective[] }> = ({ objectives }) => {
  if (!objectives?.length) return null

  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-foreground">Learning Objectives</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {objectives.map((objective) => (
          <div
            key={objective.id ?? objective.text}
            className="flex items-start gap-3 rounded-lg border border-border p-4"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm text-foreground">{objective.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
