-- 100 publicly listed Baldwin provider contacts.
-- Upsert by email; updates matching practice names before inserting missing rows.
BEGIN TRANSACTION;

UPDATE outreach SET
  email='info@njfue.com',
  city=COALESCE(NULLIF(city,''), 'Freehold, NJ'),
  website=COALESCE(NULLIF(website,''), 'https://njfue.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://njfue.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('New Jersey Hair Restoration Center') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'New Jersey Hair Restoration Center', 'https://njfue.com/', 'info@njfue.com', 'Freehold, NJ', 'hair restoration', 'identified', 'Public contact source: https://njfue.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@njfue.com') OR lower(practice_name)=lower('New Jersey Hair Restoration Center'));

UPDATE outreach SET
  email='info@maximhairrestoration.com',
  city=COALESCE(NULLIF(city,''), 'New York, NY'),
  website=COALESCE(NULLIF(website,''), 'https://www.maximhairrestoration.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.maximhairrestoration.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Maxim Hair Restoration & Transplants') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Maxim Hair Restoration & Transplants', 'https://www.maximhairrestoration.com/', 'info@maximhairrestoration.com', 'New York, NY', 'hair restoration', 'identified', 'Public contact source: https://www.maximhairrestoration.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@maximhairrestoration.com') OR lower(practice_name)=lower('Maxim Hair Restoration & Transplants'));

UPDATE outreach SET
  email='reception@eternalhair.com',
  city=COALESCE(NULLIF(city,''), 'Totowa, NJ'),
  website=COALESCE(NULLIF(website,''), 'https://eternalhair.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://eternalhair.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Eternal Hair & Esthetics') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Eternal Hair & Esthetics', 'https://eternalhair.com/', 'reception@eternalhair.com', 'Totowa, NJ', 'hair restoration', 'identified', 'Public contact source: https://eternalhair.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('reception@eternalhair.com') OR lower(practice_name)=lower('Eternal Hair & Esthetics'));

UPDATE outreach SET
  email='info@meditresse.com',
  city=COALESCE(NULLIF(city,''), 'New York, NY'),
  website=COALESCE(NULLIF(website,''), 'https://www.meditresse.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.meditresse.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Medi Tresse') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Medi Tresse', 'https://www.meditresse.com/', 'info@meditresse.com', 'New York, NY', 'hair restoration', 'identified', 'Public contact source: https://www.meditresse.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@meditresse.com') OR lower(practice_name)=lower('Medi Tresse'));

UPDATE outreach SET
  email='info@sohoskinandhair.com',
  city=COALESCE(NULLIF(city,''), 'New York, NY'),
  website=COALESCE(NULLIF(website,''), 'https://sohoskinandhair.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://sohoskinandhair.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Soho Skin and Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Soho Skin and Hair Restoration', 'https://sohoskinandhair.com/', 'info@sohoskinandhair.com', 'New York, NY', 'hair restoration', 'identified', 'Public contact source: https://sohoskinandhair.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@sohoskinandhair.com') OR lower(practice_name)=lower('Soho Skin and Hair Restoration'));

UPDATE outreach SET
  email='info@sagerevivemetuchen.com',
  city=COALESCE(NULLIF(city,''), 'Moorestown, NJ'),
  website=COALESCE(NULLIF(website,''), 'https://sagerevivemetuchen.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://sagerevivemetuchen.com/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Sage Revive') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Sage Revive', 'https://sagerevivemetuchen.com/', 'info@sagerevivemetuchen.com', 'Moorestown, NJ', 'hair restoration', 'identified', 'Public contact source: https://sagerevivemetuchen.com/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@sagerevivemetuchen.com') OR lower(practice_name)=lower('Sage Revive'));

UPDATE outreach SET
  email='info@fairfieldderm.com',
  city=COALESCE(NULLIF(city,''), 'Fairfield, CT'),
  website=COALESCE(NULLIF(website,''), 'https://www.fairfieldderm.com/contact-us/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.fairfieldderm.com/contact-us/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Fairfield Dermatology') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Fairfield Dermatology', 'https://www.fairfieldderm.com/contact-us/', 'info@fairfieldderm.com', 'Fairfield, CT', 'hair restoration', 'identified', 'Public contact source: https://www.fairfieldderm.com/contact-us/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@fairfieldderm.com') OR lower(practice_name)=lower('Fairfield Dermatology'));

UPDATE outreach SET
  email='info@geriadermatology.com',
  city=COALESCE(NULLIF(city,''), 'Rutherford, NJ'),
  website=COALESCE(NULLIF(website,''), 'https://geriadermatology.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://geriadermatology.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Geria Dermatology') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Geria Dermatology', 'https://geriadermatology.com/', 'info@geriadermatology.com', 'Rutherford, NJ', 'hair restoration', 'identified', 'Public contact source: https://geriadermatology.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@geriadermatology.com') OR lower(practice_name)=lower('Geria Dermatology'));

UPDATE outreach SET
  email='info@amber-dermatology.com',
  city=COALESCE(NULLIF(city,''), 'Trumbull, CT'),
  website=COALESCE(NULLIF(website,''), 'https://amber-dermatology.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://amber-dermatology.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Amber Dermatology') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Amber Dermatology', 'https://amber-dermatology.com/', 'info@amber-dermatology.com', 'Trumbull, CT', 'hair restoration', 'identified', 'Public contact source: https://amber-dermatology.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@amber-dermatology.com') OR lower(practice_name)=lower('Amber Dermatology'));

UPDATE outreach SET
  email='bodiandermatology@gmail.com',
  city=COALESCE(NULLIF(city,''), 'Great Neck, NY'),
  website=COALESCE(NULLIF(website,''), 'https://bodiandermatology.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://bodiandermatology.com/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Bodian Dermatology Group') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Bodian Dermatology Group', 'https://bodiandermatology.com/', 'bodiandermatology@gmail.com', 'Great Neck, NY', 'hair restoration', 'identified', 'Public contact source: https://bodiandermatology.com/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('bodiandermatology@gmail.com') OR lower(practice_name)=lower('Bodian Dermatology Group'));

