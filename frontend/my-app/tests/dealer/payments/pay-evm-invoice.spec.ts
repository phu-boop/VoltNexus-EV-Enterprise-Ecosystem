import { test, expect } from '@playwright/test';

test.describe('Dealer Paying EVM Invoices', () => {

    test.beforeEach(async ({ page }) => {
        // TODO: Login as Dealer Manager
    });

    test('should view list of debt invoices from EVM', async ({ page }) => {
        // TODO: Logic to view invoices
    });

    test('should process payment for an EVM invoice', async ({ page }) => {
        // TODO: Logic to pay invoice
    });
});
