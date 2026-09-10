-- 100 publicly listed Baldwin provider contacts generated from outreach-100-verified-emails.csv.
-- Upsert by email; preserves operator stage when a row already exists.
BEGIN TRANSACTION;

UPDATE outreach SET
  website='https://njfue.com/',
  email='info@njfue.com',
  city='Freehold, NJ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://njfue.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@njfue.com') OR lower(practice_name)=lower('New Jersey Hair Restoration Center');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'New Jersey Hair Restoration Center', 'https://njfue.com/', 'info@njfue.com', 'Freehold, NJ', 'hair restoration', 1, 'https://njfue.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@njfue.com') OR lower(practice_name)=lower('New Jersey Hair Restoration Center'));

UPDATE outreach SET
  website='https://www.maximhairrestoration.com/',
  email='info@maximhairrestoration.com',
  city='New York, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://www.maximhairrestoration.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@maximhairrestoration.com') OR lower(practice_name)=lower('Maxim Hair Restoration & Transplants');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Maxim Hair Restoration & Transplants', 'https://www.maximhairrestoration.com/', 'info@maximhairrestoration.com', 'New York, NY', 'hair restoration', 1, 'https://www.maximhairrestoration.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@maximhairrestoration.com') OR lower(practice_name)=lower('Maxim Hair Restoration & Transplants'));

UPDATE outreach SET
  website='https://eternalhair.com/',
  email='reception@eternalhair.com',
  city='Totowa, NJ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://eternalhair.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('reception@eternalhair.com') OR lower(practice_name)=lower('Eternal Hair & Esthetics');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Eternal Hair & Esthetics', 'https://eternalhair.com/', 'reception@eternalhair.com', 'Totowa, NJ', 'hair restoration', 1, 'https://eternalhair.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('reception@eternalhair.com') OR lower(practice_name)=lower('Eternal Hair & Esthetics'));

UPDATE outreach SET
  website='https://www.meditresse.com/',
  email='info@meditresse.com',
  city='New York, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.meditresse.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@meditresse.com') OR lower(practice_name)=lower('Medi Tresse');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Medi Tresse', 'https://www.meditresse.com/', 'info@meditresse.com', 'New York, NY', 'hair restoration', 3, 'https://www.meditresse.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@meditresse.com') OR lower(practice_name)=lower('Medi Tresse'));

UPDATE outreach SET
  website='https://sohoskinandhair.com/',
  email='info@sohoskinandhair.com',
  city='New York, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://sohoskinandhair.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@sohoskinandhair.com') OR lower(practice_name)=lower('Soho Skin and Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Soho Skin and Hair Restoration', 'https://sohoskinandhair.com/', 'info@sohoskinandhair.com', 'New York, NY', 'hair restoration', 1, 'https://sohoskinandhair.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@sohoskinandhair.com') OR lower(practice_name)=lower('Soho Skin and Hair Restoration'));

UPDATE outreach SET
  website='https://sagerevivemetuchen.com/',
  email='info@sagerevivemetuchen.com',
  city='Moorestown, NJ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://sagerevivemetuchen.com/',
  source_type='official_public',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@sagerevivemetuchen.com') OR lower(practice_name)=lower('Sage Revive');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Sage Revive', 'https://sagerevivemetuchen.com/', 'info@sagerevivemetuchen.com', 'Moorestown, NJ', 'hair restoration', 3, 'https://sagerevivemetuchen.com/', 'official_public', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@sagerevivemetuchen.com') OR lower(practice_name)=lower('Sage Revive'));

UPDATE outreach SET
  website='https://www.fairfieldderm.com/contact-us/',
  email='info@fairfieldderm.com',
  city='Fairfield, CT',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.fairfieldderm.com/contact-us/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@fairfieldderm.com') OR lower(practice_name)=lower('Fairfield Dermatology');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Fairfield Dermatology', 'https://www.fairfieldderm.com/contact-us/', 'info@fairfieldderm.com', 'Fairfield, CT', 'hair restoration', 3, 'https://www.fairfieldderm.com/contact-us/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@fairfieldderm.com') OR lower(practice_name)=lower('Fairfield Dermatology'));

UPDATE outreach SET
  website='https://geriadermatology.com/',
  email='info@geriadermatology.com',
  city='Rutherford, NJ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://geriadermatology.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@geriadermatology.com') OR lower(practice_name)=lower('Geria Dermatology');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Geria Dermatology', 'https://geriadermatology.com/', 'info@geriadermatology.com', 'Rutherford, NJ', 'hair restoration', 3, 'https://geriadermatology.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@geriadermatology.com') OR lower(practice_name)=lower('Geria Dermatology'));

UPDATE outreach SET
  website='https://amber-dermatology.com/',
  email='info@amber-dermatology.com',
  city='Trumbull, CT',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://amber-dermatology.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@amber-dermatology.com') OR lower(practice_name)=lower('Amber Dermatology');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Amber Dermatology', 'https://amber-dermatology.com/', 'info@amber-dermatology.com', 'Trumbull, CT', 'hair restoration', 3, 'https://amber-dermatology.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@amber-dermatology.com') OR lower(practice_name)=lower('Amber Dermatology'));

UPDATE outreach SET
  website='https://bodiandermatology.com/',
  email='bodiandermatology@gmail.com',
  city='Great Neck, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://bodiandermatology.com/',
  source_type='official_public',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('bodiandermatology@gmail.com') OR lower(practice_name)=lower('Bodian Dermatology Group');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Bodian Dermatology Group', 'https://bodiandermatology.com/', 'bodiandermatology@gmail.com', 'Great Neck, NY', 'hair restoration', 3, 'https://bodiandermatology.com/', 'official_public', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('bodiandermatology@gmail.com') OR lower(practice_name)=lower('Bodian Dermatology Group'));

UPDATE outreach SET
  website='https://lafuehairnyc.com/',
  email='info@lafuehairnyc.com',
  city='Garden City, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://lafuehairnyc.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@lafuehairnyc.com') OR lower(practice_name)=lower('LA FUE Hair New York');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'LA FUE Hair New York', 'https://lafuehairnyc.com/', 'info@lafuehairnyc.com', 'Garden City, NY', 'hair restoration', 1, 'https://lafuehairnyc.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@lafuehairnyc.com') OR lower(practice_name)=lower('LA FUE Hair New York'));

UPDATE outreach SET
  website='https://borealisderm.com/',
  email='info@borealisderm.com',
  city='Garden City, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://borealisderm.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@borealisderm.com') OR lower(practice_name)=lower('Borealis Dermatology');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Borealis Dermatology', 'https://borealisderm.com/', 'info@borealisderm.com', 'Garden City, NY', 'hair restoration', 3, 'https://borealisderm.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@borealisderm.com') OR lower(practice_name)=lower('Borealis Dermatology'));

UPDATE outreach SET
  website='https://allislanddermatology.com/',
  email='help@allislanddermatology.com',
  city='Garden City, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://allislanddermatology.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('help@allislanddermatology.com') OR lower(practice_name)=lower('All Island Dermatology');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'All Island Dermatology', 'https://allislanddermatology.com/', 'help@allislanddermatology.com', 'Garden City, NY', 'hair restoration', 3, 'https://allislanddermatology.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('help@allislanddermatology.com') OR lower(practice_name)=lower('All Island Dermatology'));

