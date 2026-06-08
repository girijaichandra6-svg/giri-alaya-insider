"use client";

import * as React from "react";
import { Network, Hash } from "lucide-react";

interface AffiliateNetwork {
  id: string;
  name: string;
  identifier: string;
  _count: { links: number };
}

export function NetworksPanel({ networks }: { networks: AffiliateNetwork[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-obsidian p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Network className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-medium">Affiliate Networks</h2>
          <p className="text-xs text-muted font-body">{networks.length} configured</p>
        </div>
      </div>

      {networks.length === 0 ? (
        <p className="text-sm text-muted font-body py-8 text-center">No networks configured.</p>
      ) : (
        <div className="space-y-2">
          {networks.map((network) => (
            <div
              key={network.id}
              className="flex items-center justify-between rounded-lg bg-onyx p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Network className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-softWhite font-body">{network.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] font-ui text-muted font-mono">
                      <Hash className="h-3 w-3 inline mr-0.5" />
                      {network.identifier}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <div className="text-center">
                  <span className="text-sm font-ui font-semibold text-softWhite">
                    {network._count.links}
                  </span>
                  <p className="text-[10px] text-muted font-ui">Links</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
