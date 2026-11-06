import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Using browser at:', chromePath);

async function runBrowserTests() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('1. Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // 1. Check title and header
  const title = await page.title();
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('Page loaded successfully. Checking header text...');
  if (!pageText.includes('FADE') || !pageText.includes('Fake Account Detection')) {
    throw new Error('Header text not found on page');
  }
  console.log('✓ Header "FADE - Fake Account Detection Engine" verified.');

  // 2. Test empty input validation
  const analyzeButtonDisabled = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Analyze Profile Data'));
    return btn ? btn.disabled : null;
  });
  console.log('Empty form Analyze button disabled:', analyzeButtonDisabled);
  if (!analyzeButtonDisabled) {
    throw new Error('Analyze button should be disabled when username is empty');
  }
  console.log('✓ Empty username validation verified (button disabled).');

  // 3. Test Genuine Profile Submission
  console.log('\n2. Testing Genuine Profile submission...');
  await page.type('input[name="username"]', 'maya_travels');
  await page.type('input[name="posts"]', '120');
  await page.type('input[name="followers"]', '2500');
  await page.type('input[name="following"]', '350');
  await page.type('textarea[name="bio"]', 'Travel photographer & writer exploring national parks.');

  console.log('Clicking "Analyze Profile Data"...');
  const analyzeBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Analyze Profile Data'));
  });
  await analyzeBtn.click();

  // Verify loading state
  console.log('Checking for loading state...');
  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.innerText.includes('Analyzing Data...')) || document.querySelector('.animate-fadeIn');
  }, { timeout: 5000 });
  console.log('✓ Loading state verified.');

  // Wait for ResultsSection
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Analysis Results') && document.body.innerText.includes('for @maya_travels');
  }, { timeout: 10000 });

  const resultText = await page.evaluate(() => document.body.innerText);
  console.log('Result rendered! Checking risk score and verdict...');
  if (!resultText.includes('LOW RISK')) {
    throw new Error('Expected LOW RISK for genuine profile, got: ' + resultText.substring(0, 300));
  }
  console.log('✓ Genuine profile verdict verified: LOW RISK displayed.');

  // Take screenshot of genuine result
  os_mkdir_p('screenshots');
  await page.screenshot({ path: 'screenshots/01_genuine_result.png', fullPage: true });
  console.log('Saved screenshot: screenshots/01_genuine_result.png');

  // 4. Click "Analyze Another Profile"
  console.log('\n3. Clicking "Analyze Another Profile" button...');
  const resetBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Analyze Another Profile'));
  });
  await resetBtn.click();

  await page.waitForFunction(() => {
    return document.querySelector('input[name="username"]') !== null;
  });
  console.log('✓ Returned to UploadSection form.');

  // 5. Test Fake/Bot Profile Submission
  console.log('\n4. Testing Fake Profile submission...');
  await page.type('input[name="username"]', 'bot_spammer_9987');
  await page.type('input[name="posts"]', '0');
  await page.type('input[name="followers"]', '3');
  await page.type('input[name="following"]', '3200');

  // Toggle Private
  const privateBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Private');
  });
  if (privateBtn) await privateBtn.click();

  const analyzeBtn2 = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Analyze Profile Data'));
  });
  await analyzeBtn2.click();

  await page.waitForFunction(() => {
    return document.body.innerText.includes('Analysis Results') && document.body.innerText.includes('for @bot_spammer_9987');
  }, { timeout: 10000 });

  const fakeResultText = await page.evaluate(() => document.body.innerText);
  if (!fakeResultText.includes('HIGH RISK')) {
    throw new Error('Expected HIGH RISK for fake profile, got: ' + fakeResultText.substring(0, 300));
  }
  console.log('✓ Fake profile verdict verified: HIGH RISK displayed.');

  await page.screenshot({ path: 'screenshots/02_fake_result.png', fullPage: true });
  console.log('Saved screenshot: screenshots/02_fake_result.png');

  // 6. Test Backend Error / Connection Failure UI Display
  console.log('\n5. Testing Backend-Offline / Error handling display...');
  // Click reset
  const resetBtn2 = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Analyze Another Profile'));
  });
  await resetBtn2.click();
  await page.waitForSelector('input[name="username"]');

  // Inject a temporary override in window.fetch to simulate offline backend (503 / NetworkError)
  await page.evaluate(() => {
    window._originalFetch = window.fetch;
    window.fetch = async (...args) => {
      if (args[0].includes('/predict')) {
        throw new Error('Failed to fetch: Connection refused');
      }
      return window._originalFetch(...args);
    };
  });

  await page.type('input[name="username"]', 'test_offline_user');
  const analyzeBtn3 = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Analyze Profile Data'));
  });
  await analyzeBtn3.click();

  await page.waitForFunction(() => {
    return document.body.innerText.includes('Connection or Analysis Error') ||
           document.body.innerText.includes('Connection failed');
  }, { timeout: 5000 });

  const errorBannerText = await page.evaluate(() => {
    const banner = document.querySelector('.bg-red-50');
    return banner ? banner.innerText : null;
  });
  console.log('✓ Backend offline error banner verified:\n  ', errorBannerText ? errorBannerText.replace(/\n/g, ' ') : 'Found');

  await page.screenshot({ path: 'screenshots/03_error_banner.png', fullPage: true });
  console.log('Saved screenshot: screenshots/03_error_banner.png');

  await browser.close();
  console.log('\n========================================');
  console.log('ALL E2E BROWSER TESTS PASSED FLAWLESSLY!');
  console.log('========================================');
}

function os_mkdir_p(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

runBrowserTests().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
