'use client';

import { useRef, useState } from 'react';
import { Badge, Button, GlassCard } from '@/components/ui';
import type { StudioAssetItem } from '@/lib/game-assets';
import { ImagePlus, UploadCloud } from 'lucide-react';

interface GameAssetStudioProps {
  token?: string | null;
  assets: StudioAssetItem[];
  stageArtUrl?: string | null;
  currentSceneName?: string;
  currentSceneBackgroundUrl?: string | null;
  currentSceneSoundtrackUrl?: string | null;
  onAssetsChange: (assets: StudioAssetItem[]) => void;
  onUseAsCover: (url: string) => void;
  onUseAsStageArt: (url: string) => void;
  onUseAsSceneBackground: (url: string) => void;
  onUseAsSceneSoundtrack: (url: string) => void;
  onRemoveAsset: (assetId: string) => void;
  onClearStageArt: () => void;
  onClearSceneBackground: () => void;
  onClearSceneSoundtrack: () => void;
}

export function GameAssetStudio({
  token,
  assets,
  stageArtUrl,
  currentSceneName,
  currentSceneBackgroundUrl,
  currentSceneSoundtrackUrl,
  onAssetsChange,
  onUseAsCover,
  onUseAsStageArt,
  onUseAsSceneBackground,
  onUseAsSceneSoundtrack,
  onRemoveAsset,
  onClearStageArt,
  onClearSceneBackground,
  onClearSceneSoundtrack,
}: GameAssetStudioProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: form,
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message || 'Upload failed');
      }

      const asset: StudioAssetItem = {
        id: `${json.data.filename}-${Date.now()}`,
        url: json.data.url,
        filename: json.data.filename,
        mime: json.data.mime,
        size: json.data.size,
      };
      onAssetsChange([asset, ...assets]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-3">
            <UploadCloud className="mr-1 h-3 w-3" />
            Asset Studio
          </Badge>
          <h3 className="font-heading text-2xl font-semibold text-white">Upload art and audio for the whole game world</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Use your own images for the cover, stage atmosphere, and scene backdrops, then add soundtrack files to give each scene a stronger identity.
          </p>
          {currentSceneName ? (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-secondary">
              Active scene: {currentSceneName}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {stageArtUrl ? (
            <Button size="sm" variant="ghost" onClick={onClearStageArt}>
              Clear stage art
            </Button>
          ) : null}
          {currentSceneBackgroundUrl ? (
            <Button size="sm" variant="ghost" onClick={onClearSceneBackground}>
              Clear scene background
            </Button>
          ) : null}
          {currentSceneSoundtrackUrl ? (
            <Button size="sm" variant="ghost" onClick={onClearSceneSoundtrack}>
              Clear soundtrack
            </Button>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/wav,audio/ogg"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
              event.target.value = '';
            }}
          />
          <Button loading={uploading} icon={<ImagePlus className="h-4 w-4" />} onClick={() => inputRef.current?.click()}>
            Upload asset
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-white/36">Cover + stage</div>
          <div className="mt-3 text-sm leading-6 text-white/60">
            {stageArtUrl ? 'Stage art is active for the playable world.' : 'No stage art set yet.'}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-white/36">Scene backdrop</div>
          <div className="mt-3 text-sm leading-6 text-white/60">
            {currentSceneBackgroundUrl ? 'This scene has its own background image.' : 'This scene is still using the default stage look.'}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-white/36">Scene soundtrack</div>
          <div className="mt-3 text-sm leading-6 text-white/60">
            {currentSceneSoundtrackUrl ? 'This scene has its own soundtrack file.' : 'No soundtrack assigned to the current scene.'}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {assets.length > 0 ? assets.map((asset) => (
          <GlassCard key={asset.id} className="flex h-full flex-col overflow-hidden p-0">
            {asset.mime.startsWith('image/') ? (
              <div
                className="min-h-[170px] border-b border-white/10 bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(6,10,24,0.14), rgba(6,10,24,0.72)), url(${asset.url})` }}
              />
            ) : (
              <div className="flex min-h-[170px] items-center justify-center border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(51,214,255,0.16),transparent_40%),linear-gradient(135deg,rgba(8,17,36,0.98),rgba(24,8,48,0.95))]">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">Audio Asset</div>
                  <div className="mt-2 font-heading text-2xl font-semibold text-white">Soundtrack</div>
                </div>
              </div>
            )}
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="font-medium text-white">{asset.filename}</div>
              <div className="text-xs uppercase tracking-[0.16em] text-white/38">{asset.mime}</div>
              {asset.mime.startsWith('audio/') ? (
                <audio controls className="w-full">
                  <source src={asset.url} type={asset.mime} />
                </audio>
              ) : null}
              <div className="mt-auto flex flex-wrap gap-2">
                {asset.mime.startsWith('image/') ? (
                  <>
                    <Button size="sm" onClick={() => onUseAsCover(asset.url)}>Use as cover</Button>
                    <Button size="sm" variant="secondary" onClick={() => onUseAsStageArt(asset.url)}>
                      {stageArtUrl === asset.url ? 'Stage art active' : 'Use as stage art'}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onUseAsSceneBackground(asset.url)}>
                      {currentSceneBackgroundUrl === asset.url ? 'Scene background active' : 'Use in current scene'}
                    </Button>
                  </>
                ) : null}
                {asset.mime.startsWith('audio/') ? (
                  <Button size="sm" variant="secondary" onClick={() => onUseAsSceneSoundtrack(asset.url)}>
                    {currentSceneSoundtrackUrl === asset.url ? 'Scene soundtrack active' : 'Use as soundtrack'}
                  </Button>
                ) : null}
                <Button size="sm" variant="ghost" onClick={() => onRemoveAsset(asset.id)}>Remove</Button>
              </div>
            </div>
          </GlassCard>
        )) : (
          <div className="xl:col-span-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/55">
            No uploaded assets yet. Add a poster image, stage background, or soundtrack and the studio can wire it into the game for you.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
