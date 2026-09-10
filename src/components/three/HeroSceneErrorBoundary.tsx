'use client';

import { Component, type ReactNode } from 'react';

/** If WebGL / R3F fails on some GPUs, degrade to the static fallback instead of white-screening the home page. */
export class HeroSceneErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { hasError } = this.state;
    if (hasError) return null;
    return this.props.children;
  }
}