UPDATE outreach SET
  website='https://rhrli.com/',
  email='info@rhrli.com',
  city='Woodbury, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://rhrli.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@rhrli.com') OR lower(practice_name)=lower('Robotic Hair Restoration of Long Island');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Robotic Hair Restoration of Long Island', 'https://rhrli.com/', 'info@rhrli.com', 'Woodbury, NY', 'hair restoration', 1, 'https://rhrli.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@rhrli.com') OR lower(practice_name)=lower('Robotic Hair Restoration of Long Island'));

UPDATE outreach SET
  website='https://phoenixhairsystems.com/',
  email='phoenixhairsystems@gmail.com',
  city='Huntington, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://phoenixhairsystems.com/',
  source_type='official_public',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('phoenixhairsystems@gmail.com') OR lower(practice_name)=lower('Phoenix Hair Systems');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Phoenix Hair Systems', 'https://phoenixhairsystems.com/', 'phoenixhairsystems@gmail.com', 'Huntington, NY', 'hair restoration', 1, 'https://phoenixhairsystems.com/', 'official_public', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('phoenixhairsystems@gmail.com') OR lower(practice_name)=lower('Phoenix Hair Systems'));

UPDATE outreach SET
  website='https://dermaduo.com/',
  email='Dermaduo.nyc@gmail.com',
  city='Greenlawn, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://dermaduo.com/',
  source_type='official_public',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Dermaduo.nyc@gmail.com') OR lower(practice_name)=lower('Dermaduo PRP & Wellness');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Dermaduo PRP & Wellness', 'https://dermaduo.com/', 'Dermaduo.nyc@gmail.com', 'Greenlawn, NY', 'hair restoration', 3, 'https://dermaduo.com/', 'official_public', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Dermaduo.nyc@gmail.com') OR lower(practice_name)=lower('Dermaduo PRP & Wellness'));

UPDATE outreach SET
  website='https://philadelphiahairrestoration.com/',
  email='Philadelphiahairrestoration@gmail.com',
  city='Bala Cynwyd, PA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://philadelphiahairrestoration.com/',
  source_type='official_public',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Philadelphiahairrestoration@gmail.com') OR lower(practice_name)=lower('Philadelphia Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Philadelphia Hair Restoration', 'https://philadelphiahairrestoration.com/', 'Philadelphiahairrestoration@gmail.com', 'Bala Cynwyd, PA', 'hair restoration', 1, 'https://philadelphiahairrestoration.com/', 'official_public', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Philadelphiahairrestoration@gmail.com') OR lower(practice_name)=lower('Philadelphia Hair Restoration'));

UPDATE outreach SET
  website='https://embracederm.com/',
  email='info@embracederm.com',
  city='Philadelphia, PA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://embracederm.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@embracederm.com') OR lower(practice_name)=lower('Embrace Dermatology and Aesthetics');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Embrace Dermatology and Aesthetics', 'https://embracederm.com/', 'info@embracederm.com', 'Philadelphia, PA', 'hair restoration', 3, 'https://embracederm.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@embracederm.com') OR lower(practice_name)=lower('Embrace Dermatology and Aesthetics'));

UPDATE outreach SET
  website='https://phillyhairmd.com/',
  email='visit@phillyhairmd.com',
  city='Philadelphia, PA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://phillyhairmd.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('visit@phillyhairmd.com') OR lower(practice_name)=lower('Precision Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Precision Hair Restoration', 'https://phillyhairmd.com/', 'visit@phillyhairmd.com', 'Philadelphia, PA', 'hair restoration', 1, 'https://phillyhairmd.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('visit@phillyhairmd.com') OR lower(practice_name)=lower('Precision Hair Restoration'));

UPDATE outreach SET
  website='https://revivephilly.com/',
  email='info@revivephilly.com',
  city='Philadelphia, PA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://revivephilly.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@revivephilly.com') OR lower(practice_name)=lower('Revive Medical');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Revive Medical', 'https://revivephilly.com/', 'info@revivephilly.com', 'Philadelphia, PA', 'hair restoration', 3, 'https://revivephilly.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@revivephilly.com') OR lower(practice_name)=lower('Revive Medical'));

UPDATE outreach SET
  website='https://reformadermatology.com/',
  email='contact@reformadermatology.com',
  city='Staten Island, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://reformadermatology.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('contact@reformadermatology.com') OR lower(practice_name)=lower('Reforma Dermatology');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Reforma Dermatology', 'https://reformadermatology.com/', 'contact@reformadermatology.com', 'Staten Island, NY', 'hair restoration', 3, 'https://reformadermatology.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('contact@reformadermatology.com') OR lower(practice_name)=lower('Reforma Dermatology'));

UPDATE outreach SET
  website='https://refreshclinic.com/',
  email='info@refreshclinic.com',
  city='Paramus, NJ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://refreshclinic.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@refreshclinic.com') OR lower(practice_name)=lower('Refresh Clinic');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Refresh Clinic', 'https://refreshclinic.com/', 'info@refreshclinic.com', 'Paramus, NJ', 'hair restoration', 3, 'https://refreshclinic.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@refreshclinic.com') OR lower(practice_name)=lower('Refresh Clinic'));

UPDATE outreach SET
  website='https://www.hairmd.com/about',
  email='info@hairmd.com',
  city='Englewood, NJ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://www.hairmd.com/about',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@hairmd.com') OR lower(practice_name)=lower('HAIRMD');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'HAIRMD', 'https://www.hairmd.com/about', 'info@hairmd.com', 'Englewood, NJ', 'hair restoration', 1, 'https://www.hairmd.com/about', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@hairmd.com') OR lower(practice_name)=lower('HAIRMD'));

UPDATE outreach SET
  website='https://njhairinstitute.com/',
  email='info@njhairinstitute.com',
  city='Parsippany, NJ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://njhairinstitute.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@njhairinstitute.com') OR lower(practice_name)=lower('NJ Hair Institute');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'NJ Hair Institute', 'https://njhairinstitute.com/', 'info@njhairinstitute.com', 'Parsippany, NJ', 'hair restoration', 1, 'https://njhairinstitute.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@njhairinstitute.com') OR lower(practice_name)=lower('NJ Hair Institute'));

UPDATE outreach SET
  website='https://www.hairprc.com/',
  email='Info@HairPRC.com',
  city='Cedar Grove, NJ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://www.hairprc.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Info@HairPRC.com') OR lower(practice_name)=lower('Hair Partners Relocation Center');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Hair Partners Relocation Center', 'https://www.hairprc.com/', 'Info@HairPRC.com', 'Cedar Grove, NJ', 'hair restoration', 1, 'https://www.hairprc.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@HairPRC.com') OR lower(practice_name)=lower('Hair Partners Relocation Center'));

UPDATE outreach SET
  website='https://www.ihiclinic.com/contact-us/',
  email='info@ihiclinic.com',
  city='Chicago, IL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.ihiclinic.com/contact-us/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@ihiclinic.com') OR lower(practice_name)=lower('International Hair Institute');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'International Hair Institute', 'https://www.ihiclinic.com/contact-us/', 'info@ihiclinic.com', 'Chicago, IL', 'hair restoration', 2, 'https://www.ihiclinic.com/contact-us/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@ihiclinic.com') OR lower(practice_name)=lower('International Hair Institute'));