UPDATE outreach SET
  email='info@lafuehairnyc.com',
  city=COALESCE(NULLIF(city,''), 'Garden City, NY'),
  website=COALESCE(NULLIF(website,''), 'https://lafuehairnyc.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://lafuehairnyc.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('LA FUE Hair New York') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'LA FUE Hair New York', 'https://lafuehairnyc.com/', 'info@lafuehairnyc.com', 'Garden City, NY', 'hair restoration', 'identified', 'Public contact source: https://lafuehairnyc.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@lafuehairnyc.com') OR lower(practice_name)=lower('LA FUE Hair New York'));

UPDATE outreach SET
  email='info@borealisderm.com',
  city=COALESCE(NULLIF(city,''), 'Garden City, NY'),
  website=COALESCE(NULLIF(website,''), 'https://borealisderm.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://borealisderm.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Borealis Dermatology') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Borealis Dermatology', 'https://borealisderm.com/', 'info@borealisderm.com', 'Garden City, NY', 'hair restoration', 'identified', 'Public contact source: https://borealisderm.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@borealisderm.com') OR lower(practice_name)=lower('Borealis Dermatology'));

UPDATE outreach SET
  email='help@allislanddermatology.com',
  city=COALESCE(NULLIF(city,''), 'Garden City, NY'),
  website=COALESCE(NULLIF(website,''), 'https://allislanddermatology.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://allislanddermatology.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('All Island Dermatology') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'All Island Dermatology', 'https://allislanddermatology.com/', 'help@allislanddermatology.com', 'Garden City, NY', 'hair restoration', 'identified', 'Public contact source: https://allislanddermatology.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('help@allislanddermatology.com') OR lower(practice_name)=lower('All Island Dermatology'));

UPDATE outreach SET
  email='info@rhrli.com',
  city=COALESCE(NULLIF(city,''), 'Woodbury, NY'),
  website=COALESCE(NULLIF(website,''), 'https://rhrli.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://rhrli.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Robotic Hair Restoration of Long Island') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Robotic Hair Restoration of Long Island', 'https://rhrli.com/', 'info@rhrli.com', 'Woodbury, NY', 'hair restoration', 'identified', 'Public contact source: https://rhrli.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@rhrli.com') OR lower(practice_name)=lower('Robotic Hair Restoration of Long Island'));

UPDATE outreach SET
  email='phoenixhairsystems@gmail.com',
  city=COALESCE(NULLIF(city,''), 'Huntington, NY'),
  website=COALESCE(NULLIF(website,''), 'https://phoenixhairsystems.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://phoenixhairsystems.com/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Phoenix Hair Systems') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Phoenix Hair Systems', 'https://phoenixhairsystems.com/', 'phoenixhairsystems@gmail.com', 'Huntington, NY', 'hair restoration', 'identified', 'Public contact source: https://phoenixhairsystems.com/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('phoenixhairsystems@gmail.com') OR lower(practice_name)=lower('Phoenix Hair Systems'));

UPDATE outreach SET
  email='Dermaduo.nyc@gmail.com',
  city=COALESCE(NULLIF(city,''), 'Greenlawn, NY'),
  website=COALESCE(NULLIF(website,''), 'https://dermaduo.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://dermaduo.com/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Dermaduo PRP & Wellness') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Dermaduo PRP & Wellness', 'https://dermaduo.com/', 'Dermaduo.nyc@gmail.com', 'Greenlawn, NY', 'hair restoration', 'identified', 'Public contact source: https://dermaduo.com/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Dermaduo.nyc@gmail.com') OR lower(practice_name)=lower('Dermaduo PRP & Wellness'));

UPDATE outreach SET
  email='Philadelphiahairrestoration@gmail.com',
  city=COALESCE(NULLIF(city,''), 'Bala Cynwyd, PA'),
  website=COALESCE(NULLIF(website,''), 'https://philadelphiahairrestoration.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://philadelphiahairrestoration.com/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Philadelphia Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Philadelphia Hair Restoration', 'https://philadelphiahairrestoration.com/', 'Philadelphiahairrestoration@gmail.com', 'Bala Cynwyd, PA', 'hair restoration', 'identified', 'Public contact source: https://philadelphiahairrestoration.com/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Philadelphiahairrestoration@gmail.com') OR lower(practice_name)=lower('Philadelphia Hair Restoration'));

UPDATE outreach SET
  email='info@embracederm.com',
  city=COALESCE(NULLIF(city,''), 'Philadelphia, PA'),
  website=COALESCE(NULLIF(website,''), 'https://embracederm.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://embracederm.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Embrace Dermatology and Aesthetics') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Embrace Dermatology and Aesthetics', 'https://embracederm.com/', 'info@embracederm.com', 'Philadelphia, PA', 'hair restoration', 'identified', 'Public contact source: https://embracederm.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@embracederm.com') OR lower(practice_name)=lower('Embrace Dermatology and Aesthetics'));

UPDATE outreach SET
  email='visit@phillyhairmd.com',
  city=COALESCE(NULLIF(city,''), 'Philadelphia, PA'),
  website=COALESCE(NULLIF(website,''), 'https://phillyhairmd.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://phillyhairmd.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Precision Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Precision Hair Restoration', 'https://phillyhairmd.com/', 'visit@phillyhairmd.com', 'Philadelphia, PA', 'hair restoration', 'identified', 'Public contact source: https://phillyhairmd.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('visit@phillyhairmd.com') OR lower(practice_name)=lower('Precision Hair Restoration'));

UPDATE outreach SET
  email='info@revivephilly.com',
  city=COALESCE(NULLIF(city,''), 'Philadelphia, PA'),
  website=COALESCE(NULLIF(website,''), 'https://revivephilly.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://revivephilly.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Revive Medical') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Revive Medical', 'https://revivephilly.com/', 'info@revivephilly.com', 'Philadelphia, PA', 'hair restoration', 'identified', 'Public contact source: https://revivephilly.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@revivephilly.com') OR lower(practice_name)=lower('Revive Medical'));

UPDATE outreach SET
  email='contact@reformadermatology.com',
  city=COALESCE(NULLIF(city,''), 'Staten Island, NY'),
  website=COALESCE(NULLIF(website,''), 'https://reformadermatology.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://reformadermatology.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Reforma Dermatology') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Reforma Dermatology', 'https://reformadermatology.com/', 'contact@reformadermatology.com', 'Staten Island, NY', 'hair restoration', 'identified', 'Public contact source: https://reformadermatology.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('contact@reformadermatology.com') OR lower(practice_name)=lower('Reforma Dermatology'));

UPDATE outreach SET
  email='info@refreshclinic.com',
  city=COALESCE(NULLIF(city,''), 'Paramus, NJ'),
  website=COALESCE(NULLIF(website,''), 'https://refreshclinic.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://refreshclinic.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Refresh Clinic') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Refresh Clinic', 'https://refreshclinic.com/', 'info@refreshclinic.com', 'Paramus, NJ', 'hair restoration', 'identified', 'Public contact source: https://refreshclinic.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@refreshclinic.com') OR lower(practice_name)=lower('Refresh Clinic'));

UPDATE outreach SET
  email='info@hairmd.com',
  city=COALESCE(NULLIF(city,''), 'Englewood, NJ'),
  website=COALESCE(NULLIF(website,''), 'https://www.hairmd.com/about'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.hairmd.com/about | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('HAIRMD') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'HAIRMD', 'https://www.hairmd.com/about', 'info@hairmd.com', 'Englewood, NJ', 'hair restoration', 'identified', 'Public contact source: https://www.hairmd.com/about | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@hairmd.com') OR lower(practice_name)=lower('HAIRMD'));

UPDATE outreach SET
  email='info@njhairinstitute.com',
  city=COALESCE(NULLIF(city,''), 'Parsippany, NJ'),
  website=COALESCE(NULLIF(website,''), 'https://njhairinstitute.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://njhairinstitute.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('NJ Hair Institute') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'NJ Hair Institute', 'https://njhairinstitute.com/', 'info@njhairinstitute.com', 'Parsippany, NJ', 'hair restoration', 'identified', 'Public contact source: https://njhairinstitute.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@njhairinstitute.com') OR lower(practice_name)=lower('NJ Hair Institute'));

UPDATE outreach SET
  email='Info@HairPRC.com',
  city=COALESCE(NULLIF(city,''), 'Cedar Grove, NJ'),
  website=COALESCE(NULLIF(website,''), 'https://www.hairprc.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.hairprc.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Hair Partners Relocation Center') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Hair Partners Relocation Center', 'https://www.hairprc.com/', 'Info@HairPRC.com', 'Cedar Grove, NJ', 'hair restoration', 'identified', 'Public contact source: https://www.hairprc.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@HairPRC.com') OR lower(practice_name)=lower('Hair Partners Relocation Center'));

UPDATE outreach SET
  email='info@ihiclinic.com',
  city=COALESCE(NULLIF(city,''), 'Chicago, IL'),
  website=COALESCE(NULLIF(website,''), 'https://www.ihiclinic.com/contact-us/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.ihiclinic.com/contact-us/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('International Hair Institute') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'International Hair Institute', 'https://www.ihiclinic.com/contact-us/', 'info@ihiclinic.com', 'Chicago, IL', 'hair restoration', 'identified', 'Public contact source: https://www.ihiclinic.com/contact-us/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@ihiclinic.com') OR lower(practice_name)=lower('International Hair Institute'));

UPDATE outreach SET
  email='info@springsrejuvenation.com',
  city=COALESCE(NULLIF(city,''), 'New York, NY'),
  website=COALESCE(NULLIF(website,''), 'https://springsrejuvenation.com/locations/new-york/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://springsrejuvenation.com/locations/new-york/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Springs Rejuvenation') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Springs Rejuvenation', 'https://springsrejuvenation.com/locations/new-york/', 'info@springsrejuvenation.com', 'New York, NY', 'hair restoration', 'identified', 'Public contact source: https://springsrejuvenation.com/locations/new-york/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@springsrejuvenation.com') OR lower(practice_name)=lower('Springs Rejuvenation'));

UPDATE outreach SET
  email='info@menshealthctr.com',
  city=COALESCE(NULLIF(city,''), 'Skokie, IL'),
  website=COALESCE(NULLIF(website,''), 'https://menshealthctr.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://menshealthctr.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Men''s Health & Wellness Center') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Men''s Health & Wellness Center', 'https://menshealthctr.com/', 'info@menshealthctr.com', 'Skokie, IL', 'hair restoration', 'identified', 'Public contact source: https://menshealthctr.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@menshealthctr.com') OR lower(practice_name)=lower('Men''s Health & Wellness Center'));

UPDATE outreach SET
  email='info@njhairtransplantcenter.com',
  city=COALESCE(NULLIF(city,''), 'Englishtown, NJ'),
  website=COALESCE(NULLIF(website,''), 'https://njhairtransplantcenter.com/contacts/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://njhairtransplantcenter.com/contacts/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('NJ Hair Transplant Center') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'NJ Hair Transplant Center', 'https://njhairtransplantcenter.com/contacts/', 'info@njhairtransplantcenter.com', 'Englishtown, NJ', 'hair restoration', 'identified', 'Public contact source: https://njhairtransplantcenter.com/contacts/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@njhairtransplantcenter.com') OR lower(practice_name)=lower('NJ Hair Transplant Center'));

UPDATE outreach SET
  email='info@americanmane.com',
  city=COALESCE(NULLIF(city,''), 'Aventura, FL'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanmane.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanmane.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('American Mane') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'American Mane', 'https://www.americanmane.com/', 'info@americanmane.com', 'Aventura, FL', 'hair restoration', 'identified', 'Public contact source: https://www.americanmane.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@americanmane.com') OR lower(practice_name)=lower('American Mane'));

UPDATE outreach SET
  email='info@greenwichpointderm.com',
  city=COALESCE(NULLIF(city,''), 'Greenwich, CT'),
  website=COALESCE(NULLIF(website,''), 'https://www.greenwichpointdermatology.com/hair-regeneration/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.greenwichpointdermatology.com/hair-regeneration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Greenwich Point Dermatology') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Greenwich Point Dermatology', 'https://www.greenwichpointdermatology.com/hair-regeneration/', 'info@greenwichpointderm.com', 'Greenwich, CT', 'hair restoration', 'identified', 'Public contact source: https://www.greenwichpointdermatology.com/hair-regeneration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@greenwichpointderm.com') OR lower(practice_name)=lower('Greenwich Point Dermatology'));

UPDATE outreach SET
  email='info@hairzsystem.com',
  city=COALESCE(NULLIF(city,''), 'Chicago, IL'),
  website=COALESCE(NULLIF(website,''), 'https://hairzsystem.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://hairzsystem.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Hair Z System') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Hair Z System', 'https://hairzsystem.com/', 'info@hairzsystem.com', 'Chicago, IL', 'hair restoration', 'identified', 'Public contact source: https://hairzsystem.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@hairzsystem.com') OR lower(practice_name)=lower('Hair Z System'));

UPDATE outreach SET
  email='info@txfaces.com',
  city=COALESCE(NULLIF(city,''), 'Frisco, TX'),
  website=COALESCE(NULLIF(website,''), 'https://www.txfaces.com/procedures/hair-restoration/hair-transplant/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.txfaces.com/procedures/hair-restoration/hair-transplant/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Texas Facial Aesthetics') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Texas Facial Aesthetics', 'https://www.txfaces.com/procedures/hair-restoration/hair-transplant/', 'info@txfaces.com', 'Frisco, TX', 'hair restoration', 'identified', 'Public contact source: https://www.txfaces.com/procedures/hair-restoration/hair-transplant/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@txfaces.com') OR lower(practice_name)=lower('Texas Facial Aesthetics'));

UPDATE outreach SET
  email='info@aethosnyc.com',
  city=COALESCE(NULLIF(city,''), 'New York, NY'),
  website=COALESCE(NULLIF(website,''), 'https://aethosnyc.com/book-online/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://aethosnyc.com/book-online/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Aethos') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Aethos', 'https://aethosnyc.com/book-online/', 'info@aethosnyc.com', 'New York, NY', 'hair restoration', 'identified', 'Public contact source: https://aethosnyc.com/book-online/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@aethosnyc.com') OR lower(practice_name)=lower('Aethos'));

UPDATE outreach SET
  email='info@healthonemedicalcenter.com',
  city=COALESCE(NULLIF(city,''), 'Bloomingdale, IL'),
  website=COALESCE(NULLIF(website,''), 'https://healthonemedicalcenter.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://healthonemedicalcenter.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('HealthOne Medical Center') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'HealthOne Medical Center', 'https://healthonemedicalcenter.com/', 'info@healthonemedicalcenter.com', 'Bloomingdale, IL', 'hair restoration', 'identified', 'Public contact source: https://healthonemedicalcenter.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@healthonemedicalcenter.com') OR lower(practice_name)=lower('HealthOne Medical Center'));

UPDATE outreach SET
  email='info@tampahairgroup.com',
  city=COALESCE(NULLIF(city,''), 'Tampa, FL'),
  website=COALESCE(NULLIF(website,''), 'https://www.tampahairgroup.com/contact'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.tampahairgroup.com/contact | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Tampa Bay Hair Group') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Tampa Bay Hair Group', 'https://www.tampahairgroup.com/contact', 'info@tampahairgroup.com', 'Tampa, FL', 'hair restoration', 'identified', 'Public contact source: https://www.tampahairgroup.com/contact | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@tampahairgroup.com') OR lower(practice_name)=lower('Tampa Bay Hair Group'));

UPDATE outreach SET
  email='info@premierderm.org',
  city=COALESCE(NULLIF(city,''), 'Wellesley, MA'),
  website=COALESCE(NULLIF(website,''), 'https://www.premierderm.org/dermatology-services/cosmetic-dermatology/hair-restoration/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.premierderm.org/dermatology-services/cosmetic-dermatology/hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Premier Dermatology') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Premier Dermatology', 'https://www.premierderm.org/dermatology-services/cosmetic-dermatology/hair-restoration/', 'info@premierderm.org', 'Wellesley, MA', 'hair restoration', 'identified', 'Public contact source: https://www.premierderm.org/dermatology-services/cosmetic-dermatology/hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@premierderm.org') OR lower(practice_name)=lower('Premier Dermatology'));

UPDATE outreach SET
  email='info@quellaesthetics.com',
  city=COALESCE(NULLIF(city,''), 'Maryville, IL'),
  website=COALESCE(NULLIF(website,''), 'https://quellaesthetics.com/aesthetics/hair-restoration/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://quellaesthetics.com/aesthetics/hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Quell Aesthetics & Wellness') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Quell Aesthetics & Wellness', 'https://quellaesthetics.com/aesthetics/hair-restoration/', 'info@quellaesthetics.com', 'Maryville, IL', 'hair restoration', 'identified', 'Public contact source: https://quellaesthetics.com/aesthetics/hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@quellaesthetics.com') OR lower(practice_name)=lower('Quell Aesthetics & Wellness'));

UPDATE outreach SET
  email='info@ViveVidaMed.com',
  city=COALESCE(NULLIF(city,''), 'Farmington, CT'),
  website=COALESCE(NULLIF(website,''), 'https://www.vivevidamed.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.vivevidamed.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Vive Vida Medical') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Vive Vida Medical', 'https://www.vivevidamed.com/', 'info@ViveVidaMed.com', 'Farmington, CT', 'hair restoration', 'identified', 'Public contact source: https://www.vivevidamed.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@ViveVidaMed.com') OR lower(practice_name)=lower('Vive Vida Medical'));

UPDATE outreach SET
  email='Info@ohiohairsolutions.com',
  city=COALESCE(NULLIF(city,''), 'Canton, OH'),
  website=COALESCE(NULLIF(website,''), 'https://ohiohairsolutions.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://ohiohairsolutions.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Ohio Hair Solutions') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Ohio Hair Solutions', 'https://ohiohairsolutions.com/', 'Info@ohiohairsolutions.com', 'Canton, OH', 'hair restoration', 'identified', 'Public contact source: https://ohiohairsolutions.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@ohiohairsolutions.com') OR lower(practice_name)=lower('Ohio Hair Solutions'));

UPDATE outreach SET
  email='Info@VirginiaHairTransplant.com',
  city=COALESCE(NULLIF(city,''), 'Leesburg, VA'),
  website=COALESCE(NULLIF(website,''), 'https://www.virginiahairtransplant.com/request-callback/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.virginiahairtransplant.com/request-callback/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Virginia Hair Transplant') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Virginia Hair Transplant', 'https://www.virginiahairtransplant.com/request-callback/', 'Info@VirginiaHairTransplant.com', 'Leesburg, VA', 'hair restoration', 'identified', 'Public contact source: https://www.virginiahairtransplant.com/request-callback/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@VirginiaHairTransplant.com') OR lower(practice_name)=lower('Virginia Hair Transplant'));

UPDATE outreach SET
  email='info@chambershair.net',
  city=COALESCE(NULLIF(city,''), 'Troy, MI'),
  website=COALESCE(NULLIF(website,''), 'https://www.chambershair.net/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.chambershair.net/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Chambers Hair Institute') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Chambers Hair Institute', 'https://www.chambershair.net/', 'info@chambershair.net', 'Troy, MI', 'hair restoration', 'identified', 'Public contact source: https://www.chambershair.net/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@chambershair.net') OR lower(practice_name)=lower('Chambers Hair Institute'));

UPDATE outreach SET
  email='info@dcsurgicalarts.com',
  city=COALESCE(NULLIF(city,''), 'Washington, DC'),
  website=COALESCE(NULLIF(website,''), 'https://www.dcsurgicalarts.com/facial-cosmetics/prp-hair-restoration'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.dcsurgicalarts.com/facial-cosmetics/prp-hair-restoration | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('DC Surgical Arts') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'DC Surgical Arts', 'https://www.dcsurgicalarts.com/facial-cosmetics/prp-hair-restoration', 'info@dcsurgicalarts.com', 'Washington, DC', 'hair restoration', 'identified', 'Public contact source: https://www.dcsurgicalarts.com/facial-cosmetics/prp-hair-restoration | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@dcsurgicalarts.com') OR lower(practice_name)=lower('DC Surgical Arts'));

UPDATE outreach SET
  email='Info@AndersonHSC.com',
  city=COALESCE(NULLIF(city,''), 'Atlanta, GA'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=georgia'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=georgia | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Anderson Center for Hair') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Anderson Center for Hair', 'https://www.americanhairloss.org/?surgeonlocation=georgia', 'Info@AndersonHSC.com', 'Atlanta, GA', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=georgia | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@AndersonHSC.com') OR lower(practice_name)=lower('Anderson Center for Hair'));

UPDATE outreach SET
  email='info@nahairrestoration.com',
  city=COALESCE(NULLIF(city,''), 'Alpharetta, GA'),
  website=COALESCE(NULLIF(website,''), 'https://www.nahairrestoration.com/contact/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.nahairrestoration.com/contact/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('North Atlanta Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'North Atlanta Hair Restoration', 'https://www.nahairrestoration.com/contact/', 'info@nahairrestoration.com', 'Alpharetta, GA', 'hair restoration', 'identified', 'Public contact source: https://www.nahairrestoration.com/contact/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@nahairrestoration.com') OR lower(practice_name)=lower('North Atlanta Hair Restoration'));

UPDATE outreach SET
  email='drwetzel@andersonhsc.com',
  city=COALESCE(NULLIF(city,''), 'Atlanta, GA'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=georgia'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=georgia | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Anderson Center for Hair - Dr Wetzel') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Anderson Center for Hair - Dr Wetzel', 'https://www.americanhairloss.org/?surgeonlocation=georgia', 'drwetzel@andersonhsc.com', 'Atlanta, GA', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=georgia | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drwetzel@andersonhsc.com') OR lower(practice_name)=lower('Anderson Center for Hair - Dr Wetzel'));

UPDATE outreach SET
  email='Medspa@visiondermatology.com',
  city=COALESCE(NULLIF(city,''), 'Raleigh, NC'),
  website=COALESCE(NULLIF(website,''), 'https://www.visiondermatology.com/services-4'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.visiondermatology.com/services-4 | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Vision Dermatology Med Spa') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Vision Dermatology Med Spa', 'https://www.visiondermatology.com/services-4', 'Medspa@visiondermatology.com', 'Raleigh, NC', 'hair restoration', 'identified', 'Public contact source: https://www.visiondermatology.com/services-4 | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Medspa@visiondermatology.com') OR lower(practice_name)=lower('Vision Dermatology Med Spa'));

