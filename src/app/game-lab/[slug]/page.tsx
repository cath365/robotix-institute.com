'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { GlassCard, Badge, Button, Input, LoadingSpinner } from '@/components/ui';
import { GameAssetStudio } from '@/components/game-lab/GameAssetStudio';
import { GameBuilderPanel } from '@/components/game-lab/GameBuilderPanel';
import { GameCoachPanel } from '@/components/game-lab/GameCoachPanel';
import { GameDirectorPanel } from '@/components/game-lab/GameDirectorPanel';
import { GameEventGraph } from '@/components/game-lab/GameEventGraph';
import { GameEventInspectorPanel } from '@/components/game-lab/GameEventInspectorPanel';
import { GameObjectInspectorPanel } from '@/components/game-lab/GameObjectInspectorPanel';
import { GameSceneMediaPanel } from '@/components/game-lab/GameSceneMediaPanel';
import { GameSceneFlowPanel } from '@/components/game-lab/GameSceneFlowPanel';
import { GameEventSheet } from '@/components/game-lab/GameEventSheet';
import { GameCodeBlocks } from '@/components/game-lab/GameCodeBlocks';
import { GameLabPreview } from '@/components/game-lab/GameLabPreview';
import { GameSceneCanvas } from '@/components/game-lab/GameSceneCanvas';
import { GameSceneObjectLab } from '@/components/game-lab/GameSceneObjectLab';
import { GameWorldLab } from '@/components/game-lab/GameWorldLab';
import { syncStageArtToCode, type StudioAssetItem } from '@/lib/game-assets';
import { applyGameCodeBlock, type GameCodeBlock } from '@/lib/game-code-blocks';
import { syncEventRulesToCode, type GameEventRule } from '@/lib/game-event-sheet';
import { applyDirectorSystem, type GameDirectorSystem } from '@/lib/game-director-systems';
import { attachProjectManifest, parseProjectManifest } from '@/lib/game-project-manifest';
import { createDefaultSceneFlow, syncSceneFlowToCode, type StudioSceneDefinition } from '@/lib/game-scene-flow';
import { syncSceneObjectsToCode, type SceneObjectBlueprint } from '@/lib/game-scene-objects';
import { applyWorldThemeToProject, type GameWorldTheme } from '@/lib/game-world-themes';
import { useApi, useAuth } from '@/hooks/useApi';
import { Save, Send, Undo2, Play, ArrowLeft } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface GameDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags?: string;
  thumbnail?: string | null;
  code: string;
  status: string;
  rejectionReason?: string | null;
}

