-- Seed Test Collection Points (Active locations across Sri Lanka)
INSERT INTO collection_points (
  name, address, description, latitude, longitude, 
  contact_person, contact_number, operating_hours,
  items_collecting, target_areas, status, urgency_level, submitted_by
) VALUES 
(
  'Colombo Central Relief Hub',
  '123 Galle Road, Colombo 03',
  'Main collection center for Colombo district. Large warehouse with sorting facilities.',
  6.9271, 79.8612,
  'Saman Perera', '+94 77 123 4567', '7:00 AM - 8:00 PM',
  ARRAY(SELECT id::text FROM item_categories WHERE name IN ('Water', 'Food', 'Clothes', 'Medicine')),
  ARRAY['Galle', 'Matara', 'Kalutara'],
  'active', 'critical', 'Admin'
),
(
  'Kandy Community Center',
  '45 Peradeniya Road, Kandy',
  'Community-run center accepting all donations.',
  7.2906, 80.6337,
  'Nimali Fernando', '+94 71 234 5678', '8:00 AM - 6:00 PM',
  ARRAY(SELECT id::text FROM item_categories WHERE name IN ('Food', 'Clothes', 'Bedding')),
  ARRAY['Nuwara Eliya', 'Badulla'],
  'active', 'high', 'Volunteer'
),
(
  'Galle Fort Donation Point',
  '12 Church Street, Galle Fort',
  'Historic location now serving as donation hub for southern province.',
  6.0328, 80.2170,
  'Kasun Silva', '+94 76 345 6789', '9:00 AM - 5:00 PM',
  ARRAY(SELECT id::text FROM item_categories WHERE name IN ('Baby Items', 'Hygiene Items', 'Medicine')),
  ARRAY['Hambantota', 'Matara'],
  'active', 'normal', 'NGO Worker'
),
(
  'Jaffna Relief Center',
  '78 Hospital Road, Jaffna',
  'Northern province main collection point.',
  9.6615, 80.0255,
  'Thamilini Raj', '+94 75 456 7890', '8:00 AM - 7:00 PM',
  ARRAY(SELECT id::text FROM item_categories WHERE name IN ('Water', 'Food', 'Medicine', 'Tools')),
  ARRAY['Kilinochchi', 'Mullaitivu'],
  'active', 'critical', 'Hospital Staff'
),
(
  'Batticaloa Temple Collection',
  '34 Temple Road, Batticaloa',
  'Temple grounds converted to relief distribution center.',
  7.7310, 81.6747,
  'Rev. Sumedha', '+94 72 567 8901', '6:00 AM - 9:00 PM',
  ARRAY(SELECT id::text FROM item_categories WHERE name IN ('Food', 'Clothes', 'Bedding', 'Kitchen Items')),
  ARRAY['Ampara', 'Trincomalee'],
  'active', 'high', 'Temple Committee'
),
(
  'Negombo Church Aid Center',
  '56 Sea Street, Negombo',
  'Church-organized relief collection accepting all items.',
  7.2094, 79.8358,
  'Father Anthony', '+94 77 678 9012', '7:00 AM - 6:00 PM',
  ARRAY(SELECT id::text FROM item_categories WHERE name IN ('Water', 'Baby Items', 'Hygiene Items')),
  ARRAY['Puttalam', 'Chilaw'],
  'active', 'normal', 'Church Volunteer'
),
(
  'Matara University Collection',
  'University of Ruhuna, Matara',
  'Student-led initiative collecting educational supplies and essentials.',
  5.9485, 80.5353,
  'Prof. Bandara', '+94 71 789 0123', '9:00 AM - 4:00 PM',
  ARRAY(SELECT id::text FROM item_categories WHERE name IN ('Educational Items', 'Clothes', 'Food')),
  ARRAY['Matara', 'Hambantota', 'Galle'],
  'active', 'normal', 'University Staff'
),
(
  'Anuradhapura Sacred City Relief',
  '23 Main Street, Anuradhapura',
  'Heritage area community relief point.',
  8.3114, 80.4037,
  'Chaminda Rathnayake', '+94 76 890 1234', '8:00 AM - 5:00 PM',
  ARRAY(SELECT id::text FROM item_categories WHERE name IN ('Food', 'Water', 'Medicine')),
  ARRAY['Polonnaruwa', 'Dambulla'],
  'active', 'high', 'Local Council'
);

-- Add a pending collection point for testing admin approval
INSERT INTO collection_points (
  name, address, description, latitude, longitude,
  contact_person, contact_number, operating_hours,
  items_collecting, target_areas, status, urgency_level, submitted_by
) VALUES (
  'Ratnapura Gem City Relief',
  '89 Main Street, Ratnapura',
  'New collection point awaiting approval.',
  6.6828, 80.3992,
  'Dinesh Kumara', '+94 77 901 2345', '8:00 AM - 6:00 PM',
  ARRAY(SELECT id::text FROM item_categories WHERE name IN ('Food', 'Clothes')),
  ARRAY['Ratnapura', 'Kegalle'],
  'pending', 'normal', 'Local Volunteer'
);

-- Add test reports
INSERT INTO reports (collection_point_id, category, description, reporter_name, reporter_contact, status)
SELECT 
  id,
  'incorrect_info',
  'Operating hours seem to be wrong. They close at 5 PM not 6 PM.',
  'Helpful Citizen',
  '+94 77 111 2222',
  'pending'
FROM collection_points 
WHERE name = 'Kandy Community Center'
LIMIT 1;

INSERT INTO reports (collection_point_id, category, description, reporter_name, reporter_contact, status)
SELECT 
  id,
  'contact_not_working',
  'Tried calling the number multiple times but no response.',
  'Anonymous',
  NULL,
  'pending'
FROM collection_points 
WHERE name = 'Galle Fort Donation Point'
LIMIT 1;