UPDATE outreach SET
  email='Info@visiondermatology.com',
  city=COALESCE(NULLIF(city,''), 'Raleigh, NC'),
  website=COALESCE(NULLIF(website,''), 'https://www.visiondermatology.com/services-4'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.visiondermatology.com/services-4 | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Vision Dermatology') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Vision Dermatology', 'https://www.visiondermatology.com/services-4', 'Info@visiondermatology.com', 'Raleigh, NC', 'hair restoration', 'identified', 'Public contact source: https://www.visiondermatology.com/services-4 | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@visiondermatology.com') OR lower(practice_name)=lower('Vision Dermatology'));

UPDATE outreach SET
  email='info@rewindmeaesthetics.com',
  city=COALESCE(NULLIF(city,''), 'Washington, DC'),
  website=COALESCE(NULLIF(website,''), 'https://rewindmeaesthetics.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://rewindmeaesthetics.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Rewind Me Aesthetic Boutique') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Rewind Me Aesthetic Boutique', 'https://rewindmeaesthetics.com/', 'info@rewindmeaesthetics.com', 'Washington, DC', 'hair restoration', 'identified', 'Public contact source: https://rewindmeaesthetics.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@rewindmeaesthetics.com') OR lower(practice_name)=lower('Rewind Me Aesthetic Boutique'));