UPDATE outreach SET
  website='https://springsrejuvenation.com/locations/new-york/',
  email='info@springsrejuvenation.com',
  city='New York, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://springsrejuvenation.com/locations/new-york/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@springsrejuvenation.com') OR lower(practice_name)=lower('Springs Rejuvenation');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Springs Rejuvenation', 'https://springsrejuvenation.com/locations/new-york/', 'info@springsrejuvenation.com', 'New York, NY', 'hair restoration', 3, 'https://springsrejuvenation.com/locations/new-york/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@springsrejuvenation.com') OR lower(practice_name)=lower('Springs Rejuvenation'));

UPDATE outreach SET
  website='https://menshealthctr.com/',
  email='info@menshealthctr.com',
  city='Skokie, IL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://menshealthctr.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@menshealthctr.com') OR lower(practice_name)=lower('Men''s Health & Wellness Center');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Men''s Health & Wellness Center', 'https://menshealthctr.com/', 'info@menshealthctr.com', 'Skokie, IL', 'hair restoration', 3, 'https://menshealthctr.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@menshealthctr.com') OR lower(practice_name)=lower('Men''s Health & Wellness Center'));

UPDATE outreach SET
  website='https://njhairtransplantcenter.com/contacts/',
  email='info@njhairtransplantcenter.com',
  city='Englishtown, NJ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://njhairtransplantcenter.com/contacts/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@njhairtransplantcenter.com') OR lower(practice_name)=lower('NJ Hair Transplant Center');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'NJ Hair Transplant Center', 'https://njhairtransplantcenter.com/contacts/', 'info@njhairtransplantcenter.com', 'Englishtown, NJ', 'hair restoration', 1, 'https://njhairtransplantcenter.com/contacts/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@njhairtransplantcenter.com') OR lower(practice_name)=lower('NJ Hair Transplant Center'));

UPDATE outreach SET
  website='https://www.americanmane.com/',
  email='info@americanmane.com',
  city='Aventura, FL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.americanmane.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@americanmane.com') OR lower(practice_name)=lower('American Mane');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'American Mane', 'https://www.americanmane.com/', 'info@americanmane.com', 'Aventura, FL', 'hair restoration', 3, 'https://www.americanmane.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@americanmane.com') OR lower(practice_name)=lower('American Mane'));

UPDATE outreach SET
  website='https://www.greenwichpointdermatology.com/hair-regeneration/',
  email='info@greenwichpointderm.com',
  city='Greenwich, CT',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.greenwichpointdermatology.com/hair-regeneration/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@greenwichpointderm.com') OR lower(practice_name)=lower('Greenwich Point Dermatology');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Greenwich Point Dermatology', 'https://www.greenwichpointdermatology.com/hair-regeneration/', 'info@greenwichpointderm.com', 'Greenwich, CT', 'hair restoration', 3, 'https://www.greenwichpointdermatology.com/hair-regeneration/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@greenwichpointderm.com') OR lower(practice_name)=lower('Greenwich Point Dermatology'));

UPDATE outreach SET
  website='https://hairzsystem.com/',
  email='info@hairzsystem.com',
  city='Chicago, IL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://hairzsystem.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@hairzsystem.com') OR lower(practice_name)=lower('Hair Z System');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Hair Z System', 'https://hairzsystem.com/', 'info@hairzsystem.com', 'Chicago, IL', 'hair restoration', 2, 'https://hairzsystem.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@hairzsystem.com') OR lower(practice_name)=lower('Hair Z System'));

UPDATE outreach SET
  website='https://www.txfaces.com/procedures/hair-restoration/hair-transplant/',
  email='info@txfaces.com',
  city='Frisco, TX',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.txfaces.com/procedures/hair-restoration/hair-transplant/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@txfaces.com') OR lower(practice_name)=lower('Texas Facial Aesthetics');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Texas Facial Aesthetics', 'https://www.txfaces.com/procedures/hair-restoration/hair-transplant/', 'info@txfaces.com', 'Frisco, TX', 'hair restoration', 3, 'https://www.txfaces.com/procedures/hair-restoration/hair-transplant/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@txfaces.com') OR lower(practice_name)=lower('Texas Facial Aesthetics'));

UPDATE outreach SET
  website='https://aethosnyc.com/book-online/',
  email='info@aethosnyc.com',
  city='New York, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://aethosnyc.com/book-online/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@aethosnyc.com') OR lower(practice_name)=lower('Aethos');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Aethos', 'https://aethosnyc.com/book-online/', 'info@aethosnyc.com', 'New York, NY', 'hair restoration', 3, 'https://aethosnyc.com/book-online/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@aethosnyc.com') OR lower(practice_name)=lower('Aethos'));

UPDATE outreach SET
  website='https://healthonemedicalcenter.com/',
  email='info@healthonemedicalcenter.com',
  city='Bloomingdale, IL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://healthonemedicalcenter.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@healthonemedicalcenter.com') OR lower(practice_name)=lower('HealthOne Medical Center');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'HealthOne Medical Center', 'https://healthonemedicalcenter.com/', 'info@healthonemedicalcenter.com', 'Bloomingdale, IL', 'hair restoration', 3, 'https://healthonemedicalcenter.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@healthonemedicalcenter.com') OR lower(practice_name)=lower('HealthOne Medical Center'));

UPDATE outreach SET
  website='https://www.tampahairgroup.com/contact',
  email='info@tampahairgroup.com',
  city='Tampa, FL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.tampahairgroup.com/contact',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@tampahairgroup.com') OR lower(practice_name)=lower('Tampa Bay Hair Group');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Tampa Bay Hair Group', 'https://www.tampahairgroup.com/contact', 'info@tampahairgroup.com', 'Tampa, FL', 'hair restoration', 2, 'https://www.tampahairgroup.com/contact', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@tampahairgroup.com') OR lower(practice_name)=lower('Tampa Bay Hair Group'));

UPDATE outreach SET
  website='https://www.premierderm.org/dermatology-services/cosmetic-dermatology/hair-restoration/',
  email='info@premierderm.org',
  city='Wellesley, MA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.premierderm.org/dermatology-services/cosmetic-dermatology/hair-restoration/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@premierderm.org') OR lower(practice_name)=lower('Premier Dermatology');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Premier Dermatology', 'https://www.premierderm.org/dermatology-services/cosmetic-dermatology/hair-restoration/', 'info@premierderm.org', 'Wellesley, MA', 'hair restoration', 3, 'https://www.premierderm.org/dermatology-services/cosmetic-dermatology/hair-restoration/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@premierderm.org') OR lower(practice_name)=lower('Premier Dermatology'));

UPDATE outreach SET
  website='https://quellaesthetics.com/aesthetics/hair-restoration/',
  email='info@quellaesthetics.com',
  city='Maryville, IL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://quellaesthetics.com/aesthetics/hair-restoration/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@quellaesthetics.com') OR lower(practice_name)=lower('Quell Aesthetics & Wellness');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Quell Aesthetics & Wellness', 'https://quellaesthetics.com/aesthetics/hair-restoration/', 'info@quellaesthetics.com', 'Maryville, IL', 'hair restoration', 3, 'https://quellaesthetics.com/aesthetics/hair-restoration/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@quellaesthetics.com') OR lower(practice_name)=lower('Quell Aesthetics & Wellness'));

UPDATE outreach SET
  website='https://www.vivevidamed.com/',
  email='info@ViveVidaMed.com',
  city='Farmington, CT',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.vivevidamed.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@ViveVidaMed.com') OR lower(practice_name)=lower('Vive Vida Medical');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Vive Vida Medical', 'https://www.vivevidamed.com/', 'info@ViveVidaMed.com', 'Farmington, CT', 'hair restoration', 3, 'https://www.vivevidamed.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@ViveVidaMed.com') OR lower(practice_name)=lower('Vive Vida Medical'));

