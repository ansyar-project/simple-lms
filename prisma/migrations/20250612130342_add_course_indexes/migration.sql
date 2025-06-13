-- CreateIndex
CREATE INDEX "courses_instructor_id_idx" ON "courses"("instructor_id");

-- CreateIndex
CREATE INDEX "courses_category_id_idx" ON "courses"("category_id");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "courses"("status");

-- CreateIndex
CREATE INDEX "courses_createdAt_idx" ON "courses"("createdAt");

-- CreateIndex
CREATE INDEX "courses_updatedAt_idx" ON "courses"("updatedAt");

-- CreateIndex
CREATE INDEX "courses_title_idx" ON "courses"("title");

-- CreateIndex
CREATE INDEX "courses_instructor_id_status_idx" ON "courses"("instructor_id", "status");

-- CreateIndex
CREATE INDEX "courses_instructor_id_category_id_idx" ON "courses"("instructor_id", "category_id");

-- CreateIndex
CREATE INDEX "courses_instructor_id_createdAt_idx" ON "courses"("instructor_id", "createdAt");