UPDATE outreach SET
  email='info@aestheticartskincare.com',
  city=COALESCE(NULLIF(city,''), 'West Bloomfield, MI'),
  website=COALESCE(NULLIF(website,''), 'https://www.aestheticartskincare.com/service-page/hair-restoration'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.aestheticartskincare.com/service-page/hair-restoration | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Aesthetic Art') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Aesthetic Art', 'https://www.aestheticartskincare.com/service-page/hair-restoration', 'info@aestheticartskincare.com', 'West Bloomfield, MI', 'hair restoration', 'identified', 'Public contact source: https://www.aestheticartskincare.com/service-page/hair-restoration | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@aestheticartskincare.com') OR lower(practice_name)=lower('Aesthetic Art'));

UPDATE outreach SET
  email='info@chattanoogaface.com',
  city=COALESCE(NULLIF(city,''), 'Chattanooga, TN'),
  website=COALESCE(NULLIF(website,''), 'https://www.chattanoogaface.com/services/restorative-hair-therapy/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.chattanoogaface.com/services/restorative-hair-therapy/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Center for Facial Rejuvenation') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Center for Facial Rejuvenation', 'https://www.chattanoogaface.com/services/restorative-hair-therapy/', 'info@chattanoogaface.com', 'Chattanooga, TN', 'hair restoration', 'identified', 'Public contact source: https://www.chattanoogaface.com/services/restorative-hair-therapy/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@chattanoogaface.com') OR lower(practice_name)=lower('Center for Facial Rejuvenation'));

