-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL,
    "riasec_code" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_results_userId_applicationId_key" ON "test_results"("userId", "applicationId");

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_userId_applicationId_fkey" FOREIGN KEY ("userId", "applicationId") REFERENCES "user_applications"("userId", "applicationId") ON DELETE CASCADE ON UPDATE CASCADE;
