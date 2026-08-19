-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birth_year" INTEGER,
    "avatar" TEXT NOT NULL DEFAULT '🌸',
    "takes_supplements" BOOLEAN NOT NULL DEFAULT false,
    "medications" JSONB NOT NULL DEFAULT '[]',
    "partner_code" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'de',
    "life_stage" TEXT,
    "age_group" TEXT,
    "experience_level" TEXT,
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_step" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_cycles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_period_start" DATE NOT NULL,
    "cycle_length" INTEGER NOT NULL DEFAULT 28,
    "period_length" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancies" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_pregnant" BOOLEAN NOT NULL DEFAULT false,
    "last_period_start" DATE,
    "due_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_daily_health" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "water_liters" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vitamins_checked" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_daily_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_body_metrics" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight_kg" DOUBLE PRECISION,
    "height_cm" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_body_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_supplements" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dose" TEXT NOT NULL DEFAULT '',
    "time" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_supplements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_supplement_log" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "supplement_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_supplement_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_supplement_reminders" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "supplement_name" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_supplement_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_supplement_calendar" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "supplement_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "taken_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_supplement_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_supplement_streaks" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "supplement_id" BIGINT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_taken_date" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_supplement_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancy_shares" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "share_token" TEXT NOT NULL,
    "partner_name" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancy_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancy_weeks" (
    "week" INTEGER NOT NULL,
    "fruit" TEXT NOT NULL,
    "fruit_de" TEXT NOT NULL,
    "fruit_en" TEXT NOT NULL,
    "fruit_fa" TEXT NOT NULL,
    "size_cm" DECIMAL(5,2) NOT NULL,
    "weight_g" INTEGER NOT NULL,
    "milestone_de" TEXT NOT NULL,
    "milestone_en" TEXT NOT NULL,
    "milestone_fa" TEXT NOT NULL,
    "tip_de" TEXT NOT NULL,
    "tip_en" TEXT NOT NULL,
    "tip_fa" TEXT NOT NULL,

    CONSTRAINT "pregnancy_weeks_pkey" PRIMARY KEY ("week")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'rose',
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "reminder_time" TEXT NOT NULL DEFAULT '08:00',
    "show_fertility" BOOLEAN NOT NULL DEFAULT true,
    "show_educational_content" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interaction_log" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interaction_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_daily_tips" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "tip_key" TEXT NOT NULL,
    "tip_text" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "shown" BOOLEAN NOT NULL DEFAULT false,
    "liked" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_daily_tips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_cycles_user_id_key" ON "user_cycles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pregnancies_user_id_key" ON "pregnancies"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_daily_health_user_id_date_key" ON "user_daily_health"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "user_body_metrics_user_id_key" ON "user_body_metrics"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_supplement_log_user_id_supplement_id_date_key" ON "user_supplement_log"("user_id", "supplement_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "user_supplement_calendar_user_id_supplement_id_date_key" ON "user_supplement_calendar"("user_id", "supplement_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "user_supplement_streaks_user_id_supplement_id_key" ON "user_supplement_streaks"("user_id", "supplement_id");

-- CreateIndex
CREATE UNIQUE INDEX "pregnancy_shares_user_id_key" ON "pregnancy_shares"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pregnancy_shares_share_token_key" ON "pregnancy_shares"("share_token");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_daily_tips_user_id_date_tip_key_key" ON "user_daily_tips"("user_id", "date", "tip_key");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cycles" ADD CONSTRAINT "user_cycles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancies" ADD CONSTRAINT "pregnancies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_daily_health" ADD CONSTRAINT "user_daily_health_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_body_metrics" ADD CONSTRAINT "user_body_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_supplements" ADD CONSTRAINT "user_supplements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_supplement_log" ADD CONSTRAINT "user_supplement_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_supplement_log" ADD CONSTRAINT "user_supplement_log_supplement_id_fkey" FOREIGN KEY ("supplement_id") REFERENCES "user_supplements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_supplement_reminders" ADD CONSTRAINT "user_supplement_reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_supplement_calendar" ADD CONSTRAINT "user_supplement_calendar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_supplement_calendar" ADD CONSTRAINT "user_supplement_calendar_supplement_id_fkey" FOREIGN KEY ("supplement_id") REFERENCES "user_supplements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_supplement_streaks" ADD CONSTRAINT "user_supplement_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_supplement_streaks" ADD CONSTRAINT "user_supplement_streaks_supplement_id_fkey" FOREIGN KEY ("supplement_id") REFERENCES "user_supplements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_shares" ADD CONSTRAINT "pregnancy_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interaction_log" ADD CONSTRAINT "user_interaction_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_daily_tips" ADD CONSTRAINT "user_daily_tips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
