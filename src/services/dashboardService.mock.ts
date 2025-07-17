import {
  CalculatedRiasecResult,
  CareerSuggestion,
} from "@/types/dashboard";

/**
 * @file This file provides mock data for the entire cliente dashboard,
 * simulating different user statuses.
 */

// Define the shape of the data object our dashboard will receive.
type DashboardData = {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  result: CalculatedRiasecResult | null;
  suggestions: CareerSuggestion[];
  applicationId?: string;
};

// --- MOCK DATA SCENARIOS ---

const MOCK_RESULT: CalculatedRiasecResult = {
  riasecCode: "SAI",
  scores: { realistic: 10, investigative: 35, artistic: 40, social: 45, enterprising: 25, conventional: 15 },
};
const MOCK_SUGGESTIONS: CareerSuggestion[] = [
  { id: '1', title: 'Counselor', description: 'Guide and support individuals.' },
];
const MOCK_APPLICATION_ID = "cl_mock_app_123";


// --- EXPORTED MOCK FUNCTION ---

/**
 * MOCK: Simulates fetching all necessary data for the cliente dashboard.
 * @param userId - The user ID (ignored in this mock).
 * @returns A promise that resolves to a complete dashboard data object.
 */
export async function getClienteDashboardData(userId: string): Promise<DashboardData> {
  console.warn("⚠️ Using MOCK data for getClienteDashboardData", userId);
  await new Promise(resolve => setTimeout(resolve, 300));

  // Best Practice: Easily switch which scenario you are testing
  // by changing which object is returned here.

  // Scenario 1: User has completed the test.
  return Promise.resolve({
    status: 'COMPLETED',
    result: MOCK_RESULT,
    suggestions: MOCK_SUGGESTIONS,
    applicationId: MOCK_APPLICATION_ID
  });

  /*
  // Scenario 2: User has started but not finished.
  return Promise.resolve({
    status: 'IN_PROGRESS',
    result: null,
    suggestions: [],
    applicationId: MOCK_APPLICATION_ID
  });
  */

  /*
  // Scenario 3: User has not started any test.
  return Promise.resolve({
    status: 'NOT_STARTED',
    result: null,
    suggestions: [],
  });
  */
}

/**
 * MOCK: Simulates fetching the data needed for the detailed results page.
 */
export async function getDetailedTestResult(userId: string): Promise<CalculatedRiasecResult | null> {
  console.warn("⚠️ Using MOCK data for getDetailedTestResult", userId);
  // This mock specifically returns the detailed result object.
  return MOCK_RESULT;
}