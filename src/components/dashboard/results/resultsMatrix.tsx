import { Answer, Card } from "@prisma/client";
import {
  riasecColors,
  competenceLevels,
  competenceLabels,
  affinityLevels,
  affinityLabels,
  riasecLabels,
} from "@/config/riasecMatrix";

type AnswerWithCard = Answer & { card: Card };
type AnswerGrid = Record<string, Record<string, AnswerWithCard[]>>;

function buildAnswerGrid(answers: AnswerWithCard[]): AnswerGrid {
  const grid: AnswerGrid = {};
  for (const affinity of affinityLevels) {
    grid[affinity] = {};
    for (const competence of competenceLevels) {
      grid[affinity][competence] = [];
    }
  }
  for (const answer of answers) {
    const affinity = answer.affinityResponse;
    const competence = answer.competenceResponse;
    if (affinity && competence && grid[affinity]?.[competence]) {
      grid[affinity][competence].push(answer);
    }
  }
  return grid;
}

// The main matrix component
export function ResultsMatrix({ answers }: { answers: AnswerWithCard[] }) {
  const grid = buildAnswerGrid(answers);

  return (
    <div className="border border-gray-400 rounded-lg p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="p-2 font-semibold text-left ">Afinidade / Competência</th>
            {competenceLevels.map((level) => (
              <th key={level} className="p-2 font-semibold text-center w-1/4">
                {competenceLabels[level]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {affinityLevels.map((affinity) => (
            <tr key={affinity} className="border-b border-gray-400">
              <td className="p-2 font-semibold align-top w-1/4">
                {affinityLabels[affinity]}
              </td>
              {competenceLevels.map((competence) => (
                <td key={competence} className="p-2 border-l border-gray-400 align-top">
                  <div className="flex flex-col w-full">
                    {grid[affinity][competence].map((answer) => (
                      <div
                        key={answer.cardId}
                        className={`w-full px-2 py-1 text-sm font-big  ${
                          riasecColors[answer.card.riasecType] || "bg-gray-100 text-black-800"
                        }`}
                      >
                        {answer.card.question} (
                        {riasecLabels[answer.card.riasecType] || answer.card.riasecType})
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}