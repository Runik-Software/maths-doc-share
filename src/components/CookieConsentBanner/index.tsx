'use client'

import { useEffect } from 'react'
import * as CookieConsent from "vanilla-cookieconsent";
import 'vanilla-cookieconsent/dist/cookieconsent.css'

declare global {
    interface Window {
        gtag: (...args: any[]) => void
    }
}

function updateGtagConsent() {
    const userPreferences = CookieConsent.getUserPreferences()
    const accepted = userPreferences.acceptedCategories

    window.gtag?.('consent', 'update', {
        analytics_storage: accepted.includes('analytics') ? 'granted' : 'denied',
        ad_storage: accepted.includes('marketing') ? 'granted' : 'denied',
        ad_user_data: accepted.includes('marketing') ? 'granted' : 'denied',
        ad_personalization: accepted.includes('marketing') ? 'granted' : 'denied',
    })
}

export function CookieConsentBanner() {
    useEffect(() => {
        CookieConsent.run({
            guiOptions: {
                consentModal: {
                    layout: 'box',
                    position: 'bottom right',
                    equalWeightButtons: true,
                },
                preferencesModal: {
                    layout: 'box',
                },
            },
            categories: {
                necessary: {
                    enabled: true,
                    readOnly: true,
                },
                analytics: {
                    enabled: false,
                    autoClear: {
                        cookies: [{ name: /^_ga/ }, { name: '_gid' }],
                    },
                },
                marketing: {
                    enabled: false,
                },
            },
            onFirstConsent: () => updateGtagConsent(),
            onConsent: () => updateGtagConsent(),
            onChange: () => updateGtagConsent(),
            language: {
                default: 'en',
                translations: {
                    en: {
                        consentModal: {
                            title: 'We use cookies',
                            description:
                                'We use cookies to analyse traffic and improve your experience. You can accept all, reject non-essential ones, or manage your preferences.',
                            acceptAllBtn: 'Accept all',
                            acceptNecessaryBtn: 'Reject all',
                            showPreferencesBtn: 'Manage preferences',
                        },
                        preferencesModal: {
                            title: 'Manage cookie preferences',
                            acceptAllBtn: 'Accept all',
                            acceptNecessaryBtn: 'Reject all',
                            savePreferencesBtn: 'Save preferences',
                            closeIconLabel: 'Close',
                            sections: [
                                {
                                    title: 'Strictly necessary',
                                    description: 'Required for the site to function properly.',
                                    linkedCategory: 'necessary',
                                },
                                {
                                    title: 'Analytics',
                                    description: 'Helps us understand how visitors use the site (Google Analytics).',
                                    linkedCategory: 'analytics',
                                },
                                {
                                    title: 'Marketing',
                                    description: 'Used for Google Ads conversion tracking.',
                                    linkedCategory: 'marketing',
                                },
                            ],
                        },
                    },
                },
            },
        })
    }, [])

    return null
}