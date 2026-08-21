#!/usr/bin/env node
/**
 * 🚀 DVT Tabu Game - Yeni Sürüm Ekleme Scripti
 * Kullanım:
 *   node scripts/create-version.js v1.1.0 "Büyük Güncelleme" --feat "Yeni sesler eklendi" --fix "Sayaç hatası düzeltildi"
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zdqxwpfclptemocackde.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addVersion() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Kullanım: node scripts/create-version.js <sürüm> <başlık> [değişiklikler]');
    console.log('Örnek: node scripts/create-version.js v1.1.0 "Karanlık Mod ve Yeni Kartlar"');
    process.exit(1);
  }

  const version = args[0];
  const title = args[1];
  const changes = [
    { type: 'feat', text: `${title} yayına alındı.` },
    { type: 'perf', text: 'Genel performans ve arayüz iyileştirmeleri yapıldı.' }
  ];

  console.log(`Yeni sürüm Supabase veritabanına ekleniyor: ${version} - ${title}...`);

  const { data, error } = await supabase
    .from('app_versions')
    .insert([{ version, title, changes, is_mandatory: false }])
    .select();

  if (error) {
    console.error('Hata:', error.message);
  } else {
    console.log('✅ Sürüm başarıyla kaydedildi!', data[0]);
  }
}

addVersion();
