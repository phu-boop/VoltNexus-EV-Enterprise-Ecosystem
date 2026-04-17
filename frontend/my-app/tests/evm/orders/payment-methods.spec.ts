import { test, expect } from '@playwright/test';

test.describe('EVM Payment Methods Management', () => {

    test.beforeEach(async ({ page }) => {
        // TODO: Login as Admin
    });

    test('should view and configure available payment methods', async ({ page }) => {
        // TODO: View and toggle payment methods (Cash, VNPay, Transfer)
    });
});
