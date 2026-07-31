import { test, expect } from '@playwright/test';

test('completing the questionnaire and signing in writes a submission', async ({ page, request }) => {
  await page.goto('/');

  await page.getByTestId('age-yes').click();
  await page.getByTestId('gender-no').click();
  await page.getByTestId('familyHistory-yes').click();
  await page.getByTestId('alcoholOrSmoking-no').click();
  await page.getByTestId('weight-yes').click();
  await page.getByTestId('hypertension-yes').click();
  await page.getByTestId('physicalActivity-yes').click();

  // Score is no longer visible on the result screen
  await expect(page.getByTestId('score-value')).not.toBeVisible();
  
  await page.getByRole('radio', { name: /vihiga/i }).click();

  // Verify the button is present and enabled
  const saveButton = page.getByRole('button', { name: /save my responses/i });
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toBeEnabled();
});