UPDATE outreach SET
  email='info@bw-nc.com',
  city=COALESCE(NULLIF(city,''), 'Winston-Salem, NC'),
  website=COALESCE(NULLIF(website,''), 'https://boutiquewellnessnc.com/hair-restoration/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://boutiquewellnessnc.com/hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Boutique Wellness') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Boutique Wellness', 'https://boutiquewellnessnc.com/hair-restoration/', 'info@bw-nc.com', 'Winston-Salem, NC', 'hair restoration', 'identified', 'Public contact source: https://boutiquewellnessnc.com/hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@bw-nc.com') OR lower(practice_name)=lower('Boutique Wellness'));

UPDATE outreach SET
  email='info@axioshealthco.com',
  city=COALESCE(NULLIF(city,''), 'Longmont, CO'),
  website=COALESCE(NULLIF(website,''), 'https://axioshealthco.com/prp-hair-restoration/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://axioshealthco.com/prp-hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Axios Health and Wellness') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Axios Health and Wellness', 'https://axioshealthco.com/prp-hair-restoration/', 'info@axioshealthco.com', 'Longmont, CO', 'hair restoration', 'identified', 'Public contact source: https://axioshealthco.com/prp-hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@axioshealthco.com') OR lower(practice_name)=lower('Axios Health and Wellness'));

