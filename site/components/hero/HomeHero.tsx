"use client";
import { useState } from "react";
import type { HeroFlag } from "../../lib/hero-flags";
import { SplashGate } from "./SplashGate";
import { DeferredMount } from "./DeferredMount";
import { Atlas } from "../Atlas";

type AtlasEntry = Parameters<typeof Atlas>[0]["entries"];

export function HomeHero({ flags, atlasEntries }: { flags: HeroFlag[]; atlasEntries: AtlasEntry }) {
  const [entered, setEntered] = useState(false);
  return (
    <>
      <SplashGate flags={flags} onEntered={() => setEntered(true)} />
      <DeferredMount when={entered}>
        <Atlas entries={atlasEntries} />
      </DeferredMount>
    </>
  );
}
