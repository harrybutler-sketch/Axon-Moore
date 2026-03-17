-- Create consultants table
CREATE TABLE consultants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger_type enum
CREATE TYPE trigger_type AS ENUM (
  'PE investment',
  'VC investment',
  'acquisition',
  'disposal',
  'refancing',
  'leadership hire',
  'leadership exit',
  'positive trading update',
  'expansion',
  'restructuring',
  'other significant change'
);

-- Create event_status enum
CREATE TYPE event_status AS ENUM (
  'new',
  'reviewed',
  'assigned',
  'actioned',
  'ignored'
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  trigger_type trigger_type NOT NULL,
  summary TEXT,
  source_url TEXT,
  announcement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sector TEXT,
  geography TEXT,
  key_contacts TEXT,
  advisors TEXT,
  investor TEXT,
  likely_hiring_need TEXT,
  consultant_id UUID REFERENCES consultants(id),
  status event_status DEFAULT 'new',
  priority_score INT CHECK (priority_score >= 0 AND priority_score <= 100),
  
  -- Stage 2: AI Fields
  raw_text TEXT,
  confidence_score FLOAT,
  ai_summary TEXT,
  ai_why_it_matters TEXT,
  ai_hiring_need TEXT,
  ai_outreach_draft TEXT,
  ai_extracted_entities JSONB,
  is_automation_ingested BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for internal dashboard, but authenticated only)
CREATE POLICY "Allow authenticated users all access" ON consultants
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users all access" ON events
  FOR ALL TO authenticated USING (true);