UPDATE outreach SET
  email='Info@nuvidameda.com',
  city=COALESCE(NULLIF(city,''), 'Highlands Ranch, CO'),
  website=COALESCE(NULLIF(website,''), 'https://nuvidameda.com/services/hair-restoration/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://nuvidameda.com/services/hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('NuVida Medical and Aesthetics') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'NuVida Medical and Aesthetics', 'https://nuvidameda.com/services/hair-restoration/', 'Info@nuvidameda.com', 'Highlands Ranch, CO', 'hair restoration', 'identified', 'Public contact source: https://nuvidameda.com/services/hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@nuvidameda.com') OR lower(practice_name)=lower('NuVida Medical and Aesthetics'));

UPDATE outreach SET
  email='info@biofunctionalmed.com',
  city=COALESCE(NULLIF(city,''), 'Raleigh, NC'),
  website=COALESCE(NULLIF(website,''), 'https://biofunctionalmed.com/g/hairrestoration/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://biofunctionalmed.com/g/hairrestoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('BioFunctional Med') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'BioFunctional Med', 'https://biofunctionalmed.com/g/hairrestoration/', 'info@biofunctionalmed.com', 'Raleigh, NC', 'hair restoration', 'identified', 'Public contact source: https://biofunctionalmed.com/g/hairrestoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@biofunctionalmed.com') OR lower(practice_name)=lower('BioFunctional Med'));

UPDATE outreach SET
  email='info@nocohealthcare.com',
  city=COALESCE(NULLIF(city,''), 'Greeley, CO'),
  website=COALESCE(NULLIF(website,''), 'https://nocohealthcare.com/regenerative-hair-restoration-greeley/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://nocohealthcare.com/regenerative-hair-restoration-greeley/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('NOCO Healthcare') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'NOCO Healthcare', 'https://nocohealthcare.com/regenerative-hair-restoration-greeley/', 'info@nocohealthcare.com', 'Greeley, CO', 'hair restoration', 'identified', 'Public contact source: https://nocohealthcare.com/regenerative-hair-restoration-greeley/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@nocohealthcare.com') OR lower(practice_name)=lower('NOCO Healthcare'));

UPDATE outreach SET
  email='info@thebeautyrefynery.com',
  city=COALESCE(NULLIF(city,''), 'Franklin, TN'),
  website=COALESCE(NULLIF(website,''), 'https://thebeautyrefynery.com/hair-restoration/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://thebeautyrefynery.com/hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('The Beauty Refynery') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'The Beauty Refynery', 'https://thebeautyrefynery.com/hair-restoration/', 'info@thebeautyrefynery.com', 'Franklin, TN', 'hair restoration', 'identified', 'Public contact source: https://thebeautyrefynery.com/hair-restoration/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@thebeautyrefynery.com') OR lower(practice_name)=lower('The Beauty Refynery'));

UPDATE outreach SET
  email='INFO@BROADWAYMD.COM',
  city=COALESCE(NULLIF(city,''), 'Lone Tree, CO'),
  website=COALESCE(NULLIF(website,''), 'https://broadwayplasticsurgery.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://broadwayplasticsurgery.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Broadway Plastic Surgery Group') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Broadway Plastic Surgery Group', 'https://broadwayplasticsurgery.com/', 'INFO@BROADWAYMD.COM', 'Lone Tree, CO', 'hair restoration', 'identified', 'Public contact source: https://broadwayplasticsurgery.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('INFO@BROADWAYMD.COM') OR lower(practice_name)=lower('Broadway Plastic Surgery Group'));

UPDATE outreach SET
  email='info@mihairdoc.com',
  city=COALESCE(NULLIF(city,''), 'Shelby Township, MI'),
  website=COALESCE(NULLIF(website,''), 'https://www.mihairdoc.com/local-drs-berry-tessler-aronovitz-hair-restoration-specialists-fue-artas-robotic-transplant-shelby-town-mi'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.mihairdoc.com/local-drs-berry-tessler-aronovitz-hair-restoration-specialists-fue-artas-robotic-transplant-shelby-town-mi | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Michigan Hair Doc') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Michigan Hair Doc', 'https://www.mihairdoc.com/local-drs-berry-tessler-aronovitz-hair-restoration-specialists-fue-artas-robotic-transplant-shelby-town-mi', 'info@mihairdoc.com', 'Shelby Township, MI', 'hair restoration', 'identified', 'Public contact source: https://www.mihairdoc.com/local-drs-berry-tessler-aronovitz-hair-restoration-specialists-fue-artas-robotic-transplant-shelby-town-mi | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@mihairdoc.com') OR lower(practice_name)=lower('Michigan Hair Doc'));

UPDATE outreach SET
  email='staff@drscottalexander.com',
  city=COALESCE(NULLIF(city,''), 'Phoenix, AZ'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=arizona'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=arizona | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Biltmore Surgical Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Biltmore Surgical Hair Restoration', 'https://www.americanhairloss.org/?surgeonlocation=arizona', 'staff@drscottalexander.com', 'Phoenix, AZ', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=arizona | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('staff@drscottalexander.com') OR lower(practice_name)=lower('Biltmore Surgical Hair Restoration'));

UPDATE outreach SET
  email='drkeene@hairrestore.com',
  city=COALESCE(NULLIF(city,''), 'Tucson, AZ'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=arizona'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=arizona | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Physician''s Hair Institute') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Physician''s Hair Institute', 'https://www.americanhairloss.org/?surgeonlocation=arizona', 'drkeene@hairrestore.com', 'Tucson, AZ', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=arizona | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drkeene@hairrestore.com') OR lower(practice_name)=lower('Physician''s Hair Institute'));

UPDATE outreach SET
  email='drboden@hairtransplantct.com',
  city=COALESCE(NULLIF(city,''), 'Wethersfield, CT'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=connecticut'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=connecticut | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Hair Restoration & Aesthetic Medicine Center') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Hair Restoration & Aesthetic Medicine Center', 'https://www.americanhairloss.org/?surgeonlocation=connecticut', 'drboden@hairtransplantct.com', 'Wethersfield, CT', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=connecticut | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drboden@hairtransplantct.com') OR lower(practice_name)=lower('Hair Restoration & Aesthetic Medicine Center'));

UPDATE outreach SET
  email='docdauer@me.com',
  city=COALESCE(NULLIF(city,''), 'New York, NY'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=new-york'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=new-york | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Dauer Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Dauer Hair Restoration', 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'docdauer@me.com', 'New York, NY', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=new-york | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('docdauer@me.com') OR lower(practice_name)=lower('Dauer Hair Restoration'));

UPDATE outreach SET
  email='drdorin@thehairlossdoctors.com',
  city=COALESCE(NULLIF(city,''), 'Garden City, NY'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=new-york'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=new-york | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('The Hair Loss Doctors') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'The Hair Loss Doctors', 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'drdorin@thehairlossdoctors.com', 'Garden City, NY', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=new-york | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drdorin@thehairlossdoctors.com') OR lower(practice_name)=lower('The Hair Loss Doctors'));

UPDATE outreach SET
  email='thomas.law2@verizon.net',
  city=COALESCE(NULLIF(city,''), 'New York, NY'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=new-york'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=new-york | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('NYC Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'NYC Hair Restoration', 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'thomas.law2@verizon.net', 'New York, NY', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=new-york | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('thomas.law2@verizon.net') OR lower(practice_name)=lower('NYC Hair Restoration'));

UPDATE outreach SET
  email='carloskw@aya.yale.edu',
  city=COALESCE(NULLIF(city,''), 'New York, NY'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=new-york'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=new-york | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Carlos Wesley Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Carlos Wesley Hair Restoration', 'https://www.americanhairloss.org/?surgeonlocation=new-york', 'carloskw@aya.yale.edu', 'New York, NY', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=new-york | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('carloskw@aya.yale.edu') OR lower(practice_name)=lower('Carlos Wesley Hair Restoration'));

UPDATE outreach SET
  email='info@mcgrathmedical.com',
  city=COALESCE(NULLIF(city,''), 'Austin, TX'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=texas'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=texas | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('McGrath Medical') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'McGrath Medical', 'https://www.americanhairloss.org/?surgeonlocation=texas', 'info@mcgrathmedical.com', 'Austin, TX', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=texas | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@mcgrathmedical.com') OR lower(practice_name)=lower('McGrath Medical'));

UPDATE outreach SET
  email='yaker@yakermd.com',
  city=COALESCE(NULLIF(city,''), 'Plano, TX'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=texas'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=texas | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Yaker Hair Restoration + Med Spa') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Yaker Hair Restoration + Med Spa', 'https://www.americanhairloss.org/?surgeonlocation=texas', 'yaker@yakermd.com', 'Plano, TX', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=texas | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('yaker@yakermd.com') OR lower(practice_name)=lower('Yaker Hair Restoration + Med Spa'));

UPDATE outreach SET
  email='vpanine@drpanine.com',
  city=COALESCE(NULLIF(city,''), 'Chicago, IL'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=illinois'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=illinois | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Chicago Hair Transplant Clinic') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Chicago Hair Transplant Clinic', 'https://www.americanhairloss.org/?surgeonlocation=illinois', 'vpanine@drpanine.com', 'Chicago, IL', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=illinois | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('vpanine@drpanine.com') OR lower(practice_name)=lower('Chicago Hair Transplant Clinic'));

UPDATE outreach SET
  email='drwlindsey@gmail.com',
  city=COALESCE(NULLIF(city,''), 'McLean, VA'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=virginia'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=virginia | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Nova Hair Center') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Nova Hair Center', 'https://www.americanhairloss.org/?surgeonlocation=virginia', 'drwlindsey@gmail.com', 'McLean, VA', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=virginia | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drwlindsey@gmail.com') OR lower(practice_name)=lower('Nova Hair Center'));

UPDATE outreach SET
  email='JCooley@haircenter.com',
  city=COALESCE(NULLIF(city,''), 'Charlotte, NC'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=north-carolina'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=north-carolina | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('The Hair Center') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'The Hair Center', 'https://www.americanhairloss.org/?surgeonlocation=north-carolina', 'JCooley@haircenter.com', 'Charlotte, NC', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=north-carolina | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('JCooley@haircenter.com') OR lower(practice_name)=lower('The Hair Center'));

UPDATE outreach SET
  email='eric@alviarmani.com',
  city=COALESCE(NULLIF(city,''), 'Salt Lake City, UT'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=utah'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=utah | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Alvi Armani') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Alvi Armani', 'https://www.americanhairloss.org/?surgeonlocation=utah', 'eric@alviarmani.com', 'Salt Lake City, UT', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=utah | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('eric@alviarmani.com') OR lower(practice_name)=lower('Alvi Armani'));

UPDATE outreach SET
  email='mvories@CarolinaHairSurgery.com',
  city=COALESCE(NULLIF(city,''), 'Mount Pleasant, SC'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=south-carolina'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=south-carolina | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Carolina Hair Surgery') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Carolina Hair Surgery', 'https://www.americanhairloss.org/?surgeonlocation=south-carolina', 'mvories@CarolinaHairSurgery.com', 'Mount Pleasant, SC', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=south-carolina | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('mvories@CarolinaHairSurgery.com') OR lower(practice_name)=lower('Carolina Hair Surgery'));

UPDATE outreach SET
  email='doctorb@baumanmedical.com',
  city=COALESCE(NULLIF(city,''), 'Boca Raton, FL'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=florida'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=florida | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Bauman Medical Group') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Bauman Medical Group', 'https://www.americanhairloss.org/?surgeonlocation=florida', 'doctorb@baumanmedical.com', 'Boca Raton, FL', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=florida | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('doctorb@baumanmedical.com') OR lower(practice_name)=lower('Bauman Medical Group'));

UPDATE outreach SET
  email='draron@miamihair.com',
  city=COALESCE(NULLIF(city,''), 'Miami, FL'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=florida'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=florida | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Miami Hair Institute - Dr Aron Nusbaum') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Miami Hair Institute - Dr Aron Nusbaum', 'https://www.americanhairloss.org/?surgeonlocation=florida', 'draron@miamihair.com', 'Miami, FL', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=florida | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('draron@miamihair.com') OR lower(practice_name)=lower('Miami Hair Institute - Dr Aron Nusbaum'));

UPDATE outreach SET
  email='drnusbaum@miamihair.com',
  city=COALESCE(NULLIF(city,''), 'Miami, FL'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=florida'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=florida | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Miami Hair Institute - Dr Bernard Nusbaum') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Miami Hair Institute - Dr Bernard Nusbaum', 'https://www.americanhairloss.org/?surgeonlocation=florida', 'drnusbaum@miamihair.com', 'Miami, FL', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=florida | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drnusbaum@miamihair.com') OR lower(practice_name)=lower('Miami Hair Institute - Dr Bernard Nusbaum'));

UPDATE outreach SET
  email='Md.chumak@bringbackhair.com',
  city=COALESCE(NULLIF(city,''), 'Fort Lauderdale, FL'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=florida'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=florida | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Hair By Dr Max') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Hair By Dr Max', 'https://www.americanhairloss.org/?surgeonlocation=florida', 'Md.chumak@bringbackhair.com', 'Fort Lauderdale, FL', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=florida | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Md.chumak@bringbackhair.com') OR lower(practice_name)=lower('Hair By Dr Max'));

UPDATE outreach SET
  email='dermhair5@gmail.com',
  city=COALESCE(NULLIF(city,''), 'Los Angeles, CA'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=california'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=california | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Dermatology & Hair Restoration Specialists') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Dermatology & Hair Restoration Specialists', 'https://www.americanhairloss.org/?surgeonlocation=california', 'dermhair5@gmail.com', 'Los Angeles, CA', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=california | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('dermhair5@gmail.com') OR lower(practice_name)=lower('Dermatology & Hair Restoration Specialists'));

UPDATE outreach SET
  email='tcarmanmd@ljhr.com',
  city=COALESCE(NULLIF(city,''), 'La Jolla, CA'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=california'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=california | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('La Jolla Hair Restoration Medical Center') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'La Jolla Hair Restoration Medical Center', 'https://www.americanhairloss.org/?surgeonlocation=california', 'tcarmanmd@ljhr.com', 'La Jolla, CA', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=california | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('tcarmanmd@ljhr.com') OR lower(practice_name)=lower('La Jolla Hair Restoration Medical Center'));

UPDATE outreach SET
  email='drvarona@VaronaHairRestoration.com',
  city=COALESCE(NULLIF(city,''), 'Newport Beach, CA'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=california'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=california | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Varona Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Varona Hair Restoration', 'https://www.americanhairloss.org/?surgeonlocation=california', 'drvarona@VaronaHairRestoration.com', 'Newport Beach, CA', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=california | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('drvarona@VaronaHairRestoration.com') OR lower(practice_name)=lower('Varona Hair Restoration'));

UPDATE outreach SET
  email='info@modenahair.com',
  city=COALESCE(NULLIF(city,''), 'Newport Beach, CA'),
  website=COALESCE(NULLIF(website,''), 'https://www.americanhairloss.org/?surgeonlocation=california'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.americanhairloss.org/?surgeonlocation=california | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Modena Hair Institute') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Modena Hair Institute', 'https://www.americanhairloss.org/?surgeonlocation=california', 'info@modenahair.com', 'Newport Beach, CA', 'hair restoration', 'identified', 'Public contact source: https://www.americanhairloss.org/?surgeonlocation=california | source_type=public_directory | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@modenahair.com') OR lower(practice_name)=lower('Modena Hair Institute'));

UPDATE outreach SET
  email='info@rejuvsf.com',
  city=COALESCE(NULLIF(city,''), 'San Francisco, CA'),
  website=COALESCE(NULLIF(website,''), 'https://www.rejuvsf.com/hair-restoration'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.rejuvsf.com/hair-restoration | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Rejuv Medical') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Rejuv Medical', 'https://www.rejuvsf.com/hair-restoration', 'info@rejuvsf.com', 'San Francisco, CA', 'hair restoration', 'identified', 'Public contact source: https://www.rejuvsf.com/hair-restoration | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@rejuvsf.com') OR lower(practice_name)=lower('Rejuv Medical'));

UPDATE outreach SET
  email='info@ConcordHairRestoration.com',
  city=COALESCE(NULLIF(city,''), 'Encino, CA'),
  website=COALESCE(NULLIF(website,''), 'https://www.concordhair.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.concordhair.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Concord Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Concord Hair Restoration', 'https://www.concordhair.com/', 'info@ConcordHairRestoration.com', 'Encino, CA', 'hair restoration', 'identified', 'Public contact source: https://www.concordhair.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@ConcordHairRestoration.com') OR lower(practice_name)=lower('Concord Hair Restoration'));

UPDATE outreach SET
  email='Info@SanDiegoHairLossSpecialist.com',
  city=COALESCE(NULLIF(city,''), 'Del Mar, CA'),
  website=COALESCE(NULLIF(website,''), 'https://www.sandiegohairlossspecialist.com/san-diego-hair-restoration'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.sandiegohairlossspecialist.com/san-diego-hair-restoration | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Advanced Hair') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Advanced Hair', 'https://www.sandiegohairlossspecialist.com/san-diego-hair-restoration', 'Info@SanDiegoHairLossSpecialist.com', 'Del Mar, CA', 'hair restoration', 'identified', 'Public contact source: https://www.sandiegohairlossspecialist.com/san-diego-hair-restoration | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@SanDiegoHairLossSpecialist.com') OR lower(practice_name)=lower('Advanced Hair'));

UPDATE outreach SET
  email='info@northwesthair.com',
  city=COALESCE(NULLIF(city,''), 'Tacoma, WA'),
  website=COALESCE(NULLIF(website,''), 'https://hairreplacementsurgeon.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://hairreplacementsurgeon.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Northwest Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Northwest Hair Restoration', 'https://hairreplacementsurgeon.com/', 'info@northwesthair.com', 'Tacoma, WA', 'hair restoration', 'identified', 'Public contact source: https://hairreplacementsurgeon.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@northwesthair.com') OR lower(practice_name)=lower('Northwest Hair Restoration'));