UPDATE outreach SET
  website='https://ohiohairsolutions.com/',
  email='Info@ohiohairsolutions.com',
  city='Canton, OH',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://ohiohairsolutions.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Info@ohiohairsolutions.com') OR lower(practice_name)=lower('Ohio Hair Solutions');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Ohio Hair Solutions', 'https://ohiohairsolutions.com/', 'Info@ohiohairsolutions.com', 'Canton, OH', 'hair restoration', 2, 'https://ohiohairsolutions.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@ohiohairsolutions.com') OR lower(practice_name)=lower('Ohio Hair Solutions'));

UPDATE outreach SET
  website='https://www.virginiahairtransplant.com/request-callback/',
  email='Info@VirginiaHairTransplant.com',
  city='Leesburg, VA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.virginiahairtransplant.com/request-callback/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Info@VirginiaHairTransplant.com') OR lower(practice_name)=lower('Virginia Hair Transplant');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Virginia Hair Transplant', 'https://www.virginiahairtransplant.com/request-callback/', 'Info@VirginiaHairTransplant.com', 'Leesburg, VA', 'hair restoration', 2, 'https://www.virginiahairtransplant.com/request-callback/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@VirginiaHairTransplant.com') OR lower(practice_name)=lower('Virginia Hair Transplant'));

UPDATE outreach SET
  website='https://www.chambershair.net/',
  email='info@chambershair.net',
  city='Troy, MI',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.chambershair.net/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@chambershair.net') OR lower(practice_name)=lower('Chambers Hair Institute');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Chambers Hair Institute', 'https://www.chambershair.net/', 'info@chambershair.net', 'Troy, MI', 'hair restoration', 2, 'https://www.chambershair.net/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@chambershair.net') OR lower(practice_name)=lower('Chambers Hair Institute'));

UPDATE outreach SET
  website='https://www.dcsurgicalarts.com/facial-cosmetics/prp-hair-restoration',
  email='info@dcsurgicalarts.com',
  city='Washington, DC',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.dcsurgicalarts.com/facial-cosmetics/prp-hair-restoration',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@dcsurgicalarts.com') OR lower(practice_name)=lower('DC Surgical Arts');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'DC Surgical Arts', 'https://www.dcsurgicalarts.com/facial-cosmetics/prp-hair-restoration', 'info@dcsurgicalarts.com', 'Washington, DC', 'hair restoration', 3, 'https://www.dcsurgicalarts.com/facial-cosmetics/prp-hair-restoration', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@dcsurgicalarts.com') OR lower(practice_name)=lower('DC Surgical Arts'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=georgia',
  email='Info@AndersonHSC.com',
  city='Atlanta, GA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=georgia',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Info@AndersonHSC.com') OR lower(practice_name)=lower('Anderson Center for Hair');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Anderson Center for Hair', 'https://www.americanhairloss.org/?surgeonlocation=georgia', 'Info@AndersonHSC.com', 'Atlanta, GA', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=georgia', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@AndersonHSC.com') OR lower(practice_name)=lower('Anderson Center for Hair'));

UPDATE outreach SET
  website='https://www.nahairrestoration.com/contact/',
  email='info@nahairrestoration.com',
  city='Alpharetta, GA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.nahairrestoration.com/contact/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@nahairrestoration.com') OR lower(practice_name)=lower('North Atlanta Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'North Atlanta Hair Restoration', 'https://www.nahairrestoration.com/contact/', 'info@nahairrestoration.com', 'Alpharetta, GA', 'hair restoration', 2, 'https://www.nahairrestoration.com/contact/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@nahairrestoration.com') OR lower(practice_name)=lower('North Atlanta Hair Restoration'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=georgia',
  email='drwetzel@andersonhsc.com',
  city='Atlanta, GA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=georgia',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('drwetzel@andersonhsc.com') OR lower(practice_name)=lower('Anderson Center for Hair - Dr Wetzel');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Anderson Center for Hair - Dr Wetzel', 'https://www.americanhairloss.org/?surgeonlocation=georgia', 'drwetzel@andersonhsc.com', 'Atlanta, GA', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=georgia', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drwetzel@andersonhsc.com') OR lower(practice_name)=lower('Anderson Center for Hair - Dr Wetzel'));

UPDATE outreach SET
  website='https://www.visiondermatology.com/services-4',
  email='Medspa@visiondermatology.com',
  city='Raleigh, NC',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.visiondermatology.com/services-4',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Medspa@visiondermatology.com') OR lower(practice_name)=lower('Vision Dermatology Med Spa');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Vision Dermatology Med Spa', 'https://www.visiondermatology.com/services-4', 'Medspa@visiondermatology.com', 'Raleigh, NC', 'hair restoration', 3, 'https://www.visiondermatology.com/services-4', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Medspa@visiondermatology.com') OR lower(practice_name)=lower('Vision Dermatology Med Spa'));

UPDATE outreach SET
  website='https://www.visiondermatology.com/services-4',
  email='Info@visiondermatology.com',
  city='Raleigh, NC',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.visiondermatology.com/services-4',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Info@visiondermatology.com') OR lower(practice_name)=lower('Vision Dermatology');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Vision Dermatology', 'https://www.visiondermatology.com/services-4', 'Info@visiondermatology.com', 'Raleigh, NC', 'hair restoration', 3, 'https://www.visiondermatology.com/services-4', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@visiondermatology.com') OR lower(practice_name)=lower('Vision Dermatology'));

UPDATE outreach SET
  website='https://rewindmeaesthetics.com/',
  email='info@rewindmeaesthetics.com',
  city='Washington, DC',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://rewindmeaesthetics.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@rewindmeaesthetics.com') OR lower(practice_name)=lower('Rewind Me Aesthetic Boutique');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Rewind Me Aesthetic Boutique', 'https://rewindmeaesthetics.com/', 'info@rewindmeaesthetics.com', 'Washington, DC', 'hair restoration', 3, 'https://rewindmeaesthetics.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@rewindmeaesthetics.com') OR lower(practice_name)=lower('Rewind Me Aesthetic Boutique'));

UPDATE outreach SET
  website='https://www.aestheticartskincare.com/service-page/hair-restoration',
  email='info@aestheticartskincare.com',
  city='West Bloomfield, MI',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.aestheticartskincare.com/service-page/hair-restoration',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@aestheticartskincare.com') OR lower(practice_name)=lower('Aesthetic Art');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Aesthetic Art', 'https://www.aestheticartskincare.com/service-page/hair-restoration', 'info@aestheticartskincare.com', 'West Bloomfield, MI', 'hair restoration', 3, 'https://www.aestheticartskincare.com/service-page/hair-restoration', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@aestheticartskincare.com') OR lower(practice_name)=lower('Aesthetic Art'));

UPDATE outreach SET
  website='https://www.chattanoogaface.com/services/restorative-hair-therapy/',
  email='info@chattanoogaface.com',
  city='Chattanooga, TN',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.chattanoogaface.com/services/restorative-hair-therapy/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@chattanoogaface.com') OR lower(practice_name)=lower('Center for Facial Rejuvenation');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Center for Facial Rejuvenation', 'https://www.chattanoogaface.com/services/restorative-hair-therapy/', 'info@chattanoogaface.com', 'Chattanooga, TN', 'hair restoration', 3, 'https://www.chattanoogaface.com/services/restorative-hair-therapy/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@chattanoogaface.com') OR lower(practice_name)=lower('Center for Facial Rejuvenation'));

