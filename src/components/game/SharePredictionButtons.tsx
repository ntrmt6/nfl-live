"use client";

import { useState } from "react";
import { Download, Share2, Loader2, Check } from "lucide-react";

interface SharePredictionButtonsProps {
  away: string;
  home: string;
  awayFull: string;
  homeFull: string;
  awayProb: number;
  homeProb: number;
  winner: string;
  confidence: number;
  week: string | number;
  awayPPG?: string;
  homePPG?: string;
  awayDef?: string;
  homeDef?: string;
  awayWR?: string;
  homeWR?: string;
  gameUrl: string;
}

function buildCardUrl(p: SharePredictionButtonsProps): string {
  const params = new URLSearchParams({
    away: p.away,
    home: p.home,
    awayFull: p.awayFull,
    homeFull: p.homeFull,
    awayProb: p.awayProb.toFixed(0),
    homeProb: p.homeProb.toFixed(0),
    winner: p.winner,
    confidence: p.confidence.toFixed(0),
    week: String(p.week),
  });
  if (p.awayPPG) params.set("awayPPG", p.awayPPG);
  if (p.homePPG) params.set("homePPG", p.homePPG);
  if (p.awayDef) params.set("awayDef", p.awayDef);
  if (p.homeDef) params.set("homeDef", p.homeDef);
  if (p.awayWR)  params.set("awayWR",  p.awayWR);
  if (p.homeWR)  params.set("homeWR",  p.homeWR);
  return `/api/og/prediction?${params.toString()}`;
}

async function triggerDownload(imageUrl: string, filename: string) {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
}

type PlatformType = "url" | "clipboard" | "channel";

interface Platform {
  id: string;
  label: string;
  bg: string;
  type: PlatformType;
  channelUrl?: string;
  doneLabel?: string;
  icon: React.ReactNode;
}

