/**
 * Image Migration Script
 * Downloads all property images and user avatars from the old platform CDN
 * (abeovnrfxcwjaldpfmxr.databasepad.com) and re-uploads them to your new
 * Supabase Storage, then updates the database URLs.
 *
 * Usage:
 *   node scripts/migrate-images.mjs <SERVICE_ROLE_KEY>
 *
 * Get your service role key from:
 *   Supabase Dashboard → Project Settings → API → service_role (secret)
 */

import { createClient } from '@supabase/supabase-js';

const NEW_SUPABASE_URL = 'https://zjoujkpxfbpxsinqcicb.supabase.co';
const OLD_CDN_HOST = 'abeovnrfxcwjaldpfmxr.databasepad.com';
const STORAGE_BUCKET = 'property-images';

const SERVICE_ROLE_KEY = process.argv[2];

if (!SERVICE_ROLE_KEY) {
  console.error('❌  Usage: node scripts/migrate-images.mjs <SERVICE_ROLE_KEY>');
  console.error('   Get it from: Supabase Dashboard → Project Settings → API → service_role');
  process.exit(1);
}

const supabase = createClient(NEW_SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function isOldUrl(url) {
  return typeof url === 'string' && url.includes(OLD_CDN_HOST);
}

/** Download image bytes from any public URL */
async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const buffer = await response.arrayBuffer();
  return { bytes: new Uint8Array(buffer), contentType: response.headers.get('content-type') || 'image/jpeg' };
}

/** Upload bytes to Supabase Storage and return the public URL */
async function uploadToStorage(bytes, contentType, storagePath) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, bytes, { contentType, upsert: true });

  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Extract a clean storage path from an old URL so we can keep the same
 * folder structure (agent-id/filename) in the new bucket.
 * Old URL format: .../public/property-images/<agent-id>/<filename>
 */
function oldUrlToStoragePath(oldUrl) {
  const marker = `/public/${STORAGE_BUCKET}/`;
  const idx = oldUrl.indexOf(marker);
  if (idx === -1) {
    // Fallback: use just the filename with a timestamp prefix to avoid collisions
    const filename = oldUrl.split('/').pop() || `migrated-${Date.now()}`;
    return `migrated/${filename}`;
  }
  return oldUrl.slice(idx + marker.length);
}

// ── Migration: Properties ────────────────────────────────────────────────────

async function migrateProperties() {
  console.log('\n📦  Fetching properties with old CDN images...');
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title, images')
    .filter('images', 'cs', `["https://${OLD_CDN_HOST}`);

  if (error) {
    // cs (contains) filter may not work for all setups; fall back to fetching all
    console.warn('  ⚠️  Filter failed, fetching all properties instead:', error.message);
  }

  // If filter failed or returned nothing, fetch all and filter in JS
  const rows = (properties && properties.length > 0)
    ? properties
    : await supabase.from('properties').select('id, title, images').then(r => r.data || []);

  const affected = rows.filter(p => Array.isArray(p.images) && p.images.some(isOldUrl));
  console.log(`  Found ${affected.length} properties with old images (${rows.length} total)\n`);

  let totalImages = 0;
  let migratedImages = 0;
  let failedImages = 0;

  for (const property of affected) {
    console.log(`  🏠  "${property.title}" (${property.id})`);
    const newImages = [];

    for (const imgUrl of property.images) {
      totalImages++;
      if (!isOldUrl(imgUrl)) {
        newImages.push(imgUrl); // already on new CDN, keep as-is
        continue;
      }

      const storagePath = oldUrlToStoragePath(imgUrl);
      try {
        const { bytes, contentType } = await downloadImage(imgUrl);
        const newUrl = await uploadToStorage(bytes, contentType, storagePath);
        newImages.push(newUrl);
        migratedImages++;
        process.stdout.write('    ✅  ' + storagePath.split('/').pop() + '\n');
      } catch (err) {
        console.error('    ❌  Failed:', imgUrl, '-', err.message);
        newImages.push(imgUrl); // keep old URL so the property isn't broken
        failedImages++;
      }
    }

    // Only update if at least one image changed
    const changed = newImages.some((u, i) => u !== property.images[i]);
    if (changed) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ images: newImages })
        .eq('id', property.id);

      if (updateError) {
        console.error(`    ❌  DB update failed for ${property.id}: ${updateError.message}`);
      } else {
        console.log(`    💾  DB updated\n`);
      }
    }
  }

  console.log(`\n  Properties summary: ${migratedImages} migrated, ${failedImages} failed out of ${totalImages} images`);
  return { migratedImages, failedImages };
}

// ── Migration: User Avatars ──────────────────────────────────────────────────

async function migrateUserAvatars() {
  console.log('\n👤  Fetching users with old CDN avatars...');
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .like('avatar_url', `%${OLD_CDN_HOST}%`);

  if (error) {
    console.error('  ❌  Could not fetch users:', error.message);
    return;
  }

  console.log(`  Found ${users.length} users with old avatars\n`);

  for (const user of users) {
    console.log(`  👤  ${user.full_name} (${user.id})`);
    const storagePath = `avatars/${user.id}/${Date.now()}.jpg`;

    try {
      const { bytes, contentType } = await downloadImage(user.avatar_url);
      const newUrl = await uploadToStorage(bytes, contentType, storagePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: newUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error(`    ❌  DB update failed: ${updateError.message}`);
      } else {
        console.log(`    ✅  Migrated → ${newUrl}\n`);
      }
    } catch (err) {
      console.error(`    ❌  Failed: ${err.message}\n`);
    }
  }
}

// ── Ensure storage bucket exists ─────────────────────────────────────────────

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === STORAGE_BUCKET);
  if (!exists) {
    console.log(`  Creating storage bucket "${STORAGE_BUCKET}"...`);
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
    if (error) throw new Error(`Could not create bucket: ${error.message}`);
  } else {
    console.log(`  ✅  Bucket "${STORAGE_BUCKET}" already exists`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀  PropSpera Image Migration');
  console.log(`    Old CDN: ${OLD_CDN_HOST}`);
  console.log(`    New Supabase: ${NEW_SUPABASE_URL}\n`);

  // Verify the service role key works
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  // Service role key won't return a user — that's expected. Check we can query instead.
  const { error: pingError } = await supabase.from('properties').select('id').limit(1);
  if (pingError) {
    console.error('❌  Cannot connect to Supabase. Check your service role key.');
    console.error('   ', pingError.message);
    process.exit(1);
  }
  console.log('✅  Connected to Supabase\n');

  await ensureBucket();
  await migrateProperties();
  await migrateUserAvatars();

  console.log('\n✅  Migration complete!');
}

main().catch(err => {
  console.error('\n💥  Unexpected error:', err.message);
  process.exit(1);
});