UPDATE outreach SET
  website='https://boutiquewellnessnc.com/hair-restoration/',
  email='info@bw-nc.com',
  city='Winston-Salem, NC',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://boutiquewellnessnc.com/hair-restoration/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@bw-nc.com') OR lower(practice_name)=lower('Boutique Wellness');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Boutique Wellness', 'https://boutiquewellnessnc.com/hair-restoration/', 'info@bw-nc.com', 'Winston-Salem, NC', 'hair restoration', 3, 'https://boutiquewellnessnc.com/hair-restoration/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@bw-nc.com') OR lower(practice_name)=lower('Boutique Wellness'));

UPDATE outreach SET
  website='https://axioshealthco.com/prp-hair-restoration/',
  email='info@axioshealthco.com',
  city='Longmont, CO',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://axioshealthco.com/prp-hair-restoration/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@axioshealthco.com') OR lower(practice_name)=lower('Axios Health and Wellness');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Axios Health and Wellness', 'https://axioshealthco.com/prp-hair-restoration/', 'info@axioshealthco.com', 'Longmont, CO', 'hair restoration', 3, 'https://axioshealthco.com/prp-hair-restoration/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@axioshealthco.com') OR lower(practice_name)=lower('Axios Health and Wellness'));

UPDATE outreach SET
  website='https://nuvidameda.com/services/hair-restoration/',
  email='Info@nuvidameda.com',
  city='Highlands Ranch, CO',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://nuvidameda.com/services/hair-restoration/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Info@nuvidameda.com') OR lower(practice_name)=lower('NuVida Medical and Aesthetics');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'NuVida Medical and Aesthetics', 'https://nuvidameda.com/services/hair-restoration/', 'Info@nuvidameda.com', 'Highlands Ranch, CO', 'hair restoration', 3, 'https://nuvidameda.com/services/hair-restoration/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@nuvidameda.com') OR lower(practice_name)=lower('NuVida Medical and Aesthetics'));

UPDATE outreach SET
  website='https://biofunctionalmed.com/g/hairrestoration/',
  email='info@biofunctionalmed.com',
  city='Raleigh, NC',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://biofunctionalmed.com/g/hairrestoration/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@biofunctionalmed.com') OR lower(practice_name)=lower('BioFunctional Med');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'BioFunctional Med', 'https://biofunctionalmed.com/g/hairrestoration/', 'info@biofunctionalmed.com', 'Raleigh, NC', 'hair restoration', 3, 'https://biofunctionalmed.com/g/hairrestoration/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@biofunctionalmed.com') OR lower(practice_name)=lower('BioFunctional Med'));

UPDATE outreach SET
  website='https://nocohealthcare.com/regenerative-hair-restoration-greeley/',
  email='info@nocohealthcare.com',
  city='Greeley, CO',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://nocohealthcare.com/regenerative-hair-restoration-greeley/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@nocohealthcare.com') OR lower(practice_name)=lower('NOCO Healthcare');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'NOCO Healthcare', 'https://nocohealthcare.com/regenerative-hair-restoration-greeley/', 'info@nocohealthcare.com', 'Greeley, CO', 'hair restoration', 3, 'https://nocohealthcare.com/regenerative-hair-restoration-greeley/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@nocohealthcare.com') OR lower(practice_name)=lower('NOCO Healthcare'));

UPDATE outreach SET
  website='https://thebeautyrefynery.com/hair-restoration/',
  email='info@thebeautyrefynery.com',
  city='Franklin, TN',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://thebeautyrefynery.com/hair-restoration/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@thebeautyrefynery.com') OR lower(practice_name)=lower('The Beauty Refynery');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'The Beauty Refynery', 'https://thebeautyrefynery.com/hair-restoration/', 'info@thebeautyrefynery.com', 'Franklin, TN', 'hair restoration', 3, 'https://thebeautyrefynery.com/hair-restoration/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@thebeautyrefynery.com') OR lower(practice_name)=lower('The Beauty Refynery'));

UPDATE outreach SET
  website='https://broadwayplasticsurgery.com/',
  email='INFO@BROADWAYMD.COM',
  city='Lone Tree, CO',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://broadwayplasticsurgery.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('INFO@BROADWAYMD.COM') OR lower(practice_name)=lower('Broadway Plastic Surgery Group');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Broadway Plastic Surgery Group', 'https://broadwayplasticsurgery.com/', 'INFO@BROADWAYMD.COM', 'Lone Tree, CO', 'hair restoration', 3, 'https://broadwayplasticsurgery.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('INFO@BROADWAYMD.COM') OR lower(practice_name)=lower('Broadway Plastic Surgery Group'));

