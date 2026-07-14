'use client'
import * as CookieConsent from "vanilla-cookieconsent";
import { Button } from "../ui/button";

export function CookieManagementLink() {
    return (
        <Button
            onClick={() => CookieConsent.showPreferences()}
            variant='link'
        >
            Manage cookies
        </Button>
    )
}