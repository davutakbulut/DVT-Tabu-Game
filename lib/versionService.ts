/**
 * DVT Tabu Game - Version Control Service
 * Sürüm Takibi, Zorunlu/İsteğe Bağlı Güncelleme ve Changelog Yönetim Servisi
 */

export const CURRENT_CLIENT_VERSION = '1.1.0';
export const CURRENT_BUILD_NUMBER = 11;

export interface AppVersionInfo {
  version: string;
  build_number?: number;
  release_name: string;
  release_notes: string[];
  is_mandatory: boolean;
  min_supported_version?: string;
  download_url?: string;
  created_at: string;
}

export interface VersionCheckResult {
  hasUpdate: boolean;
  isMandatory: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string[];
  minSupportedVersion: string;
}

// Compare semantic versions (e.g., '1.2.0' > '1.1.0' -> 1)
export function compareSemver(v1: string, v2: string): number {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map((x) => parseInt(x, 10) || 0);
  const [maj1, min1, pat1] = parse(v1);
  const [maj2, min2, pat2] = parse(v2);

  if (maj1 !== maj2) return maj1 > maj2 ? 1 : -1;
  if (min1 !== min2) return min1 > min2 ? 1 : -1;
  if (pat1 !== pat2) return pat1 > pat2 ? 1 : -1;
  return 0;
}

class VersionControlService {
  private lastCheckTime = 0;
  private checkIntervalMs = 5 * 60 * 1000; // 5 dakikada bir kontrol
  private cachedResult: VersionCheckResult | null = null;

  /**
   * Sunucudan ve Supabase'den en son yayınlanan sürüm bilgisini çeker
   */
  async checkForUpdates(force = false): Promise<VersionCheckResult> {
    const now = Date.now();
    if (!force && this.cachedResult && now - this.lastCheckTime < this.checkIntervalMs) {
      return this.cachedResult;
    }

    try {
      const res = await fetch(`/api/versions?current=${CURRENT_CLIENT_VERSION}&t=${now}`, {
        cache: 'no-store',
      });

      if (!res.ok) throw new Error('Sürüm kontrol sunucusuna ulaşılamadı');

      const data = await res.json();
      const latest: AppVersionInfo = data.latest || {
        version: CURRENT_CLIENT_VERSION,
        release_name: 'Kararlı Sürüm',
        release_notes: ['Sistem kararlılık güncellemeleri.'],
        is_mandatory: false,
        min_supported_version: '1.0.0',
        created_at: new Date().toISOString(),
      };

      const hasUpdate = compareSemver(latest.version, CURRENT_CLIENT_VERSION) > 0;
      const isBelowMin = latest.min_supported_version
        ? compareSemver(CURRENT_CLIENT_VERSION, latest.min_supported_version) < 0
        : false;

      const isMandatory = hasUpdate && (latest.is_mandatory || isBelowMin);

      const result: VersionCheckResult = {
        hasUpdate,
        isMandatory,
        currentVersion: CURRENT_CLIENT_VERSION,
        latestVersion: latest.version,
        releaseName: latest.release_name,
        releaseNotes: latest.release_notes || [],
        minSupportedVersion: latest.min_supported_version || '1.0.0',
      };

      this.cachedResult = result;
      this.lastCheckTime = now;
      return result;
    } catch (err) {
      // Fallback
      return {
        hasUpdate: false,
        isMandatory: false,
        currentVersion: CURRENT_CLIENT_VERSION,
        latestVersion: CURRENT_CLIENT_VERSION,
        releaseName: 'Mevcut Sürüm',
        releaseNotes: [],
        minSupportedVersion: '1.0.0',
      };
    }
  }

  /**
   * Uygulamayı en son sürüme güncellemek için önbelleği temizler ve yeniden yükler
   */
  async applyUpdate(): Promise<void> {
    if (typeof window !== 'undefined') {
      // 1. Service Worker önbelleğini temizle (PWA)
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }

      // 2. Cache API temizliği
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }

      // 3. Sayfayı zorla yenile
      window.location.reload();
    }
  }
}

export const versionService = new VersionControlService();