UPDATE outreach SET
  website='https://www.mihairdoc.com/local-drs-berry-tessler-aronovitz-hair-restoration-specialists-fue-artas-robotic-transplant-shelby-town-mi',
  email='info@mihairdoc.com',
  city='Shelby Township, MI',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.mihairdoc.com/local-drs-berry-tessler-aronovitz-hair-restoration-specialists-fue-artas-robotic-transplant-shelby-town-mi',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@mihairdoc.com') OR lower(practice_name)=lower('Michigan Hair Doc');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Michigan Hair Doc', 'https://www.mihairdoc.com/local-drs-berry-tessler-aronovitz-hair-restoration-specialists-fue-artas-robotic-transplant-shelby-town-mi', 'info@mihairdoc.com', 'Shelby Township, MI', 'hair restoration', 2, 'https://www.mihairdoc.com/local-drs-berry-tessler-aronovitz-hair-restoration-specialists-fue-artas-robotic-transplant-shelby-town-mi', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@mihairdoc.com') OR lower(practice_name)=lower('Michigan Hair Doc'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=arizona',
  email='staff@drscottalexander.com',
  city='Phoenix, AZ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=arizona',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('staff@drscottalexander.com') OR lower(practice_name)=lower('Biltmore Surgical Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Biltmore Surgical Hair Restoration', 'https://www.americanhairloss.org/?surgeonlocation=arizona', 'staff@drscottalexander.com', 'Phoenix, AZ', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=arizona', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('staff@drscottalexander.com') OR lower(practice_name)=lower('Biltmore Surgical Hair Restoration'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=arizona',
  email='drkeene@hairrestore.com',
  city='Tucson, AZ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=arizona',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('drkeene@hairrestore.com') OR lower(practice_name)=lower('Physician''s Hair Institute');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Physician''s Hair Institute', 'https://www.americanhairloss.org/?surgeonlocation=arizona', 'drkeene@hairrestore.com', 'Tucson, AZ', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=arizona', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drkeene@hairrestore.com') OR lower(practice_name)=lower('Physician''s Hair Institute'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=connecticut',
  email='drboden@hairtransplantct.com',
  city='Wethersfield, CT',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://www.americanhairloss.org/?surgeonlocation=connecticut',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('drboden@hairtransplantct.com') OR lower(practice_name)=lower('Hair Restoration & Aesthetic Medicine Center');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Hair Restoration & Aesthetic Medicine Center', 'https://www.americanhairloss.org/?surgeonlocation=connecticut', 'drboden@hairtransplantct.com', 'Wethersfield, CT', 'hair restoration', 1, 'https://www.americanhairloss.org/?surgeonlocation=connecticut', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drboden@hairtransplantct.com') OR lower(practice_name)=lower('Hair Restoration & Aesthetic Medicine Center'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=new-york',
  email='docdauer@me.com',
  city='New York, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://www.americanhairloss.org/?surgeonlocation=new-york',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('docdauer@me.com') OR lower(practice_name)=lower('Dauer Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Dauer Hair Restoration', 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'docdauer@me.com', 'New York, NY', 'hair restoration', 1, 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('docdauer@me.com') OR lower(practice_name)=lower('Dauer Hair Restoration'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=new-york',
  email='drdorin@thehairlossdoctors.com',
  city='Garden City, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://www.americanhairloss.org/?surgeonlocation=new-york',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('drdorin@thehairlossdoctors.com') OR lower(practice_name)=lower('The Hair Loss Doctors');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'The Hair Loss Doctors', 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'drdorin@thehairlossdoctors.com', 'Garden City, NY', 'hair restoration', 1, 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drdorin@thehairlossdoctors.com') OR lower(practice_name)=lower('The Hair Loss Doctors'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=new-york',
  email='thomas.law2@verizon.net',
  city='New York, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://www.americanhairloss.org/?surgeonlocation=new-york',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('thomas.law2@verizon.net') OR lower(practice_name)=lower('NYC Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'NYC Hair Restoration', 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'thomas.law2@verizon.net', 'New York, NY', 'hair restoration', 1, 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('thomas.law2@verizon.net') OR lower(practice_name)=lower('NYC Hair Restoration'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=new-york',
  email='carloskw@aya.yale.edu',
  city='New York, NY',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=1,
  source_url='https://www.americanhairloss.org/?surgeonlocation=new-york',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('carloskw@aya.yale.edu') OR lower(practice_name)=lower('Carlos Wesley Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Carlos Wesley Hair Restoration', 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'carloskw@aya.yale.edu', 'New York, NY', 'hair restoration', 1, 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('carloskw@aya.yale.edu') OR lower(practice_name)=lower('Carlos Wesley Hair Restoration'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=texas',
  email='info@mcgrathmedical.com',
  city='Austin, TX',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.americanhairloss.org/?surgeonlocation=texas',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@mcgrathmedical.com') OR lower(practice_name)=lower('McGrath Medical');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'McGrath Medical', 'https://www.americanhairloss.org/?surgeonlocation=texas', 'info@mcgrathmedical.com', 'Austin, TX', 'hair restoration', 3, 'https://www.americanhairloss.org/?surgeonlocation=texas', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@mcgrathmedical.com') OR lower(practice_name)=lower('McGrath Medical'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=texas',
  email='yaker@yakermd.com',
  city='Plano, TX',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=texas',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('yaker@yakermd.com') OR lower(practice_name)=lower('Yaker Hair Restoration + Med Spa');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Yaker Hair Restoration + Med Spa', 'https://www.americanhairloss.org/?surgeonlocation=texas', 'yaker@yakermd.com', 'Plano, TX', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=texas', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('yaker@yakermd.com') OR lower(practice_name)=lower('Yaker Hair Restoration + Med Spa'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=illinois',
  email='vpanine@drpanine.com',
  city='Chicago, IL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=illinois',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('vpanine@drpanine.com') OR lower(practice_name)=lower('Chicago Hair Transplant Clinic');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Chicago Hair Transplant Clinic', 'https://www.americanhairloss.org/?surgeonlocation=illinois', 'vpanine@drpanine.com', 'Chicago, IL', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=illinois', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('vpanine@drpanine.com') OR lower(practice_name)=lower('Chicago Hair Transplant Clinic'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=virginia',
  email='drwlindsey@gmail.com',
  city='McLean, VA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=virginia',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('drwlindsey@gmail.com') OR lower(practice_name)=lower('Nova Hair Center');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Nova Hair Center', 'https://www.americanhairloss.org/?surgeonlocation=virginia', 'drwlindsey@gmail.com', 'McLean, VA', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=virginia', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drwlindsey@gmail.com') OR lower(practice_name)=lower('Nova Hair Center'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=north-carolina',
  email='JCooley@haircenter.com',
  city='Charlotte, NC',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=north-carolina',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('JCooley@haircenter.com') OR lower(practice_name)=lower('The Hair Center');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'The Hair Center', 'https://www.americanhairloss.org/?surgeonlocation=north-carolina', 'JCooley@haircenter.com', 'Charlotte, NC', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=north-carolina', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('JCooley@haircenter.com') OR lower(practice_name)=lower('The Hair Center'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=utah',
  email='eric@alviarmani.com',
  city='Salt Lake City, UT',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.americanhairloss.org/?surgeonlocation=utah',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('eric@alviarmani.com') OR lower(practice_name)=lower('Alvi Armani');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Alvi Armani', 'https://www.americanhairloss.org/?surgeonlocation=utah', 'eric@alviarmani.com', 'Salt Lake City, UT', 'hair restoration', 3, 'https://www.americanhairloss.org/?surgeonlocation=utah', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('eric@alviarmani.com') OR lower(practice_name)=lower('Alvi Armani'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=south-carolina',
  email='mvories@CarolinaHairSurgery.com',
  city='Mount Pleasant, SC',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=south-carolina',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('mvories@CarolinaHairSurgery.com') OR lower(practice_name)=lower('Carolina Hair Surgery');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Carolina Hair Surgery', 'https://www.americanhairloss.org/?surgeonlocation=south-carolina', 'mvories@CarolinaHairSurgery.com', 'Mount Pleasant, SC', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=south-carolina', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('mvories@CarolinaHairSurgery.com') OR lower(practice_name)=lower('Carolina Hair Surgery'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=florida',
  email='doctorb@baumanmedical.com',
  city='Boca Raton, FL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.americanhairloss.org/?surgeonlocation=florida',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('doctorb@baumanmedical.com') OR lower(practice_name)=lower('Bauman Medical Group');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Bauman Medical Group', 'https://www.americanhairloss.org/?surgeonlocation=florida', 'doctorb@baumanmedical.com', 'Boca Raton, FL', 'hair restoration', 3, 'https://www.americanhairloss.org/?surgeonlocation=florida', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('doctorb@baumanmedical.com') OR lower(practice_name)=lower('Bauman Medical Group'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=florida',
  email='draron@miamihair.com',
  city='Miami, FL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=florida',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('draron@miamihair.com') OR lower(practice_name)=lower('Miami Hair Institute - Dr Aron Nusbaum');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Miami Hair Institute - Dr Aron Nusbaum', 'https://www.americanhairloss.org/?surgeonlocation=florida', 'draron@miamihair.com', 'Miami, FL', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=florida', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('draron@miamihair.com') OR lower(practice_name)=lower('Miami Hair Institute - Dr Aron Nusbaum'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=florida',
  email='drnusbaum@miamihair.com',
  city='Miami, FL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=florida',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('drnusbaum@miamihair.com') OR lower(practice_name)=lower('Miami Hair Institute - Dr Bernard Nusbaum');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Miami Hair Institute - Dr Bernard Nusbaum', 'https://www.americanhairloss.org/?surgeonlocation=florida', 'drnusbaum@miamihair.com', 'Miami, FL', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=florida', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drnusbaum@miamihair.com') OR lower(practice_name)=lower('Miami Hair Institute - Dr Bernard Nusbaum'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=florida',
  email='Md.chumak@bringbackhair.com',
  city='Fort Lauderdale, FL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=florida',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Md.chumak@bringbackhair.com') OR lower(practice_name)=lower('Hair By Dr Max');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Hair By Dr Max', 'https://www.americanhairloss.org/?surgeonlocation=florida', 'Md.chumak@bringbackhair.com', 'Fort Lauderdale, FL', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=florida', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Md.chumak@bringbackhair.com') OR lower(practice_name)=lower('Hair By Dr Max'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=california',
  email='dermhair5@gmail.com',
  city='Los Angeles, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=california',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('dermhair5@gmail.com') OR lower(practice_name)=lower('Dermatology & Hair Restoration Specialists');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Dermatology & Hair Restoration Specialists', 'https://www.americanhairloss.org/?surgeonlocation=california', 'dermhair5@gmail.com', 'Los Angeles, CA', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=california', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('dermhair5@gmail.com') OR lower(practice_name)=lower('Dermatology & Hair Restoration Specialists'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=california',
  email='tcarmanmd@ljhr.com',
  city='La Jolla, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=california',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('tcarmanmd@ljhr.com') OR lower(practice_name)=lower('La Jolla Hair Restoration Medical Center');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'La Jolla Hair Restoration Medical Center', 'https://www.americanhairloss.org/?surgeonlocation=california', 'tcarmanmd@ljhr.com', 'La Jolla, CA', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=california', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('tcarmanmd@ljhr.com') OR lower(practice_name)=lower('La Jolla Hair Restoration Medical Center'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=california',
  email='drvarona@VaronaHairRestoration.com',
  city='Newport Beach, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=california',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('drvarona@VaronaHairRestoration.com') OR lower(practice_name)=lower('Varona Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Varona Hair Restoration', 'https://www.americanhairloss.org/?surgeonlocation=california', 'drvarona@VaronaHairRestoration.com', 'Newport Beach, CA', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=california', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drvarona@VaronaHairRestoration.com') OR lower(practice_name)=lower('Varona Hair Restoration'));

UPDATE outreach SET
  website='https://www.americanhairloss.org/?surgeonlocation=california',
  email='info@modenahair.com',
  city='Newport Beach, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.americanhairloss.org/?surgeonlocation=california',
  source_type='public_directory',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@modenahair.com') OR lower(practice_name)=lower('Modena Hair Institute');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Modena Hair Institute', 'https://www.americanhairloss.org/?surgeonlocation=california', 'info@modenahair.com', 'Newport Beach, CA', 'hair restoration', 2, 'https://www.americanhairloss.org/?surgeonlocation=california', 'public_directory', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@modenahair.com') OR lower(practice_name)=lower('Modena Hair Institute'));

UPDATE outreach SET
  website='https://www.rejuvsf.com/hair-restoration',
  email='info@rejuvsf.com',
  city='San Francisco, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.rejuvsf.com/hair-restoration',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@rejuvsf.com') OR lower(practice_name)=lower('Rejuv Medical');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Rejuv Medical', 'https://www.rejuvsf.com/hair-restoration', 'info@rejuvsf.com', 'San Francisco, CA', 'hair restoration', 3, 'https://www.rejuvsf.com/hair-restoration', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@rejuvsf.com') OR lower(practice_name)=lower('Rejuv Medical'));

UPDATE outreach SET
  website='https://www.concordhair.com/',
  email='info@ConcordHairRestoration.com',
  city='Encino, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.concordhair.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@ConcordHairRestoration.com') OR lower(practice_name)=lower('Concord Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Concord Hair Restoration', 'https://www.concordhair.com/', 'info@ConcordHairRestoration.com', 'Encino, CA', 'hair restoration', 2, 'https://www.concordhair.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@ConcordHairRestoration.com') OR lower(practice_name)=lower('Concord Hair Restoration'));

UPDATE outreach SET
  website='https://www.sandiegohairlossspecialist.com/san-diego-hair-restoration',
  email='Info@SanDiegoHairLossSpecialist.com',
  city='Del Mar, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.sandiegohairlossspecialist.com/san-diego-hair-restoration',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Info@SanDiegoHairLossSpecialist.com') OR lower(practice_name)=lower('Advanced Hair');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Advanced Hair', 'https://www.sandiegohairlossspecialist.com/san-diego-hair-restoration', 'Info@SanDiegoHairLossSpecialist.com', 'Del Mar, CA', 'hair restoration', 2, 'https://www.sandiegohairlossspecialist.com/san-diego-hair-restoration', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@SanDiegoHairLossSpecialist.com') OR lower(practice_name)=lower('Advanced Hair'));

UPDATE outreach SET
  website='https://hairreplacementsurgeon.com/',
  email='info@northwesthair.com',
  city='Tacoma, WA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://hairreplacementsurgeon.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@northwesthair.com') OR lower(practice_name)=lower('Northwest Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Northwest Hair Restoration', 'https://hairreplacementsurgeon.com/', 'info@northwesthair.com', 'Tacoma, WA', 'hair restoration', 2, 'https://hairreplacementsurgeon.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@northwesthair.com') OR lower(practice_name)=lower('Northwest Hair Restoration'));

UPDATE outreach SET
  website='https://www.xplicithairstudio.com/contactus',
  email='info@xplicithairstudio.com',
  city='San Diego, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.xplicithairstudio.com/contactus',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@xplicithairstudio.com') OR lower(practice_name)=lower('Xplicit Hair Restoration');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Xplicit Hair Restoration', 'https://www.xplicithairstudio.com/contactus', 'info@xplicithairstudio.com', 'San Diego, CA', 'hair restoration', 2, 'https://www.xplicithairstudio.com/contactus', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@xplicithairstudio.com') OR lower(practice_name)=lower('Xplicit Hair Restoration'));

UPDATE outreach SET
  website='https://www.clearformaesthetics.com/',
  email='info@ClearFormAesthetics.com',
  city='Portland, OR',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.clearformaesthetics.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@ClearFormAesthetics.com') OR lower(practice_name)=lower('ClearForm Aesthetics');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'ClearForm Aesthetics', 'https://www.clearformaesthetics.com/', 'info@ClearFormAesthetics.com', 'Portland, OR', 'hair restoration', 3, 'https://www.clearformaesthetics.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@ClearFormAesthetics.com') OR lower(practice_name)=lower('ClearForm Aesthetics'));

UPDATE outreach SET
  website='https://hair.regrowmedical.com/',
  email='info@regrowmedical.com',
  city='Los Angeles, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://hair.regrowmedical.com/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@regrowmedical.com') OR lower(practice_name)=lower('ReGrow Medical');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'ReGrow Medical', 'https://hair.regrowmedical.com/', 'info@regrowmedical.com', 'Los Angeles, CA', 'hair restoration', 3, 'https://hair.regrowmedical.com/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@regrowmedical.com') OR lower(practice_name)=lower('ReGrow Medical'));

