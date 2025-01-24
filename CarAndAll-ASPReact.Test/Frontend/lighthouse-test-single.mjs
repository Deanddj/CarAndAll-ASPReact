import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

(async () => {
    const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless'],
        autoSelectChrome: true,
    });

    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
        port: chrome.port,
    };

    const targetUrl = 'https://localhost:58332'; // Zet hier de URL neer

    const runnerResult = await lighthouse(targetUrl, options);

    const reportHtml = runnerResult.report;

    const reportPath = path.join(cwd, 'lighthouse-report.html');

    fs.writeFileSync(reportPath, reportHtml);

    console.log(`Lighthouse report is klaar: ${reportPath}`);

    await chrome.kill();
})();