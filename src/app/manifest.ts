import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '人間スペック診断 | AIパーソナルスペック判定',
    short_name: 'スペック診断',
    description: '年収・学歴・外見・内面を科学的に総合スコア化する高精度AI診断アプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#06b6d4',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