UPDATE outreach SET
  website='https://www.agapehair-wellness.com/about',
  email='info@agapehair-wellness.com',
  city='Tempe, AZ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.agapehair-wellness.com/about',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@agapehair-wellness.com') OR lower(practice_name)=lower('Agape Hair + Wellness');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Agape Hair + Wellness', 'https://www.agapehair-wellness.com/about', 'info@agapehair-wellness.com', 'Tempe, AZ', 'hair restoration', 2, 'https://www.agapehair-wellness.com/about', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@agapehair-wellness.com') OR lower(practice_name)=lower('Agape Hair + Wellness'));

UPDATE outreach SET
  website='https://www.californiahairandskininstitute.com/contact-us',
  email='info@chsi.health',
  city='San Diego, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.californiahairandskininstitute.com/contact-us',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@chsi.health') OR lower(practice_name)=lower('California Hair and Skin Institute');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'California Hair and Skin Institute', 'https://www.californiahairandskininstitute.com/contact-us', 'info@chsi.health', 'San Diego, CA', 'hair restoration', 2, 'https://www.californiahairandskininstitute.com/contact-us', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@chsi.health') OR lower(practice_name)=lower('California Hair and Skin Institute'));

UPDATE outreach SET
  website='https://www.nhlma.com/hair-restoration-services',
  email='info@nhlma.com',
  city='Scottsdale, AZ',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://www.nhlma.com/hair-restoration-services',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@nhlma.com') OR lower(practice_name)=lower('National Hair Loss Medical Aesthetics');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'National Hair Loss Medical Aesthetics', 'https://www.nhlma.com/hair-restoration-services', 'info@nhlma.com', 'Scottsdale, AZ', 'hair restoration', 2, 'https://www.nhlma.com/hair-restoration-services', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@nhlma.com') OR lower(practice_name)=lower('National Hair Loss Medical Aesthetics'));

