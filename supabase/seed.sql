-- Development seed data for PropSpera.
-- Only executable PostgreSQL/Supabase SQL.

set search_path = public;

-- -----------------------------------------------------------------------------
-- Assumptions
-- -----------------------------------------------------------------------------
-- 1. auth_id is left NULL for seeded users because auth.users entries are not
--    created in this seed script.
-- 2. agents are built from the first 10 users only.
-- 3. notification count requirement is satisfied by 100 user_notifications.
--    admin_notifications are seeded separately with 20 rows for admin workflow.
-- 4. whatsapp_clicks.property_id and whatsapp_clicks.agent_id are text fields,
--    so seeded with UUID strings from properties and agents.
-- 5. review_votes and agent_review_votes are inferred supporting tables.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Users
-- -----------------------------------------------------------------------------
INSERT INTO public.users (id, auth_id, email, full_name, phone, role, avatar_url, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', NULL, 'alice.muhire@example.test', 'Alice Muhire', '+250788123456', 'buyer', NULL, '2026-05-01 09:20:00+00', '2026-05-01 09:20:00+00'),
  ('10000000-0000-0000-0000-000000000002', NULL, 'benjamin.iraboneza@example.test', 'Benjamin Iraboneza', '+250782234567', 'buyer', NULL, '2026-05-01 09:25:00+00', '2026-05-01 09:25:00+00'),
  ('10000000-0000-0000-0000-000000000003', NULL, 'carol.nshimiyimana@example.test', 'Carol Nshimiyimana', '+250788987654', 'buyer', NULL, '2026-05-02 10:00:00+00', '2026-05-02 10:00:00+00'),
  ('10000000-0000-0000-0000-000000000004', NULL, 'daniel.mutoni@example.test', 'Daniel Mutoni', '+250783456789', 'buyer', NULL, '2026-05-02 10:10:00+00', '2026-05-02 10:10:00+00'),
  ('10000000-0000-0000-0000-000000000005', NULL, 'edith.nyiramana@example.test', 'Edith Nyiramana', '+250788444333', 'buyer', NULL, '2026-05-03 11:05:00+00', '2026-05-03 11:05:00+00'),
  ('10000000-0000-0000-0000-000000000006', NULL, 'fidele.kamanzi@example.test', 'Fidele Kamanzi', '+250782777888', 'buyer', NULL, '2026-05-03 11:15:00+00', '2026-05-03 11:15:00+00'),
  ('10000000-0000-0000-0000-000000000007', NULL, 'gloria.ishimwe@example.test', 'Gloria Ishimwe', '+250788666555', 'buyer', NULL, '2026-05-04 12:30:00+00', '2026-05-04 12:30:00+00'),
  ('10000000-0000-0000-0000-000000000008', NULL, 'herve.karangwa@example.test', 'Herve Karangwa', '+250783222111', 'buyer', NULL, '2026-05-04 12:35:00+00', '2026-05-04 12:35:00+00'),
  ('10000000-0000-0000-0000-000000000009', NULL, 'ingrid.mukamana@example.test', 'Ingrid Mukamana', '+250788999000', 'buyer', NULL, '2026-05-05 13:45:00+00', '2026-05-05 13:45:00+00'),
  ('10000000-0000-0000-0000-000000000010', NULL, 'jean.patrice@example.test', 'Jean Patrice', '+250783111222', 'buyer', NULL, '2026-05-05 13:55:00+00', '2026-05-05 13:55:00+00'),
  ('10000000-0000-0000-0000-000000000011', NULL, 'karen.niyonsenga@example.test', 'Karen Niyonsenga', '+250788101010', 'agent', NULL, '2026-05-06 14:20:00+00', '2026-05-06 14:20:00+00'),
  ('10000000-0000-0000-0000-000000000012', NULL, 'louis.seraphin@example.test', 'Louis Seraphin', '+250782202020', 'agent', NULL, '2026-05-06 14:30:00+00', '2026-05-06 14:30:00+00'),
  ('10000000-0000-0000-0000-000000000013', NULL, 'marie.chantal@example.test', 'Marie Chantal', '+250788303030', 'agent', NULL, '2026-05-07 15:05:00+00', '2026-05-07 15:05:00+00'),
  ('10000000-0000-0000-0000-000000000014', NULL, 'nathan.uzumaki@example.test', 'Nathan Uzumaki', '+250783404040', 'agent', NULL, '2026-05-07 15:15:00+00', '2026-05-07 15:15:00+00'),
  ('10000000-0000-0000-0000-000000000015', NULL, 'olivia.ineza@example.test', 'Olivia Ineza', '+250788505050', 'agent', NULL, '2026-05-08 16:10:00+00', '2026-05-08 16:10:00+00'),
  ('10000000-0000-0000-0000-000000000016', NULL, 'paul.bazirake@example.test', 'Paul Bazirake', '+250782606060', 'agent', NULL, '2026-05-08 16:20:00+00', '2026-05-08 16:20:00+00'),
  ('10000000-0000-0000-0000-000000000017', NULL, 'rachel.umutesi@example.test', 'Rachel Umutesi', '+250788707070', 'agent', NULL, '2026-05-09 17:05:00+00', '2026-05-09 17:05:00+00'),
  ('10000000-0000-0000-0000-000000000018', NULL, 'samuel.murangwa@example.test', 'Samuel Murangwa', '+250783808080', 'agent', NULL, '2026-05-09 17:15:00+00', '2026-05-09 17:15:00+00'),
  ('10000000-0000-0000-0000-000000000019', NULL, 'tracy.karimunda@example.test', 'Tracy Karimunda', '+250788909090', 'agent', NULL, '2026-05-10 18:00:00+00', '2026-05-10 18:00:00+00'),
  ('10000000-0000-0000-0000-000000000020', NULL, 'victor.kabanda@example.test', 'Victor Kabanda', '+250783909091', 'admin', NULL, '2026-05-10 18:05:00+00', '2026-05-10 18:05:00+00');

-- -----------------------------------------------------------------------------
-- Agents
-- -----------------------------------------------------------------------------
INSERT INTO public.agents (id, user_id, full_name, phone, company_name, license_number, bio, years_experience, specializations, verification_docs, verification_status, avatar_url, total_listings, rating, created_at, updated_at)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 'Karen Niyonsenga', '+250788101010', 'Kigali Home Experts', 'AG-2026-001', 'Trusted Kigali buyer agent with strong local market knowledge.', 8, ARRAY['apartments','residential'], ARRAY['https://example.test/docs/agent1.pdf'], 'approved', NULL, 16, 4.7, '2026-05-11 08:00:00+00', '2026-05-11 08:00:00+00'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000012', 'Louis Seraphin', '+250782202020', 'Urban Living Realty', 'AG-2026-002', 'Specializes in Kimihurura apartments and family homes.', 7, ARRAY['apartments','houses'], ARRAY['https://example.test/docs/agent2.pdf'], 'approved', NULL, 14, 4.6, '2026-05-11 08:10:00+00', '2026-05-11 08:10:00+00'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000013', 'Marie Chantal', '+250788303030', 'Horizon Estates', 'AG-2026-003', 'Client-first agent focused on Nyarutarama villas and premium rentals.', 10, ARRAY['houses','land','luxury'], ARRAY['https://example.test/docs/agent3.pdf'], 'approved', NULL, 18, 4.9, '2026-05-11 08:20:00+00', '2026-05-11 08:20:00+00'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000014', 'Nathan Uzumaki', '+250783404040', 'Riverstone Realty', 'AG-2026-004', 'Experienced commercial property agent with strong client service.', 12, ARRAY['commercial','apartments'], ARRAY['https://example.test/docs/agent4.pdf'], 'approved', NULL, 13, 4.8, '2026-05-11 08:30:00+00', '2026-05-11 08:30:00+00'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000015', 'Olivia Ineza', '+250788505050', 'Prime Kigali Properties', 'AG-2026-005', 'Focuses on high-demand Kigali rentals and modern apartments.', 6, ARRAY['apartments','rentals'], ARRAY['https://example.test/docs/agent5.pdf'], 'approved', NULL, 12, 4.5, '2026-05-11 08:40:00+00', '2026-05-11 08:40:00+00'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000016', 'Paul Bazirake', '+250782606060', 'Starlight Realtors', 'AG-2026-006', 'Land specialist serving Kibagabaga and Gacuriro buyers.', 9, ARRAY['land','houses'], ARRAY['https://example.test/docs/agent6.pdf'], 'approved', NULL, 12, 4.4, '2026-05-11 08:50:00+00', '2026-05-11 08:50:00+00'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000017', 'Rachel Umutesi', '+250788707070', 'Kigali Connect Realty', 'AG-2026-007', 'Local expert in Kacyiru and Rebero residential listings.', 5, ARRAY['houses','apartments'], ARRAY['https://example.test/docs/agent7.pdf'], 'pending', NULL, 8, 4.2, '2026-05-11 09:00:00+00', '2026-05-11 09:00:00+00'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000018', 'Samuel Murangwa', '+250783808080', 'Gateway Property Group', 'AG-2026-008', 'Builds strong buyer relationships across Kanombe and Kabeza.', 7, ARRAY['commercial','houses'], ARRAY['https://example.test/docs/agent8.pdf'], 'approved', NULL, 10, 4.3, '2026-05-11 09:10:00+00', '2026-05-11 09:10:00+00'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000019', 'Tracy Karimunda', '+250788909090', 'MetroHouse Rwanda', 'AG-2026-009', 'Expert negotiator for high-value properties and confident sellers.', 11, ARRAY['apartments','houses','commercial'], ARRAY['https://example.test/docs/agent9.pdf'], 'approved', NULL, 18, 4.8, '2026-05-11 09:20:00+00', '2026-05-11 09:20:00+00'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000020', 'Victor Kabanda', '+250783909091', 'Capital Estates', 'AG-2026-010', 'Admin user and senior broker for strategic project listings.', 14, ARRAY['commercial','land'], ARRAY['https://example.test/docs/agent10.pdf'], 'approved', NULL, 20, 4.9, '2026-05-11 09:30:00+00', '2026-05-11 09:30:00+00');

-- -----------------------------------------------------------------------------
-- Properties
-- -----------------------------------------------------------------------------
INSERT INTO public.properties (id, agent_id, title, description, property_type, listing_type, price, currency, bedrooms, bathrooms, area_sqm, built_area, location, neighborhood, address, latitude, longitude, images, video_url, amenities, furnished, status, featured, views, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Modern 2-Bedroom Apartment in Kimihurura', 'Light-filled apartment near the business district with secure parking and rooftop views.', 'apartment', 'rent', 3200000, 'RWF', 2, 2, 85, 85, 'Kigali', 'Kimihurura', 'House 12, Kimihurura Street', -1.9421, 30.0862, ARRAY['https://example.test/images/apt1-1.jpg','https://example.test/images/apt1-2.jpg'], NULL, ARRAY['parking','security','balcony'], 'furnished', 'approved', true, 210, '2026-05-12 08:00:00+00', '2026-05-12 08:00:00+00'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Bright Studio Apartment near Nyarutarama Lake', 'Cozy studio with city lights and easy access to restaurants.', 'apartment', 'rent', 2100000, 'RWF', 1, 1, 40, 40, 'Kigali', 'Nyarutarama', 'Block B, Nyarutarama Heights', -1.9514, 30.0748, ARRAY['https://example.test/images/apt2-1.jpg'], NULL, ARRAY['wifi','gym access','backup power'], 'furnished', 'approved', false, 180, '2026-05-12 08:10:00+00', '2026-05-12 08:10:00+00'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Renovated 3-Bedroom House in Kacyiru', 'Spacious property with garden and modern kitchen, steps from the embassy area.', 'house', 'sale', 1650000000, 'RWF', 3, 2, 180, 175, 'Kigali', 'Kacyiru', 'Plot 28, Kacyiru Road', -1.9335, 30.0741, ARRAY['https://example.test/images/house1-1.jpg','https://example.test/images/house1-2.jpg'], NULL, ARRAY['garden','garage','security'], NULL, 'approved', true, 325, '2026-05-12 08:20:00+00', '2026-05-12 08:20:00+00'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Ground-Floor Apartment with Pool Access', 'Family-friendly apartment community with playground and direct pool entrance.', 'apartment', 'sale', 720000000, 'RWF', 3, 2, 120, 120, 'Kigali', 'Kibagabaga', 'Unit 4, Green Park Residences', -1.9297, 30.1005, ARRAY['https://example.test/images/apt4-1.jpg'], NULL, ARRAY['pool','security','playground'], 'semi-furnished', 'approved', false, 144, '2026-05-12 08:30:00+00', '2026-05-12 08:30:00+00'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'Luxury 4-Bedroom Villa in Nyarutarama', 'Premium villa with private garden, terrace and chef-ready kitchen.', 'house', 'sale', 2550000000, 'RWF', 4, 4, 320, 300, 'Kigali', 'Nyarutarama', 'Villa 9, Lake View Drive', -1.9518, 30.0753, ARRAY['https://example.test/images/house2-1.jpg','https://example.test/images/house2-2.jpg'], NULL, ARRAY['garden','terrace','security','backup power'], NULL, 'pending', true, 420, '2026-05-12 08:40:00+00', '2026-05-12 08:40:00+00'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'Compact 1-Bedroom Apartment in Kiyovu', 'Smart layout ideal for professionals, walking distance to offices and cafés.', 'apartment', 'rent', 1950000, 'RWF', 1, 1, 48, 48, 'Kigali', 'Kiyovu', 'Apt 10, City Tower', -1.9480, 30.0595, ARRAY['https://example.test/images/apt6-1.jpg'], NULL, ARRAY['wifi','security','laundry'], 'furnished', 'approved', false, 138, '2026-05-12 08:50:00+00', '2026-05-12 08:50:00+00'),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'Executive 2-Bedroom Apartment in Kimihurura', 'Excellent finishes, guest parking and community gym.', 'apartment', 'sale', 880000000, 'RWF', 2, 2, 98, 98, 'Kigali', 'Kimihurura', 'Tower 7, Vista Park', -1.9437, 30.0850, ARRAY['https://example.test/images/apt7-1.jpg'], NULL, ARRAY['gym','parking','security'], 'furnished', 'approved', true, 265, '2026-05-12 09:00:00+00', '2026-05-12 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001', 'Two-Bedroom Garden Apartment with Balcony', 'Quiet compound with landscaped garden and easy access to main roads.', 'apartment', 'rent', 2850000, 'RWF', 2, 1, 90, 90, 'Kigali', 'Gacuriro', 'Garden Court 12', -1.9455, 30.0838, ARRAY['https://example.test/images/apt8-1.jpg'], NULL, ARRAY['garden','balcony','security'], 'unfurnished', 'approved', false, 159, '2026-05-12 09:10:00+00', '2026-05-12 09:10:00+00'),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000002', 'Prime Commercial Office Space in Kacyiru', 'Fully fitted office suite close to embassies and international schools.', 'commercial', 'rent', 6200000, 'RWF', NULL, 2, 150, 150, 'Kigali', 'Kacyiru', 'Suite 4A, Embassy Plaza', -1.9330, 30.0737, ARRAY['https://example.test/images/commercial1-1.jpg'], NULL, ARRAY['parking','security','conference room'], NULL, 'approved', false, 202, '2026-05-12 09:20:00+00', '2026-05-12 09:20:00+00'),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', 'Retail Unit with Busy Main Road Exposure', 'Ground-floor retail space ideal for shop or café near Kacyiru Roundabout.', 'commercial', 'sale', 890000000, 'RWF', NULL, 1, 120, 120, 'Kigali', 'Kacyiru', 'Ground Floor, Market Mall', -1.9332, 30.0750, ARRAY['https://example.test/images/commercial2-1.jpg'], NULL, ARRAY['shopfront','security','parking'], NULL, 'approved', false, 124, '2026-05-12 09:30:00+00', '2026-05-12 09:30:00+00'),
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', 'Brand New Land Parcel near Kanombe Airport', 'Flat build-ready land with utilities nearby and easy airport access.', 'land', 'sale', 450000000, 'RWF', NULL, NULL, 800, NULL, 'Kigali', 'Kanombe', 'Plot 46, Airport Road', -1.9717, 30.2233, ARRAY['https://example.test/images/land1-1.jpg'], NULL, ARRAY['water','electricity access','road access'], NULL, 'pending', false, 87, '2026-05-12 09:40:00+00', '2026-05-12 09:40:00+00'),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002', '15-Acre Development Land in Rebero', 'Large investment parcel with hillside views and quiet surroundings.', 'land', 'sale', 1800000000, 'RWF', NULL, NULL, 6200, NULL, 'Kigali', 'Rebero', 'Plot 112, Rebero Heights', -1.9488, 30.0432, ARRAY['https://example.test/images/land2-1.jpg'], NULL, ARRAY['gated entrance','water nearby'], NULL, 'approved', false, 101, '2026-05-12 09:50:00+00', '2026-05-12 09:50:00+00'),
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000002', 'Four-Bedroom Family Home in Kibagabaga', 'Well-kept house with backyard, staff quarters and private parking.', 'house', 'sale', 1350000000, 'RWF', 4, 3, 220, 210, 'Kigali', 'Kibagabaga', 'House 21, Sunrise Avenue', -1.9312, 30.0985, ARRAY['https://example.test/images/house3-1.jpg'], NULL, ARRAY['backyard','parking','storage'], NULL, 'approved', true, 334, '2026-05-12 10:00:00+00', '2026-05-12 10:00:00+00'),
  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000002', 'Two-Bedroom Apartment with City View', 'Contemporary apartment with large windows and secure compound.', 'apartment', 'rent', 2750000, 'RWF', 2, 2, 92, 92, 'Kigali', 'Gacuriro', 'Block 3, Hilltop Place', -1.9467, 30.0811, ARRAY['https://example.test/images/apt14-1.jpg'], NULL, ARRAY['balcony','security','visitor parking'], 'furnished', 'approved', false, 189, '2026-05-12 10:10:00+00', '2026-05-12 10:10:00+00'),
  ('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000002', 'Office Space with Conference Room', 'Flexible workspace near Kabeza with strong foot traffic.', 'commercial', 'rent', 5400000, 'RWF', NULL, 2, 135, 135, 'Kigali', 'Kabeza', 'Floor 2, Business Hub', -1.9923, 30.1089, ARRAY['https://example.test/images/commercial3-1.jpg'], NULL, ARRAY['conference room','parking','security'], NULL, 'pending', false, 76, '2026-05-12 10:20:00+00', '2026-05-12 10:20:00+00'),
  ('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000003', 'Garden Villa with Modern Finish in Nyarutarama', 'Private compound with outdoor living space and guest suite.', 'house', 'sale', 1950000000, 'RWF', 4, 4, 280, 270, 'Kigali', 'Nyarutarama', 'Villa 18, Lake Road', -1.9513, 30.0751, ARRAY['https://example.test/images/house4-1.jpg'], NULL, ARRAY['garden','guest house','backup power'], NULL, 'approved', true, 305, '2026-05-12 10:30:00+00', '2026-05-12 10:30:00+00'),
  ('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000003', 'Luxury 3-Bedroom Apartment in Kimihurura', 'Upscale apartment with concierge, valet parking, and city skyline views.', 'apartment', 'sale', 1120000000, 'RWF', 3, 3, 140, 140, 'Kigali', 'Kimihurura', 'Apt 15, Skyline Residence', -1.9430, 30.0845, ARRAY['https://example.test/images/apt17-1.jpg'], NULL, ARRAY['parking','security','pool'], 'furnished', 'approved', true, 380, '2026-05-12 10:40:00+00', '2026-05-12 10:40:00+00'),
  ('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000003', 'Low-Rise 2-Bedroom Apartment in Kiyovu', 'Affordable apartment close to schools and restaurants.', 'apartment', 'rent', 2200000, 'RWF', 2, 2, 88, 88, 'Kigali', 'Kiyovu', 'Units 5-7, Kiyovu Court', -1.9475, 30.0598, ARRAY['https://example.test/images/apt18-1.jpg'], NULL, ARRAY['wifi','security','laundry'], 'semi-furnished', 'approved', false, 154, '2026-05-12 10:50:00+00', '2026-05-12 10:50:00+00'),
  ('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000003', 'Office Floor in Central Kacyiru', 'Open-plan commercial space with easy access to major roads.', 'commercial', 'rent', 7500000, 'RWF', NULL, 3, 180, 180, 'Kigali', 'Kacyiru', 'Floor 3, City Center', -1.9331, 30.0742, ARRAY['https://example.test/images/commercial4-1.jpg'], NULL, ARRAY['elevator','parking','security'], NULL, 'approved', false, 210, '2026-05-12 11:00:00+00', '2026-05-12 11:00:00+00'),
  ('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000003', 'Empty Land Plot in Gacuriro', 'Residential land parcel close to new gated communities.', 'land', 'sale', 680000000, 'RWF', NULL, NULL, 950, NULL, 'Kigali', 'Gacuriro', 'Plot 18, Greenway', -1.9472, 30.0821, ARRAY['https://example.test/images/land3-1.jpg'], NULL, ARRAY['road access','near utilities'], NULL, 'approved', false, 98, '2026-05-12 11:10:00+00', '2026-05-12 11:10:00+00'),
  ('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000003', 'Family Home with Terrace in Rebero', 'Three-bedroom home with study area, quiet street and guest parking.', 'house', 'sale', 1280000000, 'RWF', 3, 3, 210, 205, 'Kigali', 'Rebero', 'House 7, Rebero Lane', -1.9469, 30.0440, ARRAY['https://example.test/images/house5-1.jpg'], NULL, ARRAY['terrace','parking','storage'], NULL, 'approved', false, 276, '2026-05-12 11:20:00+00', '2026-05-12 11:20:00+00'),
  ('30000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000003', 'Two-Bedroom Hilltop Apartment in Nyarutarama', 'Spacious living area with excellent natural light and pool access.', 'apartment', 'sale', 930000000, 'RWF', 2, 2, 105, 105, 'Kigali', 'Nyarutarama', 'Apt 22, Hillcrest Plaza', -1.9520, 30.0749, ARRAY['https://example.test/images/apt22-1.jpg'], NULL, ARRAY['pool','security','gym access'], 'furnished', 'approved', true, 258, '2026-05-12 11:30:00+00', '2026-05-12 11:30:00+00'),
  ('30000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000004', 'Large Warehouse with Loading Bay in Kanombe', 'Industrial warehouse perfectly located near airport logistics routes.', 'commercial', 'sale', 1420000000, 'RWF', NULL, 2, 520, 520, 'Kigali', 'Kanombe', 'Warehouse 11, Logistic Park', -1.9708, 30.2225, ARRAY['https://example.test/images/commercial5-1.jpg'], NULL, ARRAY['loading bay','power','security'], NULL, 'approved', false, 196, '2026-05-12 11:40:00+00', '2026-05-12 11:40:00+00'),
  ('30000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000004', 'Four-Bedroom Executive Residence in Kacyiru', 'Elegant home with dining room, family area and mature garden.', 'house', 'sale', 1850000000, 'RWF', 4, 4, 260, 250, 'Kigali', 'Kacyiru', 'Villa 14, Embassy Road', -1.9339, 30.0739, ARRAY['https://example.test/images/house6-1.jpg'], NULL, ARRAY['garden','parking','guest suite'], NULL, 'approved', true, 317, '2026-05-12 11:50:00+00', '2026-05-12 11:50:00+00'),
  ('30000000-0000-0000-0000-000000000025', '20000000-0000-0000-0000-000000000004', 'Compact Retail Space in Gacuriro', 'Street-level unit ideal for boutique retail or small café.', 'commercial', 'rent', 3400000, 'RWF', NULL, 1, 75, 75, 'Kigali', 'Gacuriro', 'Shop 2, Garden Lane', -1.9461, 30.0825, ARRAY['https://example.test/images/commercial6-1.jpg'], NULL, ARRAY['shopfront','storage','security'], NULL, 'pending', false, 90, '2026-05-12 12:00:00+00', '2026-05-12 12:00:00+00'),
  ('30000000-0000-0000-0000-000000000026', '20000000-0000-0000-0000-000000000004', 'Hillside Land Parcel with City Views', 'Scenic land ideal for a private villa development.', 'land', 'sale', 550000000, 'RWF', NULL, NULL, 1200, NULL, 'Kigali', 'Rebero', 'Plot 31, Hillview', -1.9495, 30.0439, ARRAY['https://example.test/images/land4-1.jpg'], NULL, ARRAY['scenic view','road access'], NULL, 'approved', false, 107, '2026-05-12 12:10:00+00', '2026-05-12 12:10:00+00'),
  ('30000000-0000-0000-0000-000000000027', '20000000-0000-0000-0000-000000000004', 'Three-Bedroom House with Finished Basement', 'Family house with extended living room and indoor storage.', 'house', 'sale', 1420000000, 'RWF', 3, 3, 210, 205, 'Kigali', 'Gacuriro', 'House 31, Parkview Crescent', -1.9486, 30.0823, ARRAY['https://example.test/images/house7-1.jpg'], NULL, ARRAY['basement','parking','security'], NULL, 'approved', false, 257, '2026-05-12 12:20:00+00', '2026-05-12 12:20:00+00'),
  ('30000000-0000-0000-0000-000000000028', '20000000-0000-0000-0000-000000000005', 'Studio Apartment near Kigali Heights', 'Compact new build apartment with concierge and secure entry.', 'apartment', 'rent', 1800000, 'RWF', 1, 1, 36, 36, 'Kigali', 'Kimihurura', 'Unit 2B, Heights Plaza', -1.9435, 30.0820, ARRAY['https://example.test/images/apt28-1.jpg'], NULL, ARRAY['security','wifi','parking'], 'furnished', 'approved', false, 145, '2026-05-12 12:30:00+00', '2026-05-12 12:30:00+00'),
  ('30000000-0000-0000-0000-000000000029', '20000000-0000-0000-0000-000000000005', 'Premium Office Suite in Nyarutarama', 'Bright office space with excellent meeting room access.', 'commercial', 'rent', 6800000, 'RWF', NULL, 2, 160, 160, 'Kigali', 'Nyarutarama', 'Suite 101, Lake Business Center', -1.9512, 30.0746, ARRAY['https://example.test/images/commercial7-1.jpg'], NULL, ARRAY['meeting room','parking','security'], NULL, 'approved', false, 184, '2026-05-12 12:40:00+00', '2026-05-12 12:40:00+00'),
  ('30000000-0000-0000-0000-000000000030', '20000000-0000-0000-0000-000000000005', 'Spacious 4-Bedroom Home in Nyarutarama', 'Large family home with covered patio and modern finishes.', 'house', 'sale', 2100000000, 'RWF', 4, 4, 300, 290, 'Kigali', 'Nyarutarama', 'House 45, Lake View Drive', -1.9517, 30.0758, ARRAY['https://example.test/images/house8-1.jpg'], NULL, ARRAY['patio','garage','gardens'], NULL, 'pending', true, 280, '2026-05-12 12:50:00+00', '2026-05-12 12:50:00+00'),
  ('30000000-0000-0000-0000-000000000031', '20000000-0000-0000-0000-000000000005', 'Kabeza Boutique Retail Outlet', 'Bright retail store with street frontage and modern finishes.', 'commercial', 'sale', 920000000, 'RWF', NULL, 1, 95, 95, 'Kigali', 'Kabeza', 'Shop 6, Kabeza Mall', -1.9918, 30.1095, ARRAY['https://example.test/images/commercial8-1.jpg'], NULL, ARRAY['shopfront','parking','security'], NULL, 'approved', false, 122, '2026-05-12 13:00:00+00', '2026-05-12 13:00:00+00'),
  ('30000000-0000-0000-0000-000000000032', '20000000-0000-0000-0000-000000000005', 'Four-Bedroom House in Kibagabaga', 'Comfortable home with large dining space and staff quarters.', 'house', 'sale', 1580000000, 'RWF', 4, 3, 240, 235, 'Kigali', 'Kibagabaga', 'House 32, Maple Court', -1.9317, 30.0991, ARRAY['https://example.test/images/house9-1.jpg'], NULL, ARRAY['dining room','staff quarters','garage'], NULL, 'approved', false, 214, '2026-05-12 13:10:00+00', '2026-05-12 13:10:00+00'),
  ('30000000-0000-0000-0000-000000000033', '20000000-0000-0000-0000-000000000005', 'Sunlit 2-Bedroom Apartment in Rebero', 'Modern condo with easy access to supermarkets and schools.', 'apartment', 'rent', 2400000, 'RWF', 2, 2, 100, 100, 'Kigali', 'Rebero', 'Unit 8, Rebero Court', -1.9491, 30.0435, ARRAY['https://example.test/images/apt33-1.jpg'], NULL, ARRAY['security','balcony','wifi'], 'semi-furnished', 'approved', false, 168, '2026-05-12 13:20:00+00', '2026-05-12 13:20:00+00'),
  ('30000000-0000-0000-0000-000000000034', '20000000-0000-0000-0000-000000000006', 'Kigali Land Parcel for Residential Development', 'Flat plot ready for a gated residential project.', 'land', 'sale', 720000000, 'RWF', NULL, NULL, 1100, NULL, 'Kigali', 'Kabeza', 'Plot 55, East Ridge', -1.9921, 30.1098, ARRAY['https://example.test/images/land5-1.jpg'], NULL, ARRAY['road access','near utilities'], NULL, 'approved', false, 103, '2026-05-12 13:30:00+00', '2026-05-12 13:30:00+00'),
  ('30000000-0000-0000-0000-000000000035', '20000000-0000-0000-0000-000000000006', 'Contemporary 3-Bedroom Home in Kimihurura', 'Stylish house with separate lounge and private outdoor area.', 'house', 'sale', 1720000000, 'RWF', 3, 3, 230, 220, 'Kigali', 'Kimihurura', 'House 38, Green Avenue', -1.9438, 30.0849, ARRAY['https://example.test/images/house10-1.jpg'], NULL, ARRAY['outdoor area','garage','security'], NULL, 'approved', true, 290, '2026-05-12 13:40:00+00', '2026-05-12 13:40:00+00'),
  ('30000000-0000-0000-0000-000000000036', '20000000-0000-0000-0000-000000000006', 'Office Floor in Nyarutarama Business Park', 'Flexible workspace with natural light and reception services.', 'commercial', 'rent', 7800000, 'RWF', NULL, 2, 170, 170, 'Kigali', 'Nyarutarama', 'Floor 5, Park Plaza', -1.9510, 30.0738, ARRAY['https://example.test/images/commercial9-1.jpg'], NULL, ARRAY['reception','security','parking'], NULL, 'approved', false, 178, '2026-05-12 13:50:00+00', '2026-05-12 13:50:00+00'),
  ('30000000-0000-0000-0000-000000000037', '20000000-0000-0000-0000-000000000006', 'High-Value Plot in Kacyiru', 'Prime land near embassies with frontage on a major road.', 'land', 'sale', 920000000, 'RWF', NULL, NULL, 1350, NULL, 'Kigali', 'Kacyiru', 'Plot 12, Embassy Link', -1.9334, 30.0745, ARRAY['https://example.test/images/land6-1.jpg'], NULL, ARRAY['road access','utilities nearby'], NULL, 'approved', false, 115, '2026-05-12 14:00:00+00', '2026-05-12 14:00:00+00'),
  ('30000000-0000-0000-0000-000000000038', '20000000-0000-0000-0000-000000000006', 'Three-Bedroom Apartment with Lake View', 'Contemporary apartment with large windows and secure compound.', 'apartment', 'sale', 980000000, 'RWF', 3, 3, 130, 130, 'Kigali', 'Nyarutarama', 'Apt 23, Lake View Tower', -1.9519, 30.0750, ARRAY['https://example.test/images/apt38-1.jpg'], NULL, ARRAY['lake view','security','parking'], 'furnished', 'approved', true, 365, '2026-05-12 14:10:00+00', '2026-05-12 14:10:00+00'),
  ('30000000-0000-0000-0000-000000000039', '20000000-0000-0000-0000-000000000007', 'Modern 1-Bedroom Loft in Kiyovu', 'Stylish loft apartment ideal for a young professional.', 'apartment', 'rent', 1900000, 'RWF', 1, 1, 50, 50, 'Kigali', 'Kiyovu', 'Loft 4, Kiyovu Square', -1.9478, 30.0597, ARRAY['https://example.test/images/apt39-1.jpg'], NULL, ARRAY['wifi','security','laundry'], 'furnished', 'approved', false, 172, '2026-05-12 14:20:00+00', '2026-05-12 14:20:00+00'),
  ('30000000-0000-0000-0000-000000000040', '20000000-0000-0000-0000-000000000007', 'Two-Bedroom House with Garden in Rebero', 'Quiet family home with private garden and flexible living spaces.', 'house', 'sale', 1290000000, 'RWF', 2, 2, 185, 180, 'Kigali', 'Rebero', 'House 14, Rebero Park', -1.9490, 30.0438, ARRAY['https://example.test/images/house11-1.jpg'], NULL, ARRAY['garden','parking','storage'], NULL, 'approved', false, 238, '2026-05-12 14:30:00+00', '2026-05-12 14:30:00+00'),
  ('30000000-0000-0000-0000-000000000041', '20000000-0000-0000-0000-000000000007', 'Retail Shop in Gacuriro Neighborhood', 'Well-positioned retail space with strong neighborhood demand.', 'commercial', 'rent', 3200000, 'RWF', NULL, 1, 82, 82, 'Kigali', 'Gacuriro', 'Shop 5, Gacuriro Plaza', -1.9462, 30.0826, ARRAY['https://example.test/images/commercial10-1.jpg'], NULL, ARRAY['shopfront','security','parking'], NULL, 'approved', false, 131, '2026-05-12 14:40:00+00', '2026-05-12 14:40:00+00'),
  ('30000000-0000-0000-0000-000000000042', '20000000-0000-0000-0000-000000000007', 'Large Duplex Apartment in Kimihurura', 'Spacious duplex with dedicated study area and modern finishes.', 'apartment', 'sale', 1380000000, 'RWF', 3, 3, 160, 160, 'Kigali', 'Kimihurura', 'Duplex 7, Royal Residence', -1.9434, 30.0851, ARRAY['https://example.test/images/apt42-1.jpg'], NULL, ARRAY['study','security','balcony'], 'furnished', 'approved', true, 312, '2026-05-12 14:50:00+00', '2026-05-12 14:50:00+00'),
  ('30000000-0000-0000-0000-000000000043', '20000000-0000-0000-0000-000000000007', 'Modern 3-Bedroom House near Kabeza Park', 'Well-maintained family home with patio and guest parking.', 'house', 'sale', 1480000000, 'RWF', 3, 3, 230, 220, 'Kigali', 'Kabeza', 'House 11, Parkside', -1.9920, 30.1096, ARRAY['https://example.test/images/house12-1.jpg'], NULL, ARRAY['patio','parking','guest room'], NULL, 'approved', false, 209, '2026-05-12 15:00:00+00', '2026-05-12 15:00:00+00'),
  ('30000000-0000-0000-0000-000000000044', '20000000-0000-0000-0000-000000000008', 'Brand New Apartment in Kiyovu', 'Modern finishes with community gym and 24/7 security.', 'apartment', 'sale', 820000000, 'RWF', 2, 2, 110, 110, 'Kigali', 'Kiyovu', 'Apt 9, Kiyovu Gardens', -1.9479, 30.0599, ARRAY['https://example.test/images/apt44-1.jpg'], NULL, ARRAY['gym','security','parking'], 'furnished', 'approved', true, 232, '2026-05-12 15:10:00+00', '2026-05-12 15:10:00+00'),
  ('30000000-0000-0000-0000-000000000045', '20000000-0000-0000-0000-000000000008', 'Office Hub with Multiple Workspaces', 'Flexible office hub space suitable for 15-person team.', 'commercial', 'rent', 9800000, 'RWF', NULL, 4, 220, 220, 'Kigali', 'Kanombe', 'Office 2, Commerce Plaza', -1.9715, 30.2230, ARRAY['https://example.test/images/commercial11-1.jpg'], NULL, ARRAY['open plan','meeting rooms','security'], NULL, 'pending', false, 138, '2026-05-12 15:20:00+00', '2026-05-12 15:20:00+00'),
  ('30000000-0000-0000-0000-000000000046', '20000000-0000-0000-0000-000000000008', 'Large Land Plot in Kanombe Business District', 'Versatile parcel suitable for commercial development.', 'land', 'sale', 1250000000, 'RWF', NULL, NULL, 2100, NULL, 'Kigali', 'Kanombe', 'Plot 88, Business Corridor', -1.9710, 30.2235, ARRAY['https://example.test/images/land7-1.jpg'], NULL, ARRAY['commercial zoning','road access'], NULL, 'approved', false, 129, '2026-05-12 15:30:00+00', '2026-05-12 15:30:00+00'),
  ('30000000-0000-0000-0000-000000000047', '20000000-0000-0000-0000-000000000008', 'Three-Bedroom Apartment in Nyarutarama', 'Quiet apartment with generous living room and shared pool.', 'apartment', 'rent', 2950000, 'RWF', 3, 2, 120, 120, 'Kigali', 'Nyarutarama', 'Unit 11, Garden Towers', -1.9522, 30.0751, ARRAY['https://example.test/images/apt47-1.jpg'], NULL, ARRAY['pool','security','garden'], 'furnished', 'approved', true, 211, '2026-05-12 15:40:00+00', '2026-05-12 15:40:00+00'),
  ('30000000-0000-0000-0000-000000000048', '20000000-0000-0000-0000-000000000008', 'Two-Bedroom Home with Private Yard', 'Neat home with walled yard, ideal for young families.', 'house', 'sale', 1180000000, 'RWF', 2, 2, 175, 170, 'Kigali', 'Gacuriro', 'House 9, Greenway Heights', -1.9460, 30.0820, ARRAY['https://example.test/images/house13-1.jpg'], NULL, ARRAY['yard','parking','storage'], NULL, 'approved', false, 196, '2026-05-12 15:50:00+00', '2026-05-12 15:50:00+00'),
  ('30000000-0000-0000-0000-000000000049', '20000000-0000-0000-0000-000000000009', 'Corner Retail Space in Kibagabaga', 'High-visibility retail unit on a busy neighborhood street.', 'commercial', 'rent', 3150000, 'RWF', NULL, 1, 90, 90, 'Kigali', 'Kibagabaga', 'Unit 1, Market Street', -1.9315, 30.0994, ARRAY['https://example.test/images/commercial12-1.jpg'], NULL, ARRAY['corner unit','parking','security'], NULL, 'approved', false, 118, '2026-05-12 16:00:00+00', '2026-05-12 16:00:00+00'),
  ('30000000-0000-0000-0000-000000000050', '20000000-0000-0000-0000-000000000009', 'Luxury 5-Bedroom Villa in Nyarutarama', 'Elegant villa with private pool, patio and guest house.', 'house', 'sale', 2980000000, 'RWF', 5, 5, 420, 400, 'Kigali', 'Nyarutarama', 'Villa 51, Lake Ridge', -1.9514, 30.0757, ARRAY['https://example.test/images/house14-1.jpg'], NULL, ARRAY['pool','guest house','security','garden'], NULL, 'pending', true, 392, '2026-05-12 16:10:00+00', '2026-05-12 16:10:00+00'),
  ('30000000-0000-0000-0000-000000000051', '20000000-0000-0000-0000-000000000009', 'Two-Bedroom Apartment in Kimihurura Business District', 'Comfortable apartment with shared lounge and on-site security.', 'apartment', 'rent', 2600000, 'RWF', 2, 1, 94, 94, 'Kigali', 'Kimihurura', 'Apt 18, Business Residence', -1.9432, 30.0846, ARRAY['https://example.test/images/apt51-1.jpg'], NULL, ARRAY['security','laundry','backup power'], 'furnished', 'approved', true, 166, '2026-05-12 16:20:00+00', '2026-05-12 16:20:00+00'),
  ('30000000-0000-0000-0000-000000000052', '20000000-0000-0000-0000-000000000009', 'Industrial Storage Facility near Kanombe', 'Secure storage facility with good truck access and fencing.', 'commercial', 'rent', 4100000, 'RWF', NULL, 1, 240, 240, 'Kigali', 'Kanombe', 'Storage 3, Depot Road', -1.9711, 30.2231, ARRAY['https://example.test/images/commercial13-1.jpg'], NULL, ARRAY['fenced yard','power','security'], NULL, 'approved', false, 123, '2026-05-12 16:30:00+00', '2026-05-12 16:30:00+00'),
  ('30000000-0000-0000-0000-000000000053', '20000000-0000-0000-0000-000000000009', 'Lakeview Studio Apartment in Nyarutarama', 'Compact lakeview studio with secure access and kitchenette.', 'apartment', 'rent', 1850000, 'RWF', 1, 1, 42, 42, 'Kigali', 'Nyarutarama', 'Studio 6, Lake Court', -1.9515, 30.0752, ARRAY['https://example.test/images/apt53-1.jpg'], NULL, ARRAY['lake view','security','wifi'], 'furnished', 'approved', false, 152, '2026-05-12 16:40:00+00', '2026-05-12 16:40:00+00'),
  ('30000000-0000-0000-0000-000000000054', '20000000-0000-0000-0000-000000000010', 'Three-Bedroom Family Home in Kibagabaga', 'Well maintained home with courtyard and separate dining area.', 'house', 'sale', 1450000000, 'RWF', 3, 3, 210, 205, 'Kigali', 'Kibagabaga', 'House 14, Cedar Lane', -1.9314, 30.0993, ARRAY['https://example.test/images/house15-1.jpg'], NULL, ARRAY['courtyard','dining room','parking'], NULL, 'approved', false, 227, '2026-05-12 16:50:00+00', '2026-05-12 16:50:00+00'),
  ('30000000-0000-0000-0000-000000000055', '20000000-0000-0000-0000-000000000010', 'Office Space with High Exposure', 'First-floor office unit that receives strong pedestrian traffic.', 'commercial', 'sale', 1020000000, 'RWF', NULL, 2, 145, 145, 'Kigali', 'Kacyiru', 'Office 7, Commerce Center', -1.9336, 30.0740, ARRAY['https://example.test/images/commercial14-1.jpg'], NULL, ARRAY['parking','security','reception'], NULL, 'approved', false, 167, '2026-05-12 17:00:00+00', '2026-05-12 17:00:00+00'),
  ('30000000-0000-0000-0000-000000000056', '20000000-0000-0000-0000-000000000010', 'Hillside Land Plot in Rebero', 'Quiet land parcel with mature trees and peaceful neighborhood access.', 'land', 'sale', 620000000, 'RWF', NULL, NULL, 980, NULL, 'Kigali', 'Rebero', 'Plot 24, Hillcrest', -1.9493, 30.0434, ARRAY['https://example.test/images/land8-1.jpg'], NULL, ARRAY['mature trees','road access'], NULL, 'approved', false, 109, '2026-05-12 17:10:00+00', '2026-05-12 17:10:00+00'),
  ('30000000-0000-0000-0000-000000000057', '20000000-0000-0000-0000-000000000010', 'Stylish 2-Bedroom Apartment in Gacuriro', 'Secure apartment with shared garden and convenient commuter access.', 'apartment', 'rent', 2700000, 'RWF', 2, 2, 98, 98, 'Kigali', 'Gacuriro', 'Unit 14, Garden View', -1.9464, 30.0818, ARRAY['https://example.test/images/apt57-1.jpg'], NULL, ARRAY['garden','security','parking'], 'furnished', 'approved', false, 176, '2026-05-12 17:20:00+00', '2026-05-12 17:20:00+00'),
  ('30000000-0000-0000-0000-000000000058', '20000000-0000-0000-0000-000000000001', 'Luxury 3-Bedroom Apartment in Kimihurura', 'Great location for professionals with easy access to downtown.', 'apartment', 'sale', 1250000000, 'RWF', 3, 3, 135, 135, 'Kigali', 'Kimihurura', 'Apt 29, Vista Residences', -1.9436, 30.0852, ARRAY['https://example.test/images/apt58-1.jpg'], NULL, ARRAY['security','parking','gym'], 'furnished', 'approved', true, 366, '2026-05-12 17:30:00+00', '2026-05-12 17:30:00+00'),
  ('30000000-0000-0000-0000-000000000059', '20000000-0000-0000-0000-000000000001', 'Countryside Land Lot near Kigali', 'Large land parcel with gentle slope and private access.', 'land', 'sale', 540000000, 'RWF', NULL, NULL, 980, NULL, 'Kigali', 'Kabeza', 'Plot 67, Country Road', -1.9915, 30.1101, ARRAY['https://example.test/images/land9-1.jpg'], NULL, ARRAY['private access','road access'], NULL, 'approved', false, 121, '2026-05-12 17:40:00+00', '2026-05-12 17:40:00+00'),
  ('30000000-0000-0000-0000-000000000060', '20000000-0000-0000-0000-000000000001', 'Three-Bedroom House in Kiyovu', 'Walled property with central living room and dedicated laundry area.', 'house', 'sale', 1320000000, 'RWF', 3, 3, 200, 195, 'Kigali', 'Kiyovu', 'House 25, Elm Street', -1.9473, 30.0596, ARRAY['https://example.test/images/house16-1.jpg'], NULL, ARRAY['laundry','garden','security'], NULL, 'approved', false, 241, '2026-05-12 17:50:00+00', '2026-05-12 17:50:00+00'),
  ('30000000-0000-0000-0000-000000000061', '20000000-0000-0000-0000-000000000002', 'Budget 1-Bedroom Apartment in Kiyovu', 'Affordable modern apartment near local markets and transport.', 'apartment', 'rent', 1950000, 'RWF', 1, 1, 44, 44, 'Kigali', 'Kiyovu', 'Apt 21, Sunrise Residence', -1.9476, 30.0593, ARRAY['https://example.test/images/apt61-1.jpg'], NULL, ARRAY['wifi','security','laundry'], 'furnished', 'approved', false, 145, '2026-05-12 18:00:00+00', '2026-05-12 18:00:00+00'),
  ('30000000-0000-0000-0000-000000000062', '20000000-0000-0000-0000-000000000003', 'Three-Bedroom House with Private Courtyard', 'Quiet home in Rebero with a private court and spacious kitchen.', 'house', 'sale', 1390000000, 'RWF', 3, 3, 205, 200, 'Kigali', 'Rebero', 'House 29, Cedar Close', -1.9492, 30.0441, ARRAY['https://example.test/images/house17-1.jpg'], NULL, ARRAY['courtyard','parking','storage'], NULL, 'approved', false, 218, '2026-05-12 18:10:00+00', '2026-05-12 18:10:00+00'),
  ('30000000-0000-0000-0000-000000000063', '20000000-0000-0000-0000-000000000004', 'Kacyiru Office Space with Reception', 'Bright reception-ready office close to major embassy roads.', 'commercial', 'rent', 7100000, 'RWF', NULL, 2, 155, 155, 'Kigali', 'Kacyiru', 'Office 9, Embassy Square', -1.9333, 30.0738, ARRAY['https://example.test/images/commercial15-1.jpg'], NULL, ARRAY['reception','parking','security'], NULL, 'approved', false, 153, '2026-05-12 18:20:00+00', '2026-05-12 18:20:00+00'),
  ('30000000-0000-0000-0000-000000000064', '20000000-0000-0000-0000-000000000005', 'Residential Land Plot in Kabeza', 'Quiet land parcel suited for a low-rise family home.', 'land', 'sale', 620000000, 'RWF', NULL, NULL, 1020, NULL, 'Kigali', 'Kabeza', 'Plot 82, Greenfield', -1.9917, 30.1100, ARRAY['https://example.test/images/land10-1.jpg'], NULL, ARRAY['road access','near utilities'], NULL, 'approved', false, 99, '2026-05-12 18:30:00+00', '2026-05-12 18:30:00+00'),
  ('30000000-0000-0000-0000-000000000065', '20000000-0000-0000-0000-000000000006', 'Rebero 2-Bedroom Apartment with Pool', 'Community apartment with easy access to the local shopping area.', 'apartment', 'rent', 2650000, 'RWF', 2, 1, 96, 96, 'Kigali', 'Rebero', 'Unit 17, Waterfall Gardens', -1.9494, 30.0436, ARRAY['https://example.test/images/apt65-1.jpg'], NULL, ARRAY['pool','security','parking'], 'furnished', 'approved', false, 183, '2026-05-12 18:40:00+00', '2026-05-12 18:40:00+00'),
  ('30000000-0000-0000-0000-000000000066', '20000000-0000-0000-0000-000000000007', 'Kimihurura Family Home with Garage', 'Comfortable family house with garage and landscaped yard.', 'house', 'sale', 1490000000, 'RWF', 4, 3, 225, 220, 'Kigali', 'Kimihurura', 'House 52, Garden Street', -1.9439, 30.0848, ARRAY['https://example.test/images/house18-1.jpg'], NULL, ARRAY['garage','garden','security'], NULL, 'approved', true, 298, '2026-05-12 18:50:00+00', '2026-05-12 18:50:00+00'),
  ('30000000-0000-0000-0000-000000000067', '20000000-0000-0000-0000-000000000008', 'Nyarutarama Executive Office Suite', 'Flexible executive suite within a premium business complex.', 'commercial', 'rent', 10200000, 'RWF', NULL, 3, 225, 225, 'Kigali', 'Nyarutarama', 'Suite 22, Executive Plaza', -1.9511, 30.0747, ARRAY['https://example.test/images/commercial16-1.jpg'], NULL, ARRAY['elevator','parking','security'], NULL, 'approved', false, 175, '2026-05-12 19:00:00+00', '2026-05-12 19:00:00+00'),
  ('30000000-0000-0000-0000-000000000068', '20000000-0000-0000-0000-000000000006', 'Kibagabaga Residential Plot for Sale', 'Private plot in a growing residential neighborhood.', 'land', 'sale', 760000000, 'RWF', NULL, NULL, 1400, NULL, 'Kigali', 'Kibagabaga', 'Plot 96, Sunrise Ridge', -1.9313, 30.0990, ARRAY['https://example.test/images/land11-1.jpg'], NULL, ARRAY['road access','near utilities'], NULL, 'approved', false, 110, '2026-05-12 19:10:00+00', '2026-05-12 19:10:00+00'),
  ('30000000-0000-0000-0000-000000000069', '20000000-0000-0000-0000-000000000007', 'New 1-Bedroom Apartment in Kiyovu', 'Single-room apartment with smart design and secure building features.', 'apartment', 'rent', 2050000, 'RWF', 1, 1, 46, 46, 'Kigali', 'Kiyovu', 'Apt 27, City View', -1.9477, 30.0592, ARRAY['https://example.test/images/apt69-1.jpg'], NULL, ARRAY['security','wifi','laundry'], 'furnished', 'approved', false, 149, '2026-05-12 19:20:00+00', '2026-05-12 19:20:00+00'),
  ('30000000-0000-0000-0000-000000000070', '20000000-0000-0000-0000-000000000009', 'Kacyiru House with Private Study', 'Well-presented house with separate study and visitor parking.', 'house', 'sale', 1550000000, 'RWF', 3, 3, 225, 220, 'Kigali', 'Kacyiru', 'House 19, Embassy Residences', -1.9337, 30.0736, ARRAY['https://example.test/images/house19-1.jpg'], NULL, ARRAY['study','parking','security'], NULL, 'approved', false, 256, '2026-05-12 19:30:00+00', '2026-05-12 19:30:00+00'),
  ('30000000-0000-0000-0000-000000000071', '20000000-0000-0000-0000-000000000010', 'Kiyovu Office Unit with Storage', 'Compact office unit with dedicated storage space and bike parking.', 'commercial', 'rent', 4200000, 'RWF', NULL, 1, 88, 88, 'Kigali', 'Kiyovu', 'Office 4, Midtown', -1.9474, 30.0594, ARRAY['https://example.test/images/commercial17-1.jpg'], NULL, ARRAY['storage','security','parking'], NULL, 'approved', false, 132, '2026-05-12 19:40:00+00', '2026-05-12 19:40:00+00'),
  ('30000000-0000-0000-0000-000000000072', '20000000-0000-0000-0000-000000000010', 'Airport-Accessible Land Plot in Kanombe', 'Well-positioned land near airport support facilities.', 'land', 'sale', 810000000, 'RWF', NULL, NULL, 1650, NULL, 'Kigali', 'Kanombe', 'Plot 101, Aviation Road', -1.9712, 30.2232, ARRAY['https://example.test/images/land12-1.jpg'], NULL, ARRAY['airport access','road access'], NULL, 'approved', false, 118, '2026-05-12 19:50:00+00', '2026-05-12 19:50:00+00'),
  ('30000000-0000-0000-0000-000000000073', '20000000-0000-0000-0000-000000000005', 'Luxury Studio Apartment in Nyarutarama', 'Premium studio apartment with designer finishes.', 'apartment', 'rent', 2250000, 'RWF', 1, 1, 46, 46, 'Kigali', 'Nyarutarama', 'Studio 10, Lakefront Residences', -1.9514, 30.0748, ARRAY['https://example.test/images/apt73-1.jpg'], NULL, ARRAY['security','wifi','lake view'], 'furnished', 'approved', false, 162, '2026-05-12 20:00:00+00', '2026-05-12 20:00:00+00'),
  ('30000000-0000-0000-0000-000000000074', '20000000-0000-0000-0000-000000000007', 'Spacious 4-Bedroom Home in Gacuriro', 'Large family home with separate lounge and secure compound.', 'house', 'sale', 1680000000, 'RWF', 4, 3, 245, 240, 'Kigali', 'Gacuriro', 'House 18, Garden Estates', -1.9463, 30.0817, ARRAY['https://example.test/images/house20-1.jpg'], NULL, ARRAY['security','parking','garden'], NULL, 'approved', false, 276, '2026-05-12 20:10:00+00', '2026-05-12 20:10:00+00'),
  ('30000000-0000-0000-0000-000000000075', '20000000-0000-0000-0000-000000000001', 'Kimihurura Retail Unit with High Footfall', 'Ground-floor retail unit inside a growing residential district.', 'commercial', 'rent', 3900000, 'RWF', NULL, 1, 95, 95, 'Kigali', 'Kimihurura', 'Shop 11, Market Avenue', -1.9431, 30.0847, ARRAY['https://example.test/images/commercial18-1.jpg'], NULL, ARRAY['shopfront','security','parking'], NULL, 'pending', false, 129, '2026-05-12 20:20:00+00', '2026-05-12 20:20:00+00'),
  ('30000000-0000-0000-0000-000000000076', '20000000-0000-0000-0000-000000000004', 'Rebero Land Parcel with Quiet Street', 'Compact plot ideal for a four-bedroom home or duplex.', 'land', 'sale', 650000000, 'RWF', NULL, NULL, 880, NULL, 'Kigali', 'Rebero', 'Plot 28, Quiet Court', -1.9491, 30.0433, ARRAY['https://example.test/images/land13-1.jpg'], NULL, ARRAY['quiet street','road access'], NULL, 'approved', false, 104, '2026-05-12 20:30:00+00', '2026-05-12 20:30:00+00'),
  ('30000000-0000-0000-0000-000000000077', '20000000-0000-0000-0000-000000000002', 'Kimihurura Designer 2-Bedroom Apartment', 'Stylish apartment with a large balcony and modern finishes.', 'apartment', 'sale', 1020000000, 'RWF', 2, 2, 110, 110, 'Kigali', 'Kimihurura', 'Apt 32, Designer Residences', -1.9433, 30.0853, ARRAY['https://example.test/images/apt77-1.jpg'], NULL, ARRAY['balcony','gym','security'], 'furnished', 'approved', true, 291, '2026-05-12 20:40:00+00', '2026-05-12 20:40:00+00'),
  ('30000000-0000-0000-0000-000000000078', '20000000-0000-0000-0000-000000000009', 'Kabeza Family House with Garden', 'Well-appointed home with landscaped garden and secure wall.', 'house', 'sale', 1520000000, 'RWF', 3, 3, 218, 215, 'Kigali', 'Kabeza', 'House 26, Orchard Way', -1.9919, 30.1097, ARRAY['https://example.test/images/house21-1.jpg'], NULL, ARRAY['garden','parking','security'], NULL, 'approved', false, 231, '2026-05-12 20:50:00+00', '2026-05-12 20:50:00+00'),
  ('30000000-0000-0000-0000-000000000079', '20000000-0000-0000-0000-000000000009', 'Kinyinya Retail Unit near Transit', 'Street-facing shop unit suitable for retail or service business.', 'commercial', 'rent', 3300000, 'RWF', NULL, 1, 88, 88, 'Kigali', 'Kinyinya', 'Shop 8, Transit Mall', -1.9352, 30.1140, ARRAY['https://example.test/images/commercial19-1.jpg'], NULL, ARRAY['shopfront','security','parking'], NULL, 'approved', false, 117, '2026-05-12 21:00:00+00', '2026-05-12 21:00:00+00'),
  ('30000000-0000-0000-0000-000000000080', '20000000-0000-0000-0000-000000000010', 'Kacyiru Land Parcel with Road Frontage', 'Excellent land for residential investment close to schools and shops.', 'land', 'sale', 770000000, 'RWF', NULL, NULL, 1275, NULL, 'Kigali', 'Kacyiru', 'Plot 74, Road Front', -1.9334, 30.0739, ARRAY['https://example.test/images/land14-1.jpg'], NULL, ARRAY['road frontage','utilities nearby'], NULL, 'approved', false, 111, '2026-05-12 21:10:00+00', '2026-05-12 21:10:00+00');

-- -----------------------------------------------------------------------------
-- Inquiries
-- -----------------------------------------------------------------------------
INSERT INTO public.inquiries (id, property_id, agent_id, user_id, buyer_name, buyer_email, buyer_phone, message, property_title, status, responded_at, email_notification_sent, notification_sent_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, p.agent_id, u.id, u.full_name, u.email, u.phone,
  CASE WHEN random() < 0.5 THEN 'I would like to schedule a viewing for this listing.' ELSE 'Can you confirm whether the price is negotiable and when it is available?' END,
  p.title,
  CASE WHEN random() < 0.6 THEN 'pending' ELSE 'responded' END,
  CASE WHEN random() < 0.6 THEN now() - (floor(random() * 12) || ' days')::interval ELSE NULL END,
  random() < 0.9,
  CASE WHEN random() < 0.9 THEN now() - (floor(random() * 12) || ' days')::interval ELSE NULL END,
  now() - (floor(random() * 28) || ' days')::interval,
  now()
FROM generate_series(1,40) s
CROSS JOIN LATERAL (
  SELECT id, agent_id, title FROM public.properties ORDER BY random() LIMIT 1
) p
CROSS JOIN LATERAL (
  SELECT id, full_name, email, phone FROM public.users WHERE id NOT IN (
    SELECT user_id FROM public.agents WHERE id = p.agent_id
  ) ORDER BY random() LIMIT 1
) u;

-- -----------------------------------------------------------------------------
-- Property reviews
-- -----------------------------------------------------------------------------
INSERT INTO public.property_reviews (id, property_id, user_id, user_name, user_avatar, rating, review_text, photos, helpful_count, not_helpful_count, created_at, updated_at)
SELECT gen_random_uuid(), p.id, u.id, u.full_name, NULL,
  (floor(random() * 5) + 1)::int,
  CASE ((floor(random() * 5) + 1)::int)
    WHEN 1 THEN 'The location was convenient, but the apartment needed a few maintenance fixes.'
    WHEN 2 THEN 'Good value for money and the building felt secure.'
    WHEN 3 THEN 'Nice property with great light and a well-maintained lobby.'
    WHEN 4 THEN 'Experienced responsive management and a clean unit.'
    ELSE 'Excellent home; the view was great and the neighborhood felt safe.'
  END,
  ARRAY[]::text[],
  (floor(random() * 10))::int,
  (floor(random() * 4))::int,
  now() - (floor(random() * 45) || ' days')::interval,
  now() - (floor(random() * 10) || ' days')::interval
FROM generate_series(1,50) s
CROSS JOIN LATERAL (
  SELECT id, agent_id FROM public.properties ORDER BY random() LIMIT 1
) p
CROSS JOIN LATERAL (
  SELECT id, full_name FROM public.users WHERE id NOT IN (
    SELECT user_id FROM public.agents WHERE id = p.agent_id
  ) ORDER BY random() LIMIT 1
) u
ON CONFLICT (property_id, user_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Agent reviews
-- -----------------------------------------------------------------------------
INSERT INTO public.agent_reviews (id, agent_id, reviewer_id, reviewer_name, reviewer_avatar, rating, review_text, helpful_count, not_helpful_count, created_at, updated_at)
SELECT gen_random_uuid(), a.id, u.id, u.full_name, NULL,
  (floor(random() * 5) + 1)::int,
  CASE ((floor(random() * 5) + 1)::int)
    WHEN 1 THEN 'The agent was polite but slower than expected to respond.'
    WHEN 2 THEN 'Good support overall, although paperwork took a little longer than planned.'
    WHEN 3 THEN 'Helpful agent who guided us through the neighborhood options.'
    WHEN 4 THEN 'Great communication and they helped negotiate the final price.'
    ELSE 'Excellent service from start to finish, highly recommended.'
  END,
  (floor(random() * 6))::int,
  (floor(random() * 3))::int,
  now() - (floor(random() * 50) || ' days')::interval,
  now() - (floor(random() * 10) || ' days')::interval
FROM generate_series(1,30) s
CROSS JOIN LATERAL (
  SELECT id, user_id FROM public.agents ORDER BY random() LIMIT 1
) a
CROSS JOIN LATERAL (
  SELECT id, full_name FROM public.users WHERE id <> a.user_id ORDER BY random() LIMIT 1
) u
ON CONFLICT (agent_id, reviewer_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Review votes
-- -----------------------------------------------------------------------------
INSERT INTO public.review_votes (id, review_id, user_id, vote_type, created_at)
SELECT gen_random_uuid(), pr.id, u.id,
  (array['helpful','not_helpful'])[1 + floor(random() * 2)::int],
  now() - (floor(random() * 30) || ' days')::interval
FROM generate_series(1,80) s
CROSS JOIN LATERAL (
  SELECT id, user_id FROM public.property_reviews ORDER BY random() LIMIT 1
) pr
CROSS JOIN LATERAL (
  SELECT id FROM public.users WHERE id <> pr.user_id ORDER BY random() LIMIT 1
) u
ON CONFLICT (review_id, user_id) DO NOTHING;

INSERT INTO public.agent_review_votes (id, review_id, user_id, vote_type, created_at)
SELECT gen_random_uuid(), ar.id, u.id,
  (array['helpful','not_helpful'])[1 + floor(random() * 2)::int],
  now() - (floor(random() * 30) || ' days')::interval
FROM generate_series(1,50) s
CROSS JOIN LATERAL (
  SELECT id, reviewer_id FROM public.agent_reviews ORDER BY random() LIMIT 1
) ar
CROSS JOIN LATERAL (
  SELECT id FROM public.users WHERE id <> ar.reviewer_id ORDER BY random() LIMIT 1
) u
ON CONFLICT (review_id, user_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Favorites
-- -----------------------------------------------------------------------------
INSERT INTO public.favorites (id, user_id, property_id, created_at)
SELECT gen_random_uuid(), u.id, p.id, now() - (floor(random() * 30) || ' days')::interval
FROM generate_series(1,100) s
CROSS JOIN LATERAL (SELECT id FROM public.users ORDER BY random() LIMIT 1) u
CROSS JOIN LATERAL (SELECT id FROM public.properties ORDER BY random() LIMIT 1) p
ON CONFLICT (user_id, property_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Messages
-- -----------------------------------------------------------------------------
INSERT INTO public.messages (id, sender_id, receiver_id, property_id, content, is_read, created_at)
SELECT gen_random_uuid(), sender.id, r.id,
  CASE WHEN random() < 0.6 THEN p.id ELSE NULL END,
  CASE floor(random() * 5)
    WHEN 0 THEN 'Hi, do you have more photos of this property?'
    WHEN 1 THEN 'Hello, I am interested in scheduling a visit this week.'
    WHEN 2 THEN 'Can you share the full price breakdown and service charges?'
    WHEN 3 THEN 'Is this property still available for immediate move-in?'
    ELSE 'Thank you, I would like to discuss the lease terms.'
  END,
  random() < 0.6,
  now() - (floor(random() * 21) || ' days')::interval
FROM generate_series(1,50) s
CROSS JOIN LATERAL (SELECT id FROM public.users ORDER BY random() LIMIT 1) sender
CROSS JOIN LATERAL (SELECT id FROM public.users WHERE id <> sender.id ORDER BY random() LIMIT 1) r
CROSS JOIN LATERAL (SELECT id FROM public.properties ORDER BY random() LIMIT 1) p;

-- -----------------------------------------------------------------------------
-- Notification preferences
-- -----------------------------------------------------------------------------
INSERT INTO public.notification_preferences (id, user_id, email, new_property_match, inquiry_response, price_drop, favorite_status_change, weekly_digest, marketing_emails, created_at, updated_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'alice.muhire@example.test', true, true, true, true, false, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'benjamin.iraboneza@example.test', true, true, true, true, true, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'carol.nshimiyimana@example.test', true, true, true, false, false, true, now(), now()),
  ('b0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'daniel.mutoni@example.test', true, true, false, true, false, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'edith.nyiramana@example.test', true, true, true, true, true, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'fidele.kamanzi@example.test', true, false, true, false, false, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'gloria.ishimwe@example.test', true, true, true, true, false, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'herve.karangwa@example.test', true, true, false, true, false, true, now(), now()),
  ('b0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'ingrid.mukamana@example.test', true, true, true, true, true, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', 'jean.patrice@example.test', true, true, true, true, false, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 'karen.niyonsenga@example.test', true, true, true, true, false, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', 'louis.seraphin@example.test', true, true, true, true, false, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', 'marie.chantal@example.test', true, true, true, true, false, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000014', 'nathan.uzumaki@example.test', true, true, true, true, true, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000015', 'olivia.ineza@example.test', true, true, false, true, false, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000016', 'paul.bazirake@example.test', true, true, true, true, false, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000017', 'rachel.umutesi@example.test', true, true, true, false, false, true, now(), now()),
  ('b0000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000018', 'samuel.murangwa@example.test', true, true, true, true, true, false, now(), now()),
  ('b0000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000019', 'tracy.karimunda@example.test', true, true, true, true, false, false, now(), now());

-- -----------------------------------------------------------------------------
-- Saved searches
-- -----------------------------------------------------------------------------
INSERT INTO public.saved_searches (id, user_id, name, filters, is_active, last_matched_at, match_count, created_at, updated_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Kimihurura rentals under 3M', '{"query":"Kimihurura","property_type":"apartment","listing_type":"rent","max_price":3000000}', true, '2026-05-14 09:00:00+00', 4, '2026-05-14 09:00:00+00', '2026-05-14 09:00:00+00'),
  ('c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Family homes in Kacyiru', '{"query":"Kacyiru","property_type":"house","listing_type":"sale","min_bedrooms":3}', true, '2026-05-15 10:00:00+00', 3, '2026-05-15 10:00:00+00', '2026-05-15 10:00:00+00'),
  ('c0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Land near airport', '{"query":"Kanombe","property_type":"land","listing_type":"sale"}', true, '2026-05-15 10:30:00+00', 2, '2026-05-15 10:30:00+00', '2026-05-15 10:30:00+00'),
  ('c0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Gacuriro apartments with parking', '{"query":"Gacuriro","property_type":"apartment","listing_type":"rent","amenities":["parking"]}', true, '2026-05-15 11:00:00+00', 5, '2026-05-15 11:00:00+00', '2026-05-15 11:00:00+00'),
  ('c0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Nyarutarama premium sale', '{"query":"Nyarutarama","property_type":"house","listing_type":"sale","min_price":1500000000}', true, '2026-05-16 08:30:00+00', 7, '2026-05-16 08:30:00+00', '2026-05-16 08:30:00+00'),
  ('c0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Commercial Kanombe', '{"query":"Kanombe","property_type":"commercial","listing_type":"rent"}', true, '2026-05-16 09:30:00+00', 1, '2026-05-16 09:30:00+00', '2026-05-16 09:30:00+00'),
  ('c0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Affordable land outside Kigali', '{"query":"Kabeza","property_type":"land","listing_type":"sale","max_price":800000000}', true, '2026-05-16 10:00:00+00', 2, '2026-05-16 10:00:00+00', '2026-05-16 10:00:00+00'),
  ('c0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'Kiyovu one-bedroom rentals', '{"query":"Kiyovu","property_type":"apartment","listing_type":"rent","max_price":2200000}', true, '2026-05-16 11:00:00+00', 3, '2026-05-16 11:00:00+00', '2026-05-16 11:00:00+00'),
  ('c0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'Pending listings in Gacuriro', '{"query":"Gacuriro","status":"pending"}', true, '2026-05-16 11:15:00+00', 1, '2026-05-16 11:15:00+00', '2026-05-16 11:15:00+00'),
  ('c0000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000010', 'Top apartments in Kimihurura', '{"query":"Kimihurura","property_type":"apartment","listing_type":"sale","min_price":800000000}', true, '2026-05-16 11:45:00+00', 6, '2026-05-16 11:45:00+00', '2026-05-16 11:45:00+00'),
  ('c0000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000011', 'Budget rentals in remaining Kigali', '{"listing_type":"rent","max_price":2500000}', true, '2026-05-17 08:00:00+00', 8, '2026-05-17 08:00:00+00', '2026-05-17 08:00:00+00'),
  ('c0000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000012', 'Kacyiru commercial spaces', '{"query":"Kacyiru","property_type":"commercial","listing_type":"sale"}', true, '2026-05-17 08:30:00+00', 3, '2026-05-17 08:30:00+00', '2026-05-17 08:30:00+00'),
  ('c0000000-0000-0000-0000-00000000000d', '10000000-0000-0000-0000-000000000013', 'Small family homes in Kabeza', '{"query":"Kabeza","property_type":"house","listing_type":"sale","min_bedrooms":3}', true, '2026-05-17 09:00:00+00', 2, '2026-05-17 09:00:00+00', '2026-05-17 09:00:00+00'),
  ('c0000000-0000-0000-0000-00000000000e', '10000000-0000-0000-0000-000000000014', 'High-value land near Nyarutarama', '{"query":"Nyarutarama","property_type":"land","listing_type":"sale","min_price":1500000000}', true, '2026-05-17 09:30:00+00', 1, '2026-05-17 09:30:00+00', '2026-05-17 09:30:00+00'),
  ('c0000000-0000-0000-0000-00000000000f', '10000000-0000-0000-0000-000000000015', 'Commercial retail near city center', '{"query":"Gacuriro","property_type":"commercial","listing_type":"rent"}', true, '2026-05-17 10:00:00+00', 4, '2026-05-17 10:00:00+00', '2026-05-17 10:00:00+00'),
  ('c0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', 'Agent favorite search: apartments 3BR', '{"property_type":"apartment","bedrooms":3,"listing_type":"sale"}', true, '2026-05-17 10:30:00+00', 5, '2026-05-17 10:30:00+00', '2026-05-17 10:30:00+00'),
  ('c0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 'Rentals near embassies', '{"query":"Kacyiru","property_type":"apartment","listing_type":"rent"}', true, '2026-05-17 11:00:00+00', 4, '2026-05-17 11:00:00+00', '2026-05-17 11:00:00+00'),
  ('c0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', 'Kigali buyer search', '{"query":"Kigali","listing_type":"sale","min_price":600000000}', true, '2026-05-17 11:30:00+00', 9, '2026-05-17 11:30:00+00', '2026-05-17 11:30:00+00'),
  ('c0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', 'House with garden', '{"property_type":"house","amenities":["garden"],"listing_type":"sale"}', true, '2026-05-17 12:00:00+00', 7, '2026-05-17 12:00:00+00', '2026-05-17 12:00:00+00'),
  ('c0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000014', 'Land for development', '{"property_type":"land","listing_type":"sale","min_area_sqm":800}', true, '2026-05-17 12:30:00+00', 2, '2026-05-17 12:30:00+00', '2026-05-17 12:30:00+00'),
  ('c0000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000015', 'Apartment with balcony', '{"property_type":"apartment","amenities":["balcony"],"listing_type":"rent"}', true, '2026-05-17 13:00:00+00', 5, '2026-05-17 13:00:00+00', '2026-05-17 13:00:00+00'),
  ('c0000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000016', 'Lakefront homes', '{"query":"Nyarutarama","property_type":"house","listing_type":"sale","min_price":1800000000}', true, '2026-05-17 13:30:00+00', 3, '2026-05-17 13:30:00+00', '2026-05-17 13:30:00+00'),
  ('c0000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000017', 'Starter apartments in central Kigali', '{"listing_type":"rent","max_price":2800000}', true, '2026-05-17 14:00:00+00', 6, '2026-05-17 14:00:00+00', '2026-05-17 14:00:00+00'),
  ('c0000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000018', 'Commercial listings for investors', '{"property_type":"commercial","listing_type":"sale"}', true, '2026-05-17 14:30:00+00', 5, '2026-05-17 14:30:00+00', '2026-05-17 14:30:00+00'),
  ('c0000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000019', 'Rentals near schools', '{"listing_type":"rent","min_bedrooms":2}', true, '2026-05-17 15:00:00+00', 8, '2026-05-17 15:00:00+00', '2026-05-17 15:00:00+00'),
  ('c0000000-0000-0000-0000-00000000001a', '10000000-0000-0000-0000-000000000016', 'Affordable apartments in Kigali', '{"query":"Kigali","property_type":"apartment","listing_type":"sale","max_price":950000000}', true, '2026-05-17 15:30:00+00', 10, '2026-05-17 15:30:00+00', '2026-05-17 15:30:00+00'),
  ('c0000000-0000-0000-0000-00000000001b', '10000000-0000-0000-0000-000000000017', 'Luxury rentals with firmware', '{"listing_type":"rent","min_bedrooms":3,"amenities":["pool"]}', true, '2026-05-17 16:00:00+00', 3, '2026-05-17 16:00:00+00', '2026-05-17 16:00:00+00'),
  ('c0000000-0000-0000-0000-00000000001c', '10000000-0000-0000-0000-000000000018', 'Mixed-use properties in Nyarutarama', '{"query":"Nyarutarama","property_type":"commercial","listing_type":"sale"}', true, '2026-05-17 16:30:00+00', 2, '2026-05-17 16:30:00+00', '2026-05-17 16:30:00+00'),
  ('c0000000-0000-0000-0000-00000000001d', '10000000-0000-0000-0000-000000000019', 'New build houses under 1.5B', '{"property_type":"house","listing_type":"sale","max_price":1500000000}', true, '2026-05-17 17:00:00+00', 7, '2026-05-17 17:00:00+00', '2026-05-17 17:00:00+00'),
  ('c0000000-0000-0000-0000-00000000001e', '10000000-0000-0000-0000-000000000020', 'South Kigali studio search', '{"query":"Kiyovu","property_type":"apartment","listing_type":"rent","max_price":2000000}', true, '2026-05-17 17:30:00+00', 4, '2026-05-17 17:30:00+00', '2026-05-17 17:30:00+00'),
  ('c0000000-0000-0000-0000-00000000001f', '10000000-0000-0000-0000-000000000010', 'Prime land close to Kigali airport', '{"query":"Kanombe","property_type":"land","listing_type":"sale","min_area_sqm":700}', true, '2026-05-17 18:00:00+00', 2, '2026-05-17 18:00:00+00', '2026-05-17 18:00:00+00'),
  ('c0000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000020', 'High-end Kigali homes', '{"query":"Kigali","property_type":"house","listing_type":"sale","min_price":1500000000}', true, '2026-05-17 18:30:00+00', 6, '2026-05-17 18:30:00+00', '2026-05-17 18:30:00+00');

-- -----------------------------------------------------------------------------
-- User notifications
-- -----------------------------------------------------------------------------
INSERT INTO public.user_notifications (id, user_id, type, title, message, data, is_read, email_sent, created_at)
SELECT gen_random_uuid(), u.id,
  (array['new_property_match','inquiry_response','price_drop','favorite_status_change','system'])[1 + floor(random() * 5)::int],
  CASE floor(random() * 5)
    WHEN 0 THEN 'New property match in your area'
    WHEN 1 THEN 'Your inquiry received a reply'
    WHEN 2 THEN 'Price drop alert for a property you liked'
    WHEN 3 THEN 'Someone favorited a property you saved'
    ELSE 'System update from PropSpera'
  END,
  CASE floor(random() * 5)
    WHEN 0 THEN 'A new apartment listing matches your saved search.'
    WHEN 1 THEN 'The agent replied to your message. Check the conversation now.'
    WHEN 2 THEN 'A property you watched has a new price update.'
    WHEN 3 THEN 'A user favorited a property in your saved search area.'
    ELSE 'Your PropSpera account has a new status update.'
  END,
  jsonb_build_object('example', 'seed data'),
  random() < 0.5,
  random() < 0.5,
  now() - (floor(random() * 35) || ' days')::interval
FROM generate_series(1,100) s
CROSS JOIN LATERAL (SELECT id FROM public.users ORDER BY random() LIMIT 1) u;

-- -----------------------------------------------------------------------------
-- Admin notifications
-- -----------------------------------------------------------------------------
INSERT INTO public.admin_notifications (id, type, title, body, agent_id, is_read, read_at, read_by, created_at)
SELECT gen_random_uuid(),
  (array['agent_signup','property_submission','system'])[1 + floor(random() * 3)::int],
  CASE floor(random() * 3)
    WHEN 0 THEN 'New agent application received'
    WHEN 1 THEN 'New property submission awaiting review'
    ELSE 'System maintenance reminder'
  END,
  CASE floor(random() * 3)
    WHEN 0 THEN 'A new agent has signed up and is pending approval.'
    WHEN 1 THEN 'A property has been submitted and requires admin review.'
    ELSE 'Scheduled system maintenance is coming this weekend.'
  END,
  a.id,
  random() < 0.4,
  CASE WHEN random() < 0.4 THEN now() - (floor(random() * 10) || ' days')::interval ELSE NULL END,
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
  now() - (floor(random() * 40) || ' days')::interval
FROM generate_series(1,20) s
CROSS JOIN LATERAL (SELECT id FROM public.agents ORDER BY random() LIMIT 1) a;

-- -----------------------------------------------------------------------------
-- User activity log
-- -----------------------------------------------------------------------------
INSERT INTO public.user_activity_log (id, user_id, action, description, metadata, created_at)
SELECT gen_random_uuid(), u.id,
  (array['profile_viewed','profile_updated','avatar_updated','password_changed','account_connected'])[1 + floor(random() * 5)::int],
  CASE floor(random() * 5)
    WHEN 0 THEN 'Viewed account settings page.'
    WHEN 1 THEN 'Updated personal information.'
    WHEN 2 THEN 'Uploaded a new avatar image.'
    WHEN 3 THEN 'Changed password successfully.'
    ELSE 'Connected a new social account.'
  END,
  jsonb_build_object('source', 'seed'),
  now() - (floor(random() * 45) || ' days')::interval
FROM generate_series(1,40) s
CROSS JOIN LATERAL (SELECT id FROM public.users ORDER BY random() LIMIT 1) u;

-- -----------------------------------------------------------------------------
-- Connected accounts
-- -----------------------------------------------------------------------------
INSERT INTO public.connected_accounts (id, user_id, provider, provider_email, connected_at)
VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'google', 'alice.muhire@example.test', '2026-05-20 08:00:00+00'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'facebook', 'benjamin.iraboneza@example.test', '2026-05-20 08:30:00+00'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'google', 'carol.nshimiyimana@example.test', '2026-05-20 09:00:00+00'),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'google', 'daniel.mutoni@example.test', '2026-05-20 09:30:00+00'),
  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'facebook', 'edith.nyiramana@example.test', '2026-05-20 10:00:00+00'),
  ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'google', 'fidele.kamanzi@example.test', '2026-05-20 10:30:00+00'),
  ('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'google', 'gloria.ishimwe@example.test', '2026-05-20 11:00:00+00'),
  ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'facebook', 'herve.karangwa@example.test', '2026-05-20 11:30:00+00'),
  ('30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'google', 'ingrid.mukamana@example.test', '2026-05-20 12:00:00+00'),
  ('30000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000010', 'facebook', 'jean.patrice@example.test', '2026-05-20 12:30:00+00');

-- -----------------------------------------------------------------------------
-- WhatsApp clicks
-- -----------------------------------------------------------------------------
INSERT INTO public.whatsapp_clicks (id, property_id, property_title, agent_id, clicked_at, user_identifier, source)
SELECT gen_random_uuid(), p.id::text, p.title, p.agent_id::text,
  now() - ((floor(random() * 30) || ' days')::interval + (floor(random() * 86400) || ' seconds')::interval),
  concat('visitor-', floor(random() * 9000 + 1000)::int, '@example.test'),
  CASE WHEN random() < 0.85 THEN 'web' ELSE 'mobile' END
FROM generate_series(1,1000) s
CROSS JOIN LATERAL (SELECT id, title, agent_id FROM public.properties ORDER BY random() LIMIT 1) p;
