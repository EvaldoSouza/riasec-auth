"use client"; // This component must be a Client Component.

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { type CalculatedRiasecResult } from "@/types/dashboard";
import { riasecLabels } from "@/config/riasecMatrix";
import { RiasecType } from "@prisma/client";

// Define the props. It expects to receive the 'scores' object.
interface RiasecRadarChartProps {
  scores: CalculatedRiasecResult['scores'];
}

/**
 * A client component responsible for rendering the RIASEC scores
 * in a radar chart visualization using the Recharts library.
 */
export function RiasecRadarChart({ scores }: RiasecRadarChartProps) {
  // 1. Recharts expects data as an array of objects. We transform our
  //    'scores' object into this format.
  const data = Object.entries(scores).map(([type, scoreValue]) => ({
    subject: riasecLabels[type as RiasecType] || type,
    score: scoreValue
  }))

  return (
    // 2. ResponsiveContainer makes the chart automatically fill its parent container.
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart
        cx="50%" // Center X
        cy="50%" // Center Y
        outerRadius="80%" // The size of the chart relative to the container
        data={data}
      >
        {/* 3. PolarGrid creates the concentric circles (the web) of the radar chart. */}
        <PolarGrid />
        {/* 4. PolarAngleAxis creates the labels around the chart (R, I, A, S, E, C). */}
        <PolarAngleAxis dataKey="subject" />
        {/* 5. The Radar component draws the actual shape based on the score data. */}
        <Radar
          name="RIASEC Score"
          dataKey="score"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}