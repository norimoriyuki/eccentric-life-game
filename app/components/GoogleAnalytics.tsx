'use client'

import Script from 'next/script'

// ゲームステータスの型定義
interface GameStatus {
  wealth: number
  goodness: number
  ability: number
  age: number
  allowance?: number
  passiveIncome?: number
  trauma?: number
}

// Google Analytics イベント設定の型定義
interface AnalyticsEventConfig {
  event_category: string
  event_label?: string
  value?: number
  [key: string]: string | number | undefined
}

// Google Analytics ページビュー設定の型定義
interface AnalyticsPageConfig {
  page_title?: string
  page_location?: string
  [key: string]: string | number | boolean | undefined
}

// グローバルなgtag関数の型定義
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: AnalyticsEventConfig | AnalyticsPageConfig
    ) => void
    dataLayer: unknown[]
  }
}

interface GoogleAnalyticsProps {
  measurementId: string
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}

// ゲーム特有のGoogle Analytics イベント追跡用のヘルパー関数
export const trackGameEvent = {
  // ゲーム開始
  gameStart: (playerName: string, initialStatus: GameStatus) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'game_start', {
        event_category: 'game_action',
        player_name: playerName,
        initial_wealth: initialStatus.wealth,
        initial_goodness: initialStatus.goodness,
        initial_ability: initialStatus.ability,
        initial_age: initialStatus.age,
      })
    }
  },

  // カード選択
  cardSelection: (turn: number, positiveCards: string[], negativeCards: string[]) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'card_selection', {
        event_category: 'game_action',
        turn: turn,
        positive_cards: positiveCards.join(','),
        negative_cards: negativeCards.join(','),
      })
    }
  },

  // ゲーム終了
  gameEnd: (reason: string, finalStatus: GameStatus, turn: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'game_end', {
        event_category: 'game_result',
        game_over_reason: reason,
        final_wealth: finalStatus.wealth,
        final_goodness: finalStatus.goodness,
        final_ability: finalStatus.ability,
        final_age: finalStatus.age,
        turns_survived: turn,
      })
    }
  },

  // 特定のカード効果
  cardEffect: (cardName: string, effectType: string, statusChange: Partial<GameStatus>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'card_effect', {
        event_category: 'game_mechanics',
        card_name: cardName,
        effect_type: effectType,
        wealth_change: statusChange.wealth || 0,
        goodness_change: statusChange.goodness || 0,
        ability_change: statusChange.ability || 0,
      })
    }
  },

  // ゲーム設定変更
  settingsChange: (setting: string, value: string | number | boolean) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'settings_change', {
        event_category: 'user_interaction',
        setting_name: setting,
        setting_value: String(value),
      })
    }
  }
}

// 一般的なGoogle Analytics イベント追跡用のヘルパー関数
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// ページビュー追跡用のヘルパー関数
export const trackPageView = (url: string, title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const config: AnalyticsPageConfig = {
      page_title: title,
      page_location: url,
    }
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', config)
  }
} 