UPDATE outreach SET
  email='info@xplicithairstudio.com',
  city=COALESCE(NULLIF(city,''), 'San Diego, CA'),
  website=COALESCE(NULLIF(website,''), 'https://www.xplicithairstudio.com/contactus'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.xplicithairstudio.com/contactus | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Xplicit Hair Restoration') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Xplicit Hair Restoration', 'https://www.xplicithairstudio.com/contactus', 'info@xplicithairstudio.com', 'San Diego, CA', 'hair restoration', 'identified', 'Public contact source: https://www.xplicithairstudio.com/contactus | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@xplicithairstudio.com') OR lower(practice_name)=lower('Xplicit Hair Restoration'));

UPDATE outreach SET
  email='info@ClearFormAesthetics.com',
  city=COALESCE(NULLIF(city,''), 'Portland, OR'),
  website=COALESCE(NULLIF(website,''), 'https://www.clearformaesthetics.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.clearformaesthetics.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('ClearForm Aesthetics') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'ClearForm Aesthetics', 'https://www.clearformaesthetics.com/', 'info@ClearFormAesthetics.com', 'Portland, OR', 'hair restoration', 'identified', 'Public contact source: https://www.clearformaesthetics.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@ClearFormAesthetics.com') OR lower(practice_name)=lower('ClearForm Aesthetics'));

UPDATE outreach SET
  email='info@regrowmedical.com',
  city=COALESCE(NULLIF(city,''), 'Los Angeles, CA'),
  website=COALESCE(NULLIF(website,''), 'https://hair.regrowmedical.com/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://hair.regrowmedical.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('ReGrow Medical') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'ReGrow Medical', 'https://hair.regrowmedical.com/', 'info@regrowmedical.com', 'Los Angeles, CA', 'hair restoration', 'identified', 'Public contact source: https://hair.regrowmedical.com/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@regrowmedical.com') OR lower(practice_name)=lower('ReGrow Medical'));

UPDATE outreach SET
  email='info@agapehair-wellness.com',
  city=COALESCE(NULLIF(city,''), 'Tempe, AZ'),
  website=COALESCE(NULLIF(website,''), 'https://www.agapehair-wellness.com/about'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.agapehair-wellness.com/about | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Agape Hair + Wellness') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Agape Hair + Wellness', 'https://www.agapehair-wellness.com/about', 'info@agapehair-wellness.com', 'Tempe, AZ', 'hair restoration', 'identified', 'Public contact source: https://www.agapehair-wellness.com/about | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@agapehair-wellness.com') OR lower(practice_name)=lower('Agape Hair + Wellness'));

UPDATE outreach SET
  email='info@chsi.health',
  city=COALESCE(NULLIF(city,''), 'San Diego, CA'),
  website=COALESCE(NULLIF(website,''), 'https://www.californiahairandskininstitute.com/contact-us'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.californiahairandskininstitute.com/contact-us | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('California Hair and Skin Institute') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'California Hair and Skin Institute', 'https://www.californiahairandskininstitute.com/contact-us', 'info@chsi.health', 'San Diego, CA', 'hair restoration', 'identified', 'Public contact source: https://www.californiahairandskininstitute.com/contact-us | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@chsi.health') OR lower(practice_name)=lower('California Hair and Skin Institute'));

