import React from 'react';
import { WorkspaceTopBar } from '../components/layout/WorkspaceTopBar';
import { WorkspaceMap } from '../components/layout/WorkspaceMap';

export const SpatialLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950">
      <WorkspaceTopBar />
      <main className="flex-1 flex overflow-hidden pt-20">
        <WorkspaceMap />
      </main>
    </div>
  );
};