UPDATE outreach SET
  website='https://denverhairclinic.com/services/hair-transplant-surgery/',
  email='info@denverhairclinic.com',
  city='Denver, CO',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://denverhairclinic.com/services/hair-transplant-surgery/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@denverhairclinic.com') OR lower(practice_name)=lower('Denver Hair Clinic');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Denver Hair Clinic', 'https://denverhairclinic.com/services/hair-transplant-surgery/', 'info@denverhairclinic.com', 'Denver, CO', 'hair restoration', 2, 'https://denverhairclinic.com/services/hair-transplant-surgery/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@denverhairclinic.com') OR lower(practice_name)=lower('Denver Hair Clinic'));

UPDATE outreach SET
  website='https://www.bevelseattle.com/contact',
  email='info@bevelseattle.com',
  city='Seattle, WA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.bevelseattle.com/contact',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@bevelseattle.com') OR lower(practice_name)=lower('Bevel Aesthetics');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Bevel Aesthetics', 'https://www.bevelseattle.com/contact', 'info@bevelseattle.com', 'Seattle, WA', 'hair restoration', 3, 'https://www.bevelseattle.com/contact', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@bevelseattle.com') OR lower(practice_name)=lower('Bevel Aesthetics'));

UPDATE outreach SET
  website='https://hairtransplantslosangeles.com/contact-us/',
  email='rob@regen.la',
  city='Los Angeles, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://hairtransplantslosangeles.com/contact-us/',
  source_type='official_public',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('rob@regen.la') OR lower(practice_name)=lower('Regen LA');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Regen LA', 'https://hairtransplantslosangeles.com/contact-us/', 'rob@regen.la', 'Los Angeles, CA', 'hair restoration', 3, 'https://hairtransplantslosangeles.com/contact-us/', 'official_public', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('rob@regen.la') OR lower(practice_name)=lower('Regen LA'));

UPDATE outreach SET
  website='https://hairtransplantslosangeles.com/contact-us/',
  email='info@regen.la',
  city='Los Angeles, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://hairtransplantslosangeles.com/contact-us/',
  source_type='official_public',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@regen.la') OR lower(practice_name)=lower('Regen LA General');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Regen LA General', 'https://hairtransplantslosangeles.com/contact-us/', 'info@regen.la', 'Los Angeles, CA', 'hair restoration', 3, 'https://hairtransplantslosangeles.com/contact-us/', 'official_public', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@regen.la') OR lower(practice_name)=lower('Regen LA General'));

UPDATE outreach SET
  website='https://hairtransplantslosangeles.com/contact-us/',
  email='info@hairtransplantslosangeles.com',
  city='Los Angeles, CA',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://hairtransplantslosangeles.com/contact-us/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@hairtransplantslosangeles.com') OR lower(practice_name)=lower('Best Hair Transplant LA');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Best Hair Transplant LA', 'https://hairtransplantslosangeles.com/contact-us/', 'info@hairtransplantslosangeles.com', 'Los Angeles, CA', 'hair restoration', 2, 'https://hairtransplantslosangeles.com/contact-us/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@hairtransplantslosangeles.com') OR lower(practice_name)=lower('Best Hair Transplant LA'));

UPDATE outreach SET
  website='https://orlandohairclinic.com/contact-us/',
  email='info@orlandohairclinic.com',
  city='Orlando, FL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=2,
  source_url='https://orlandohairclinic.com/contact-us/',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@orlandohairclinic.com') OR lower(practice_name)=lower('Orlando Hair Clinic');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Orlando Hair Clinic', 'https://orlandohairclinic.com/contact-us/', 'info@orlandohairclinic.com', 'Orlando, FL', 'hair restoration', 2, 'https://orlandohairclinic.com/contact-us/', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@orlandohairclinic.com') OR lower(practice_name)=lower('Orlando Hair Clinic'));

UPDATE outreach SET
  website='https://www.scenthouston.com/hair-translplant',
  email='info@scenthouston.com',
  city='Houston, TX',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.scenthouston.com/hair-translplant',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@scenthouston.com') OR lower(practice_name)=lower('SCENT Houston');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'SCENT Houston', 'https://www.scenthouston.com/hair-translplant', 'info@scenthouston.com', 'Houston, TX', 'hair restoration', 3, 'https://www.scenthouston.com/hair-translplant', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@scenthouston.com') OR lower(practice_name)=lower('SCENT Houston'));

UPDATE outreach SET
  website='https://gloryregenerative.com/locations/tampa-fl',
  email='info@gloryregenerative.com',
  city='Tampa, FL',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://gloryregenerative.com/locations/tampa-fl',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('info@gloryregenerative.com') OR lower(practice_name)=lower('Glory Regenerative Center');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Glory Regenerative Center', 'https://gloryregenerative.com/locations/tampa-fl', 'info@gloryregenerative.com', 'Tampa, FL', 'hair restoration', 3, 'https://gloryregenerative.com/locations/tampa-fl', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@gloryregenerative.com') OR lower(practice_name)=lower('Glory Regenerative Center'));

UPDATE outreach SET
  website='https://www.dallasmenshealth.com/services/hair-restoration-treatments',
  email='Info@DallasMensHealth.com',
  city='Dallas, TX',
  category=COALESCE(NULLIF(category,''), 'hair restoration'),
  priority=3,
  source_url='https://www.dallasmenshealth.com/services/hair-restoration-treatments',
  source_type='official',
  notes=CASE WHEN notes IS NULL OR notes='' THEN 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.' ELSE notes END,
  updated_at=CURRENT_TIMESTAMP
WHERE lower(email)=lower('Info@DallasMensHealth.com') OR lower(practice_name)=lower('Dallas Men''s Health');

INSERT INTO outreach (id, practice_name, website, email, city, category, priority, source_url, source_type, stage, notes)
SELECT lower(hex(randomblob(16))), 'Dallas Men''s Health', 'https://www.dallasmenshealth.com/services/hair-restoration-treatments', 'Info@DallasMensHealth.com', 'Dallas, TX', 'hair restoration', 3, 'https://www.dallasmenshealth.com/services/hair-restoration-treatments', 'official', 'identified', 'Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@DallasMensHealth.com') OR lower(practice_name)=lower('Dallas Men''s Health'));

COMMIT;