const platforms: Platform[] = [
  {
    id: "x", label: "X / Twitter", bg: "#000000", type: "url",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  {
    id: "facebook", label: "Facebook", bg: "#1877F2", type: "url",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
  },
  {
    id: "whatsapp", label: "WhatsApp", bg: "#25D366", type: "url",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
  },
  {
    id: "telegram", label: "Telegram", bg: "#26A5E4", type: "url",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>,
  },
  {
    id: "threads", label: "Threads", bg: "#000000", type: "url",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.848 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.02-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.29 1.148-.065 2.272.027 3.33.274-.13-.707-.41-1.271-.842-1.676-.57-.53-1.43-.806-2.558-.823zm.18 8.087c.983-.056 1.725-.368 2.205-.928.54-.633.832-1.612.868-2.897a16.554 16.554 0 0 0-2.666-.158c-.915.053-1.671.28-2.196.657-.439.31-.661.726-.636 1.19.045.83.607 1.467 1.615 1.8.27.087.543.138.81.136z" /></svg>,
  },
  {
    id: "bluesky", label: "Bluesky", bg: "#0085FF", type: "url",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" /></svg>,
  },
  {
    id: "linkedin", label: "LinkedIn", bg: "#0A66C2", type: "url",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
  {
    id: "pinterest", label: "Pinterest", bg: "#E60023", type: "url",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>,
  },
  {
    id: "tumblr", label: "Tumblr", bg: "#35465C", type: "url",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.304 1.406z" /></svg>,
  },
  {
    id: "reddit", label: "Reddit", bg: "#FF4500", type: "url",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>,
  },
  {
    id: "instagram", label: "Instagram", bg: "#E1306C", type: "clipboard", doneLabel: "Copied!",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>,
  },
  {
    id: "tiktok", label: "TikTok", bg: "#010101", type: "clipboard", doneLabel: "Copied!",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>,
  },
  {
    id: "discord", label: "Discord", bg: "#5865F2", type: "clipboard", doneLabel: "Copied!",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.004.037.027.074.061.095a19.96 19.96 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.168 13.168 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>,
  },
  {
    id: "snapchat", label: "Snapchat", bg: "#FFFC00", type: "clipboard", doneLabel: "Copied!",
    icon: <svg viewBox="0 0 24 24" fill="black" width="16" height="16"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.062.027.135.05.221.073.306.085.659.189.991.298 1.417.47 1.59.937 1.59 1.26 0 .546-.33.997-1.08 1.258-.132.045-.272.08-.411.113-.156.038-.32.075-.467.138-.015.008-.033.017-.043.033-.025.039-.033.082-.015.151.05.196.151.428.246.647.14.333.295.698.295 1.066 0 1.016-.83 1.847-1.847 1.847-.322 0-.628-.085-.912-.252l-.096-.062-.047.107c-.187.43-.513 1.058-1.103 1.579-1.033.9-2.468 1.357-4.26 1.357-1.79 0-3.226-.46-4.26-1.357-.589-.521-.916-1.149-1.103-1.579l-.047-.107-.096.062c-.284.167-.59.252-.912.252-1.017 0-1.847-.83-1.847-1.847 0-.368.155-.733.295-1.066.094-.219.196-.451.247-.647.018-.07.01-.113-.016-.151-.01-.016-.027-.025-.043-.033-.148-.063-.311-.1-.467-.138-.139-.032-.279-.067-.411-.113-.75-.261-1.08-.712-1.08-1.258 0-.323.172-.79 1.59-1.26.332-.11.684-.213.99-.298.087-.023.16-.046.221-.073-.007-.165-.018-.33-.03-.51l-.004-.06c-.103-1.628-.23-3.654.3-4.847C7.858 1.07 11.216.793 12.206.793z" /></svg>,
  },
  {
    id: "youtube", label: "YouTube", bg: "#FF0000", type: "channel", channelUrl: "https://m.youtube.com/@nflpredictshub",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" /></svg>,
  },
];

export function SharePredictionButtons(props: SharePredictionButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const cardPath = buildCardUrl(props);
  const filename = `${props.away}-vs-${props.home}-week${props.week}-prediction.png`;
  const winnerFull = props.winner === props.away ? props.awayFull : props.homeFull;

  const fallbackText = `NFL Week ${props.week} AI Prediction\n${props.awayFull} vs ${props.homeFull}\nPredicted winner: ${winnerFull} (${props.confidence.toFixed(0)}% confidence)\n\nFull analysis:`;

  async function generateShareText(platform: string): Promise<string> {
    try {
      const res = await fetch("/api/generate-share-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          gameData: {
            awayFull: props.awayFull,
            homeFull: props.homeFull,
            winner: winnerFull,
            confidence: props.confidence,
            week: props.week,
            awayProb: props.awayProb,
            homeProb: props.homeProb,
            awayPPG: props.awayPPG,
            homePPG: props.homePPG,
            gameUrl: props.gameUrl,
          },
        }),
      });
      const data = await res.json();
      return data.text || fallbackText;
    } catch {
      return fallbackText;
    }
  }

  async function handlePlatform(id: string) {
    const platform = platforms.find((p) => p.id === id)!;
    setLoading(id);
    try {
      if (platform.type === "channel") {
        window.open(platform.channelUrl!, "_blank", "noopener,noreferrer");
        setDone(id);
        setTimeout(() => setDone(null), 3000);
        return;
      }

      const imageUrl = window.location.origin + cardPath;
      const [, shareText] = await Promise.all([
        triggerDownload(imageUrl, filename),
        generateShareText(id),
      ]);

      const u  = encodeURIComponent(props.gameUrl);
      const t  = encodeURIComponent(shareText);
      const ti = encodeURIComponent(`NFL Week ${props.week}: ${props.awayFull} vs ${props.homeFull} – AI Prediction`);

      if (platform.type === "clipboard") {
        await navigator.clipboard.writeText(`${shareText}\n\n${props.gameUrl}`);
      } else {
        const urls: Record<string, string> = {
          x:         `https://twitter.com/intent/tweet?text=${t}&url=${u}&via=Nflpredictsml`,
          facebook:  `https://www.facebook.com/sharer/sharer.php?u=${u}`,
          whatsapp:  `https://wa.me/?text=${t}%20${u}`,
          telegram:  `https://t.me/share/url?url=${u}&text=${t}`,
          threads:   `https://www.threads.net/intent/post?text=${t}%20${u}`,
          bluesky:   `https://bsky.app/intent/compose?text=${t}%20${u}`,
          linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
          pinterest: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}&media=${encodeURIComponent(imageUrl)}`,
          tumblr:    `https://www.tumblr.com/share/photo?source=${encodeURIComponent(imageUrl)}&caption=${t}&clickthru=${u}`,
          reddit:    `https://www.reddit.com/submit?url=${u}&title=${ti}`,
        };
        if (urls[id]) window.open(urls[id], "_blank", "noopener,noreferrer,width=600,height=500");
      }

      setDone(id);
      setTimeout(() => setDone(null), 3000);
    } catch {
      // silently ignore
    } finally {
      setLoading(null);
    }
  }

  async function handleDownload() {
    setLoading("download");
    try {
      await triggerDownload(window.location.origin + cardPath, filename);
      setDone("download");
      setTimeout(() => setDone(null), 3000);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Share2 className="h-4 w-4 text-[#FF6200]" />
        <h3 className="font-semibold text-sm">Share Prediction</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Select a platform — AI generates a unique post for each share.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {platforms.map((p) => {
          const isLoading = loading === p.id;
          const isDone    = done === p.id;
          const doneLabel = p.doneLabel ?? "Shared!";
          return (
            <button
              key={p.id}
              onClick={() => handlePlatform(p.id)}
              disabled={!!loading}
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all disabled:opacity-50 hover:opacity-90 active:scale-95"
              style={{
                background: p.bg,
                color: p.id === "snapchat" ? "#000" : "#fff",
              }}
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isDone ? <Check className="h-3.5 w-3.5" /> : p.icon}
              {isDone ? doneLabel : p.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleDownload}
        disabled={!!loading}
        className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg border border-[#FF6200]/40 bg-[#FF6200]/10 px-3 py-2.5 text-xs font-semibold text-[#FF6200] transition-all hover:bg-[#FF6200]/20 active:scale-95 disabled:opacity-50"
      >
        {loading === "download" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : done === "download" ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {done === "download" ? "Saved!" : "Download PNG Card"}
      </button>

      <p className="mt-3 text-[10px] text-muted-foreground/50 text-center">
        Clipboard platforms (Instagram, TikTok, Discord, Snapchat) copy post text automatically
      </p>
    </div>
  );
}
