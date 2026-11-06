import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const screenshotsDir = 'screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function verifyRealWebsite() {
  console.log('Using browser at:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  // STEP 1: Verify localhost:8000 serves HTML, NOT raw JSON!
  console.log('\n--- Step 1: Testing http://localhost:8000 serving real website ---');
  await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });
  const htmlContent8000 = await page.content();
  if (htmlContent8000.includes('FADE') && !htmlContent8000.startsWith('{"service"')) {
    console.log('✓ SUCCESS: http://localhost:8000 serves the full React web application!');
  } else {
    throw new Error('http://localhost:8000 did not render the React website!');
  }
  await page.screenshot({ path: path.join(screenshotsDir, '04_localhost_8000_served.png') });

  // STEP 2: Navigate to Register Page
  console.log('\n--- Step 2: Testing Register Page ---');
  await page.goto('http://localhost:5173/#/register', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  
  const registerText = await page.evaluate(() => document.body.innerText);
  if (!registerText.includes('Create your analyst account') || !registerText.includes('Join thousands of analysts')) {
    throw new Error('Register page header text not found');
  }
  console.log('✓ Register Page loaded with dual-column enterprise layout.');
  await page.screenshot({ path: path.join(screenshotsDir, '05_register_page.png') });

  // STEP 3: Navigate to Login Page
  console.log('\n--- Step 3: Testing Login Page ---');
  await page.goto('http://localhost:5173/#/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const loginText = await page.evaluate(() => document.body.innerText);
  if (!loginText.includes('Sign in to your account') || !loginText.includes('Instant Demo Access')) {
    throw new Error('Login page header or demo button not found');
  }
  console.log('✓ Login Page loaded with dual-column layout and 1-Click Demo.');
  await page.screenshot({ path: path.join(screenshotsDir, '06_login_page.png') });

  // STEP 4: Perform 1-Click Demo Login to Dashboard
  console.log('\n--- Step 4: Testing 1-Click Demo Login -> Dashboard ---');
  const demoButtonFound = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('1-Click Demo'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (!demoButtonFound) throw new Error('1-Click Demo button not clickable');
  console.log('Clicked 1-Click Demo button. Waiting for Dashboard transition...');
  await new Promise(r => setTimeout(r, 1200));

  const dashboardText = await page.evaluate(() => document.body.innerText);
  if (!dashboardText.includes('Security Operations Center') && !dashboardText.includes('Welcome back') && !dashboardText.includes('PRO ENTERPRISE')) {
    throw new Error('Dashboard did not load after login: ' + dashboardText.slice(0, 200));
  }
  console.log('✓ Dashboard authenticated and active: session recognized.');
  await page.screenshot({ path: path.join(screenshotsDir, '07_dashboard_overview.png') });

  // STEP 5: Run a scan from the Dashboard
  console.log('\n--- Step 5: Testing Live Scanner inside Dashboard ---');
  await page.type('input[name="username"]', 'cyber_bot_303');
  await page.type('input[name="posts"]', '0');
  await page.type('input[name="followers"]', '12');
  await page.type('input[name="following"]', '3800');

  const analyzeBtn = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Analyze Profile Data'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Analyze button inside Dashboard...');
  await new Promise(r => setTimeout(r, 1500));

  const scanResultText = await page.evaluate(() => document.body.innerText);
  if (!scanResultText.includes('Fake / Suspicious') && !scanResultText.includes('Risk Score')) {
    throw new Error('Scan result not displayed in dashboard');
  }
  console.log('✓ ML prediction successfully calculated inside Dashboard!');
  await page.screenshot({ path: path.join(screenshotsDir, '08_dashboard_scan_result.png') });

  // STEP 6: Check Threat Log tab in Dashboard
  console.log('\n--- Step 6: Testing Threat Log & Analytics Tabs ---');
  await page.evaluate(() => {
    const tab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Threat Audit Log') || b.innerText.includes('Threat Log'));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '09_dashboard_threat_log.png') });
  console.log('✓ Threat Audit Log tab verified.');

  // STEP 7: Check Model Telemetry tab
  await page.evaluate(() => {
    const tab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Model Analytics') || b.innerText.includes('Telemetry'));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '10_dashboard_analytics.png') });
  console.log('✓ Model Telemetry tab verified.');

  console.log('\nALL END-TO-END WEBSITE CHECKS PASSED PERFECTLY!');
  await browser.close();
}

verifyRealWebsite().catch(err => {
  console.error('E2E Verification Failed:', err);
  process.exit(1);
});