UPDATE outreach SET
  email='info@nhlma.com',
  city=COALESCE(NULLIF(city,''), 'Scottsdale, AZ'),
  website=COALESCE(NULLIF(website,''), 'https://www.nhlma.com/hair-restoration-services'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.nhlma.com/hair-restoration-services | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('National Hair Loss Medical Aesthetics') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'National Hair Loss Medical Aesthetics', 'https://www.nhlma.com/hair-restoration-services', 'info@nhlma.com', 'Scottsdale, AZ', 'hair restoration', 'identified', 'Public contact source: https://www.nhlma.com/hair-restoration-services | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@nhlma.com') OR lower(practice_name)=lower('National Hair Loss Medical Aesthetics'));

UPDATE outreach SET
  email='info@denverhairclinic.com',
  city=COALESCE(NULLIF(city,''), 'Denver, CO'),
  website=COALESCE(NULLIF(website,''), 'https://denverhairclinic.com/services/hair-transplant-surgery/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://denverhairclinic.com/services/hair-transplant-surgery/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Denver Hair Clinic') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Denver Hair Clinic', 'https://denverhairclinic.com/services/hair-transplant-surgery/', 'info@denverhairclinic.com', 'Denver, CO', 'hair restoration', 'identified', 'Public contact source: https://denverhairclinic.com/services/hair-transplant-surgery/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@denverhairclinic.com') OR lower(practice_name)=lower('Denver Hair Clinic'));

UPDATE outreach SET
  email='info@bevelseattle.com',
  city=COALESCE(NULLIF(city,''), 'Seattle, WA'),
  website=COALESCE(NULLIF(website,''), 'https://www.bevelseattle.com/contact'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.bevelseattle.com/contact | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Bevel Aesthetics') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Bevel Aesthetics', 'https://www.bevelseattle.com/contact', 'info@bevelseattle.com', 'Seattle, WA', 'hair restoration', 'identified', 'Public contact source: https://www.bevelseattle.com/contact | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@bevelseattle.com') OR lower(practice_name)=lower('Bevel Aesthetics'));

UPDATE outreach SET
  email='rob@regen.la',
  city=COALESCE(NULLIF(city,''), 'Los Angeles, CA'),
  website=COALESCE(NULLIF(website,''), 'https://hairtransplantslosangeles.com/contact-us/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://hairtransplantslosangeles.com/contact-us/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Regen LA') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Regen LA', 'https://hairtransplantslosangeles.com/contact-us/', 'rob@regen.la', 'Los Angeles, CA', 'hair restoration', 'identified', 'Public contact source: https://hairtransplantslosangeles.com/contact-us/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('rob@regen.la') OR lower(practice_name)=lower('Regen LA'));

UPDATE outreach SET
  email='info@regen.la',
  city=COALESCE(NULLIF(city,''), 'Los Angeles, CA'),
  website=COALESCE(NULLIF(website,''), 'https://hairtransplantslosangeles.com/contact-us/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://hairtransplantslosangeles.com/contact-us/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Regen LA General') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Regen LA General', 'https://hairtransplantslosangeles.com/contact-us/', 'info@regen.la', 'Los Angeles, CA', 'hair restoration', 'identified', 'Public contact source: https://hairtransplantslosangeles.com/contact-us/ | source_type=official_public | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@regen.la') OR lower(practice_name)=lower('Regen LA General'));

UPDATE outreach SET
  email='info@hairtransplantslosangeles.com',
  city=COALESCE(NULLIF(city,''), 'Los Angeles, CA'),
  website=COALESCE(NULLIF(website,''), 'https://hairtransplantslosangeles.com/contact-us/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://hairtransplantslosangeles.com/contact-us/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Best Hair Transplant LA') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Best Hair Transplant LA', 'https://hairtransplantslosangeles.com/contact-us/', 'info@hairtransplantslosangeles.com', 'Los Angeles, CA', 'hair restoration', 'identified', 'Public contact source: https://hairtransplantslosangeles.com/contact-us/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@hairtransplantslosangeles.com') OR lower(practice_name)=lower('Best Hair Transplant LA'));

UPDATE outreach SET
  email='info@orlandohairclinic.com',
  city=COALESCE(NULLIF(city,''), 'Orlando, FL'),
  website=COALESCE(NULLIF(website,''), 'https://orlandohairclinic.com/contact-us/'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://orlandohairclinic.com/contact-us/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Orlando Hair Clinic') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Orlando Hair Clinic', 'https://orlandohairclinic.com/contact-us/', 'info@orlandohairclinic.com', 'Orlando, FL', 'hair restoration', 'identified', 'Public contact source: https://orlandohairclinic.com/contact-us/ | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@orlandohairclinic.com') OR lower(practice_name)=lower('Orlando Hair Clinic'));

UPDATE outreach SET
  email='info@scenthouston.com',
  city=COALESCE(NULLIF(city,''), 'Houston, TX'),
  website=COALESCE(NULLIF(website,''), 'https://www.scenthouston.com/hair-translplant'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.scenthouston.com/hair-translplant | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('SCENT Houston') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'SCENT Houston', 'https://www.scenthouston.com/hair-translplant', 'info@scenthouston.com', 'Houston, TX', 'hair restoration', 'identified', 'Public contact source: https://www.scenthouston.com/hair-translplant | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@scenthouston.com') OR lower(practice_name)=lower('SCENT Houston'));

UPDATE outreach SET
  email='info@gloryregenerative.com',
  city=COALESCE(NULLIF(city,''), 'Tampa, FL'),
  website=COALESCE(NULLIF(website,''), 'https://gloryregenerative.com/locations/tampa-fl'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://gloryregenerative.com/locations/tampa-fl | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Glory Regenerative Center') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Glory Regenerative Center', 'https://gloryregenerative.com/locations/tampa-fl', 'info@gloryregenerative.com', 'Tampa, FL', 'hair restoration', 'identified', 'Public contact source: https://gloryregenerative.com/locations/tampa-fl | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('info@gloryregenerative.com') OR lower(practice_name)=lower('Glory Regenerative Center'));

UPDATE outreach SET
  email='Info@DallasMensHealth.com',
  city=COALESCE(NULLIF(city,''), 'Dallas, TX'),
  website=COALESCE(NULLIF(website,''), 'https://www.dallasmenshealth.com/services/hair-restoration-treatments'),
  notes=COALESCE(notes,'') || '\nPublic contact source: https://www.dallasmenshealth.com/services/hair-restoration-treatments | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.',
  updated_at=CURRENT_TIMESTAMP
WHERE lower(practice_name)=lower('Dallas Men''s Health') AND (email IS NULL OR email='');

INSERT INTO outreach (id, practice_name, website, email, city, category, stage, notes)
SELECT lower(hex(randomblob(16))), 'Dallas Men''s Health', 'https://www.dallasmenshealth.com/services/hair-restoration-treatments', 'Info@DallasMensHealth.com', 'Dallas, TX', 'hair restoration', 'identified', 'Public contact source: https://www.dallasmenshealth.com/services/hair-restoration-treatments | source_type=official | Public professional/business contact address; verify again immediately before sending if campaign is delayed.'
WHERE NOT EXISTS (SELECT 1 FROM outreach WHERE lower(email)=lower('Info@DallasMensHealth.com') OR lower(practice_name)=lower('Dallas Men''s Health'));

COMMIT;