import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should allow a user to log in and be redirected to the dashboard', async ({
    page,
  }) => {
    // 1. Navigate to the login page
    await page.goto('/login');

    // 2. Find form elements
    const emailInput = page.getByPlaceholder('super_admin@mydevelops.com');
    const passwordInput = page.getByPlaceholder('Enter your password');
    const loginButton = page.getByRole('button', { name: 'Login' });

    // 3. Verify elements are visible
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    // 4. Fill in the credentials
    // Note: In a real-world scenario, use environment variables for credentials.
    await emailInput.fill('super_admin@mydevelops.com');
    await passwordInput.fill('admin1234!');

    // 5. Click the login button
    await loginButton.click();

    // 6. Wait for navigation and assert the new URL
    // The tRPC call will happen, and on success, the router pushes to '/dashboard'.
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // 7. Optional: Check for an element on the dashboard page to confirm successful login
    const projectListHeading = page.getByText('Loading projects...'); // Or a more specific element
    await expect(projectListHeading).toBeVisible();
  });
});