function clampSceneCoordinate(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function GameLabEditorPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { token, isAuthenticated } = useAuth();
  const { patch, post, del } = useApi();

  const [game, setGame] = useState<GameDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [sceneObjects, setSceneObjects] = useState<SceneObjectBlueprint[]>([]);
  const [eventRules, setEventRules] = useState<GameEventRule[]>([]);
  const [assets, setAssets] = useState<StudioAssetItem[]>([]);
  const [stageArtUrl, setStageArtUrl] = useState<string | null>(null);
  const [storyScenes, setStoryScenes] = useState<StudioSceneDefinition[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const codeRef = useRef('');
  const sceneObjectsRef = useRef<SceneObjectBlueprint[]>([]);
  const eventRulesRef = useRef<GameEventRule[]>([]);
  const assetsRef = useRef<StudioAssetItem[]>([]);
  const stageArtUrlRef = useRef<string | null>(null);
  const storyScenesRef = useRef<StudioSceneDefinition[]>([]);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    sceneObjectsRef.current = sceneObjects;
  }, [sceneObjects]);

  useEffect(() => {
    eventRulesRef.current = eventRules;
  }, [eventRules]);

  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  useEffect(() => {
    stageArtUrlRef.current = stageArtUrl;
  }, [stageArtUrl]);

  useEffect(() => {
    storyScenesRef.current = storyScenes;
  }, [storyScenes]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/game-projects/${slug}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Failed');
      const dto = json.data as GameDto;
      const parsed = parseProjectManifest(dto.code);
      setGame(dto);
      setTitle(dto.title);
      setDescription(dto.description ?? '');
      setTags(dto.tags ?? '');
      setThumbnail(dto.thumbnail ?? '');
      const loadedScenes = parsed.manifest.scenes?.length ? parsed.manifest.scenes : createDefaultSceneFlow();
      const defaultSceneId = loadedScenes[0]?.id ?? null;
      setCode(parsed.code);
      setSceneObjects((parsed.manifest.sceneObjects ?? []).map((object) => ({
        ...object,
        sceneId: object.sceneId ?? defaultSceneId,
      })));
      setEventRules((parsed.manifest.eventRules ?? []).map((rule) => ({
        ...rule,
        sceneId: rule.sceneId ?? defaultSceneId,
      })));
      setAssets(parsed.manifest.assets ?? []);
      setStageArtUrl(parsed.manifest.stageArtUrl ?? null);
      setStoryScenes(loadedScenes);
      setSelectedSceneId(defaultSceneId);
      setSelectedObjectId(null);
      setSelectedRuleId(null);
      setIsDirty(false);
    } catch {
      toast.error('Could not load game');
      setGame(null);
    } finally {
      setLoading(false);
    }
  }, [slug, token]);

  const activeScene = useMemo(
    () => storyScenes.find((scene) => scene.id === selectedSceneId) ?? storyScenes[0] ?? null,
    [selectedSceneId, storyScenes]
  );

  const activeSceneId = activeScene?.id ?? null;
  const activeSceneObjects = useMemo(
    () => sceneObjects.filter((object) => (object.sceneId ?? null) === activeSceneId),
    [sceneObjects, activeSceneId]
  );
  const activeSceneRules = useMemo(
    () => eventRules.filter((rule) => (rule.sceneId ?? null) === activeSceneId),
    [eventRules, activeSceneId]
  );
  const selectedRule = useMemo(
    () => activeSceneRules.find((rule) => rule.id === selectedRuleId) ?? null,
    [activeSceneRules, selectedRuleId]
  );
  const selectedObject = useMemo(
    () => activeSceneObjects.find((object) => object.id === selectedObjectId) ?? null,
    [activeSceneObjects, selectedObjectId]
  );
  const sceneObjectCounts = useMemo(
    () => sceneObjects.reduce<Record<string, number>>((accumulator, object) => {
      if (!object.sceneId) return accumulator;
      accumulator[object.sceneId] = (accumulator[object.sceneId] ?? 0) + 1;
      return accumulator;
    }, {}),
    [sceneObjects]
  );
  const sceneRuleCounts = useMemo(
    () => eventRules.reduce<Record<string, number>>((accumulator, rule) => {
      if (!rule.sceneId) return accumulator;
      accumulator[rule.sceneId] = (accumulator[rule.sceneId] ?? 0) + 1;
      return accumulator;
    }, {}),
    [eventRules]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedObjectId && !activeSceneObjects.some((object) => object.id === selectedObjectId)) {
      setSelectedObjectId(null);
    }
  }, [activeSceneObjects, selectedObjectId]);

  useEffect(() => {
    if (selectedRuleId && !activeSceneRules.some((rule) => rule.id === selectedRuleId)) {
      setSelectedRuleId(null);
    }
  }, [activeSceneRules, selectedRuleId]);

  const applySceneStudioState = useCallback((
    scenes: StudioSceneDefinition[],
    objects: SceneObjectBlueprint[] = sceneObjectsRef.current,
    rules: GameEventRule[] = eventRulesRef.current,
    options?: {
      baseCode?: string;
      selectedSceneId?: string | null;
      shouldBumpPreview?: boolean;
    }
  ) => {
    const sceneFlowResult = syncSceneFlowToCode(options?.baseCode ?? codeRef.current, scenes);
    const validSceneIds = new Set(sceneFlowResult.scenes.map((scene) => scene.id));
    const nextObjects = objects.filter((object) => !object.sceneId || validSceneIds.has(object.sceneId));
    const nextRules = rules.filter((rule) => !rule.sceneId || validSceneIds.has(rule.sceneId));
    const objectResult = syncSceneObjectsToCode(sceneFlowResult.code, nextObjects);
    const ruleResult = syncEventRulesToCode(objectResult.code, nextRules);
    const nextSelected = options?.selectedSceneId && sceneFlowResult.scenes.some((scene) => scene.id === options.selectedSceneId)
      ? options.selectedSceneId
      : sceneFlowResult.scenes[0]?.id ?? null;

    setStoryScenes(sceneFlowResult.scenes);
    setSelectedSceneId(nextSelected);
    setSceneObjects(objectResult.objects);
    setEventRules(ruleResult.rules);
    setCode(ruleResult.code);
    if (options?.shouldBumpPreview ?? true) {
      setPreviewKey((current) => current + 1);
    }
    setIsDirty(true);
  }, []);

  const handleSave = async () => {
    if (!game) return;
    setSaving(true);
    try {
      const persistedCode = attachProjectManifest(codeRef.current, {
        version: 1,
        sceneObjects: sceneObjectsRef.current,
        eventRules: eventRulesRef.current,
        assets: assetsRef.current,
        stageArtUrl: stageArtUrlRef.current,
        scenes: storyScenesRef.current,
      });
      await patch(
        `/game-projects/${slug}`,
        { title, description, tags, thumbnail: thumbnail.trim() || null, code: persistedCode },
        { requireAuth: true }
      );
      toast.success('Saved');
      setIsDirty(false);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await post(`/game-projects/${slug}/publish`, {}, { requireAuth: true });
      toast.success('Sent to admin queue');
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Submit failed');
    }
  };

  const handleUnpublish = async () => {
    try {
      await del(`/game-projects/${slug}/publish`, { requireAuth: true });
      toast.success('Returned to draft');
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Unpublish failed');
    }
  };

  const handleApplyBuilder = (project: {
    title: string;
    description: string;
    tags: string;
    code: string;
  }) => {
    setTitle(project.title);
    setDescription(project.description);
    setTags(project.tags);
    setCode(project.code);
    setSceneObjects([]);
    setEventRules([]);
    setAssets([]);
    setStageArtUrl(null);
    setSelectedObjectId(null);
    setSelectedRuleId(null);
    const defaultScenes = createDefaultSceneFlow();
    const sceneFlowResult = syncSceneFlowToCode(project.code, defaultScenes);
    setCode(sceneFlowResult.code);
    setStoryScenes(sceneFlowResult.scenes);
    setSelectedSceneId(sceneFlowResult.scenes[0]?.id ?? null);
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Guided starter loaded into the studio');
  };

  const handleCreateSceneObject = (input: Omit<SceneObjectBlueprint, 'id'> & { id?: string }) => {
    const nextObjects = [...sceneObjectsRef.current, { ...input, sceneId: activeSceneId } as SceneObjectBlueprint];
    const result = syncSceneObjectsToCode(codeRef.current, nextObjects);
    setSceneObjects(result.objects);
    setCode(result.code);
    setSelectedObjectId(result.objects[result.objects.length - 1]?.id ?? null);
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Scene object placed into the level');
  };

  const handleUpdateSceneObject = (
    id: string,
    updates: Partial<Omit<SceneObjectBlueprint, 'id' | 'sceneId'>>
  ) => {
    const nextObjects = sceneObjectsRef.current.map((object) => (
      object.id === id ? { ...object, ...updates } : object
    ));
    const result = syncSceneObjectsToCode(codeRef.current, nextObjects);
    setSceneObjects(result.objects);
    setCode(result.code);
    setSelectedObjectId(id);
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Object settings updated');
  };

  const handleMoveSceneObject = (id: string, x: number, y: number) => {
    const nextObjects = sceneObjectsRef.current.map((object) => (
      object.id === id ? { ...object, x, y } : object
    ));
    const result = syncSceneObjectsToCode(codeRef.current, nextObjects);
    setSceneObjects(result.objects);
    setCode(result.code);
    setIsDirty(true);
  };

  const handleRemoveSceneObject = (id: string) => {
    const nextObjects = sceneObjectsRef.current.filter((object) => object.id !== id);
    const result = syncSceneObjectsToCode(codeRef.current, nextObjects);
    setSceneObjects(result.objects);
    setCode(result.code);
    if (selectedObjectId === id) {
      setSelectedObjectId(result.objects.find((object) => object.sceneId === activeSceneId)?.id ?? null);
    }
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Scene object removed');
  };

  const handleDuplicateSceneObject = (id: string) => {
    const sourceObject = sceneObjectsRef.current.find((object) => object.id === id);
    if (!sourceObject) return;

    const clonedObject: SceneObjectBlueprint = {
      ...sourceObject,
      id: `${sourceObject.id}-${Math.random().toString(36).slice(2, 6)}`,
      label: `${sourceObject.label} Copy`,
      x: clampSceneCoordinate(sourceObject.x + 28, 30, 690),
      y: clampSceneCoordinate(sourceObject.y + 18, 90, 510),
    };
    const nextObjects = [...sceneObjectsRef.current, clonedObject];
    const result = syncSceneObjectsToCode(codeRef.current, nextObjects);
    setSceneObjects(result.objects);
    setCode(result.code);
    setSelectedObjectId(result.objects[result.objects.length - 1]?.id ?? clonedObject.id);
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Object duplicated');
  };

  const handleAddEventRule = (rule: GameEventRule) => {
    const nextRules = [...eventRulesRef.current, { ...rule, sceneId: activeSceneId }];
    const result = syncEventRulesToCode(codeRef.current, nextRules);
    setEventRules(result.rules);
    setCode(result.code);
    setSelectedRuleId(result.rules[result.rules.length - 1]?.id ?? null);
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Event rule added to the graph');
  };

  const handleUpdateEventRule = (
    id: string,
    updates: Partial<Omit<GameEventRule, 'id' | 'sceneId'>>
  ) => {
    const nextRules = eventRulesRef.current.map((rule) => (
      rule.id === id ? { ...rule, ...updates } : rule
    ));
    const result = syncEventRulesToCode(codeRef.current, nextRules);
    setEventRules(result.rules);
    setCode(result.code);
    setSelectedRuleId(id);
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Rule settings updated');
  };

  const handleRemoveEventRule = (ruleId: string) => {
    const nextRules = eventRulesRef.current.filter((rule) => rule.id !== ruleId);
    const result = syncEventRulesToCode(codeRef.current, nextRules);
    setEventRules(result.rules);
    setCode(result.code);
    if (selectedRuleId === ruleId) {
      setSelectedRuleId(result.rules.find((rule) => rule.sceneId === activeSceneId)?.id ?? null);
    }
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Event rule removed');
  };

  const handleDuplicateEventRule = (ruleId: string) => {
    const sourceRule = eventRulesRef.current.find((rule) => rule.id === ruleId);
    if (!sourceRule) return;

    const clonedRule: GameEventRule = {
      ...sourceRule,
      id: `${sourceRule.id}-${Math.random().toString(36).slice(2, 6)}`,
      label: `${sourceRule.label} Copy`,
    };
    const nextRules = [...eventRulesRef.current, clonedRule];
    const result = syncEventRulesToCode(codeRef.current, nextRules);
    setEventRules(result.rules);
    setCode(result.code);
    setSelectedRuleId(result.rules[result.rules.length - 1]?.id ?? clonedRule.id);
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Rule duplicated');
  };

  const handleUseAsCover = (url: string) => {
    setThumbnail(url);
    setIsDirty(true);
    toast.success('Asset applied as cover image');
  };

  const handleAssetsChange = (nextAssets: StudioAssetItem[]) => {
    setAssets(nextAssets);
    setIsDirty(true);
  };

  const handleUseAsStageArt = (url: string) => {
    setStageArtUrl(url);
    setCode((current) => syncStageArtToCode(current, url));
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Stage art applied to the game');
  };

  const handleUseAsSceneBackground = (url: string) => {
    if (!activeSceneId) return;
    const nextScenes = storyScenesRef.current.map((scene) =>
      scene.id === activeSceneId ? { ...scene, backgroundAssetUrl: url } : scene
    );
    handleReplaceStoryScenes(nextScenes);
    toast.success('Scene background applied');
  };

  const handleUseAsSceneSoundtrack = (url: string) => {
    if (!activeSceneId) return;
    const nextScenes = storyScenesRef.current.map((scene) =>
      scene.id === activeSceneId ? { ...scene, soundtrackUrl: url } : scene
    );
    handleReplaceStoryScenes(nextScenes);
    toast.success('Scene soundtrack applied');
  };

  const handleClearSceneBackground = () => {
    if (!activeSceneId) return;
    const nextScenes = storyScenesRef.current.map((scene) =>
      scene.id === activeSceneId ? { ...scene, backgroundAssetUrl: null } : scene
    );
    handleReplaceStoryScenes(nextScenes);
    toast.success('Scene background cleared');
  };

  const handleClearSceneSoundtrack = () => {
    if (!activeSceneId) return;
    const nextScenes = storyScenesRef.current.map((scene) =>
      scene.id === activeSceneId ? { ...scene, soundtrackUrl: '' } : scene
    );
    handleReplaceStoryScenes(nextScenes);
    toast.success('Scene soundtrack cleared');
  };

  const handleReplaceStoryScenes = (scenes: StudioSceneDefinition[]) => {
    applySceneStudioState(scenes, sceneObjectsRef.current, eventRulesRef.current, {
      selectedSceneId,
    });
  };

  const handleDuplicateScene = (sceneId: string) => {
    const sourceScene = storyScenesRef.current.find((scene) => scene.id === sceneId);
    if (!sourceScene) return;

    const cloneId = `${sourceScene.id}-${Math.random().toString(36).slice(2, 7)}`;
    const sourceIndex = storyScenesRef.current.findIndex((scene) => scene.id === sceneId);
    const clonedScene: StudioSceneDefinition = {
      ...sourceScene,
      id: cloneId,
      name: `${sourceScene.name} Copy`,
    };
    const nextScenes = [...storyScenesRef.current];
    nextScenes.splice(sourceIndex + 1, 0, clonedScene);

    const clonedObjects = sceneObjectsRef.current
      .filter((object) => object.sceneId === sceneId)
      .map((object, index) => ({
        ...object,
        id: `${object.id}-${Math.random().toString(36).slice(2, 6)}`,
        label: `${object.label} Copy`,
        sceneId: cloneId,
        x: clampSceneCoordinate(object.x + 24 + (index % 2) * 12, 30, 690),
        y: clampSceneCoordinate(object.y + 18, 90, 510),
      }));
    const clonedRules = eventRulesRef.current
      .filter((rule) => rule.sceneId === sceneId)
      .map((rule) => ({
        ...rule,
        id: `${rule.id}-${Math.random().toString(36).slice(2, 6)}`,
        label: `${rule.label} Copy`,
        sceneId: cloneId,
      }));

    applySceneStudioState(
      nextScenes,
      [...sceneObjectsRef.current, ...clonedObjects],
      [...eventRulesRef.current, ...clonedRules],
      { selectedSceneId: cloneId }
    );
    setSelectedObjectId(clonedObjects[0]?.id ?? null);
    toast.success('Scene duplicated with its objects and rules');
  };

  const handleClearStageArt = () => {
    setStageArtUrl(null);
    setCode((current) => syncStageArtToCode(current, null));
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success('Stage art cleared');
  };

  const handleRemoveAsset = (assetId: string) => {
    const nextAssets = assetsRef.current.filter((asset) => asset.id !== assetId);
    const removed = assetsRef.current.find((asset) => asset.id === assetId);
    setAssets(nextAssets);
    if (removed?.url === thumbnail.trim()) {
      setThumbnail('');
    }
    const nextBaseCode = removed?.url === stageArtUrlRef.current
      ? syncStageArtToCode(codeRef.current, null)
      : codeRef.current;
    const nextScenes = removed?.url
      ? storyScenesRef.current.map((scene) => ({
          ...scene,
          backgroundAssetUrl: scene.backgroundAssetUrl === removed.url ? null : scene.backgroundAssetUrl ?? null,
          soundtrackUrl: scene.soundtrackUrl === removed.url ? '' : scene.soundtrackUrl ?? '',
        }))
      : storyScenesRef.current;
    if (removed?.url === stageArtUrlRef.current) {
      setStageArtUrl(null);
    }
    applySceneStudioState(nextScenes, sceneObjectsRef.current, eventRulesRef.current, {
      baseCode: nextBaseCode,
      selectedSceneId: activeSceneId,
      shouldBumpPreview: true,
    });
    toast.success('Asset removed from this project');
  };

  const handleInsertCodeBlock = (block: GameCodeBlock) => {
    const result = applyGameCodeBlock(code, block);
    if (!result.inserted) {
      toast('That block is already in this project.');
      return;
    }

    setCode(result.code);
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success(`${block.title} added to the project`);
  };

  const handleDeployDirectorSystem = (system: GameDirectorSystem) => {
    const result = applyDirectorSystem(code, system);
    if (!result.inserted) {
      toast('That system is already active in this project.');
      return;
    }

    setCode(result.code);
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success(`${system.title} deployed`);
  };

  const handleApplyWorldTheme = (theme: GameWorldTheme) => {
    const next = applyWorldThemeToProject({
      title,
      description,
      tags,
      code,
      theme,
    });

    setTitle(next.title);
    setDescription(next.description);
    setTags(next.tags);
    setCode(next.code);
    setPreviewKey((current) => current + 1);
    setIsDirty(true);
    toast.success(`${theme.name} world pack applied`);
  };

  const handleCodeChange = (nextCode: string) => {
    setCode(nextCode);
    setIsDirty(true);
  };

  const runPreview = () => setPreviewKey((k) => k + 1);

  const badgeVariant = useMemo(() => {
    const s = game?.status ?? '';
    if (s === 'PUBLISHED') return 'success' as const;
    if (s === 'REJECTED') return 'danger' as const;
    if (s === 'PENDING') return 'accent' as const;
    return 'primary' as const;
  }, [game]);

  if (!isAuthenticated) {
    return (
      <main className="bg-brand-dark min-h-screen">
        <Navbar />
        <GlassCard className="mx-auto mt-32 max-w-md p-8 text-center">
          <p className="mb-4 text-white/70">Sign in required</p>
          <Link href={`/login?next=/game-lab/${slug}`}>
            <Button>Sign in</Button>
          </Link>
        </GlassCard>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-brand-dark min-h-[100vh] min-h-screen flex flex-col">
      <Navbar />
      <div className="shrink-0 border-b border-white/10 bg-brand-dark pt-[4.25rem] lg:sticky lg:top-0 lg:z-40">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-2 px-3 py-2">
          <Link href="/game-lab" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Studio
          </Link>
          {game ? <Badge variant={badgeVariant}>{game.status}</Badge> : null}
          {isDirty ? <Badge variant="accent">Unsaved changes</Badge> : null}
          <span className="text-xs text-white/30">/{slug}</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => window.open(`/game-lab/play/${slug}`, '_blank')}>
              Open player tab
            </Button>
            <Button size="sm" variant="secondary" icon={<Undo2 className="h-4 w-4" />} onClick={runPreview}>
              Reload preview
            </Button>
            <Button size="sm" variant="ghost" icon={<Play className="h-4 w-4 text-green-400" />} onClick={runPreview}>
              Run
            </Button>
            <Button size="sm" loading={saving} icon={<Save className="h-4 w-4" />} onClick={handleSave}>
              Save
            </Button>
            {game?.status !== 'PUBLISHED' && game?.status !== 'PENDING' ? (
              <Button size="sm" variant="primary" icon={<Send className="h-4 w-4" />} onClick={handleSubmitReview}>
                Submit review
              </Button>
            ) : null}
            {game?.status === 'PUBLISHED' ? (
              <Button size="sm" variant="danger" onClick={handleUnpublish}>
                Unpublish
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {loading || !game ? (
        <div className="flex flex-1 items-center justify-center py-24">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
            <div className="shrink-0 space-y-3 p-3">
              <GlassCard className="overflow-hidden p-0">
                <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(51,214,255,0.12),rgba(148,163,184,0.02))] px-5 py-4">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-brand-secondary">Studio Workspace</p>
                      <h1 className="mt-2 font-heading text-2xl font-semibold text-white">{title || game.title}</h1>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
                        Build scenes visually, layer rules like an event sheet, then keep the generated Phaser project available for advanced edits.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white/70 sm:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Scenes</div>
                        <div className="mt-1 font-heading text-xl text-white">{storyScenes.length}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Assets</div>
                        <div className="mt-1 font-heading text-xl text-white">{assets.length}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Scene Objects</div>
                        <div className="mt-1 font-heading text-xl text-white">{activeSceneObjects.length}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Rules</div>
                        <div className="mt-1 font-heading text-xl text-white">{activeSceneRules.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Visual layout</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Event logic</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Scene routing</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Code access</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Phaser runtime</span>
                </div>
              </GlassCard>
              <GameCoachPanel
                title={title}
                description={description}
                tags={tags}
                thumbnail={thumbnail}
                code={code}
              />
              <GameAssetStudio
                token={token}
                assets={assets}
                stageArtUrl={stageArtUrl}
                currentSceneName={activeScene?.name}
                currentSceneBackgroundUrl={activeScene?.backgroundAssetUrl ?? null}
                currentSceneSoundtrackUrl={activeScene?.soundtrackUrl ?? null}
                onAssetsChange={handleAssetsChange}
                onUseAsCover={handleUseAsCover}
                onUseAsStageArt={handleUseAsStageArt}
                onUseAsSceneBackground={handleUseAsSceneBackground}
                onUseAsSceneSoundtrack={handleUseAsSceneSoundtrack}
                onRemoveAsset={handleRemoveAsset}
                onClearStageArt={handleClearStageArt}
                onClearSceneBackground={handleClearSceneBackground}
                onClearSceneSoundtrack={handleClearSceneSoundtrack}
              />
              <GameWorldLab onApply={handleApplyWorldTheme} />
              <GameBuilderPanel onApply={handleApplyBuilder} />
              <GameSceneFlowPanel
                scenes={storyScenes}
                selectedSceneId={activeSceneId}
                sceneObjectCounts={sceneObjectCounts}
                sceneRuleCounts={sceneRuleCounts}
                onSelectScene={setSelectedSceneId}
                onReplaceScenes={handleReplaceStoryScenes}
                onDuplicateScene={handleDuplicateScene}
              />
              <GameSceneMediaPanel
                scene={activeScene}
                stageArtUrl={stageArtUrl}
                onClearSceneBackground={handleClearSceneBackground}
                onClearSceneSoundtrack={handleClearSceneSoundtrack}
              />
              <GameSceneObjectLab
                objects={activeSceneObjects}
                currentSceneName={activeScene?.name}
                onCreate={handleCreateSceneObject}
              />
              <GameSceneCanvas
                objects={activeSceneObjects}
                backgroundUrl={activeScene?.backgroundAssetUrl ?? stageArtUrl}
                currentSceneName={activeScene?.name}
                selectedObjectId={selectedObjectId}
                onMoveObject={handleMoveSceneObject}
                onRemoveObject={handleRemoveSceneObject}
                onSelectObject={setSelectedObjectId}
              />
              <GameObjectInspectorPanel
                selectedObject={selectedObject}
                currentSceneName={activeScene?.name}
                onUpdateObject={handleUpdateSceneObject}
                onDuplicateObject={handleDuplicateSceneObject}
                onRemoveObject={handleRemoveSceneObject}
              />
              <GameEventSheet
                rules={activeSceneRules}
                objects={activeSceneObjects}
                currentSceneId={activeSceneId}
                currentSceneName={activeScene?.name}
                selectedRuleId={selectedRuleId}
                onAddRule={handleAddEventRule}
                onRemoveRule={handleRemoveEventRule}
                onSelectRule={setSelectedRuleId}
              />
              <GameEventInspectorPanel
                selectedRule={selectedRule}
                objects={activeSceneObjects}
                currentSceneName={activeScene?.name}
                onUpdateRule={handleUpdateEventRule}
                onDuplicateRule={handleDuplicateEventRule}
                onRemoveRule={handleRemoveEventRule}
              />
              <GameEventGraph rules={activeSceneRules} currentSceneName={activeScene?.name} />
              <GameDirectorPanel onDeploy={handleDeployDirectorSystem} />
              <GameCodeBlocks onInsert={handleInsertCodeBlock} />
              <Input label="Game title" value={title} onChange={(e) => {
                setTitle(e.target.value);
                setIsDirty(true);
              }} />
              <textarea
                className="input-field min-h-[60px] resize-y bg-white/[0.04] text-sm"
                placeholder="Short description..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(true);
                }}
              />
              <Input
                label="Tags"
                placeholder="robotics, ai, puzzle"
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  setIsDirty(true);
                }}
              />
              <Input
                label="Cover image URL"
                placeholder="https://images.example.com/playverse-cover.jpg"
                value={thumbnail}
                onChange={(e) => {
                  setThumbnail(e.target.value);
                  setIsDirty(true);
                }}
              />
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">Cover preview</p>
                <div
                  className="mt-3 min-h-[140px] rounded-[1.25rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(51,214,255,0.18),transparent_45%),linear-gradient(135deg,rgba(8,17,36,0.98),rgba(24,8,48,0.95))] bg-cover bg-center"
                  style={
                    thumbnail.trim()
                      ? { backgroundImage: `linear-gradient(180deg, rgba(6,10,24,0.18), rgba(6,10,24,0.84)), url(${thumbnail.trim()})` }
                      : undefined
                  }
                />
              </div>
              {game.rejectionReason ? <p className="text-xs text-red-400">{game.rejectionReason}</p> : null}
            </div>
            <div className="min-h-[340px] flex-1">
              <MonacoEditor
                height="min(70vh, 640px)"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={(v) => handleCodeChange(v ?? '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>
          <aside className="w-full shrink-0 bg-brand-dark-surface p-3 lg:w-[min(760px,50vw)]">
            <div className="mb-3 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-xs uppercase tracking-[0.2em] text-white/40">Live Preview - Phaser 3</h2>
                  <p className="mt-2 text-sm text-white/62">
                    {activeScene ? `Previewing ${activeScene.name} with its own flow, objects, and rules.` : 'Select a scene to preview that part of the game directly.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeScene?.backgroundAssetUrl ? <Badge variant="accent">Scene background</Badge> : null}
                  {activeScene?.soundtrackUrl ? <Badge variant="success">Scene soundtrack</Badge> : null}
                  {stageArtUrl ? <Badge variant="primary">Stage art</Badge> : null}
                </div>
              </div>
              {storyScenes.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {storyScenes.map((scene) => (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => setSelectedSceneId(scene.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-all ${
                        scene.id === activeSceneId
                          ? 'border-brand-accent bg-brand-accent/15 text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/58 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {scene.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <GameLabPreview key={previewKey} code={code} title={`Preview ${previewKey}`} previewSceneId={activeSceneId} />
          </aside>
        </div>
      )}
      <Footer />
    </main>
  );
}
