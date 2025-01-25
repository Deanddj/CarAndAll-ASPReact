import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

const urls = [
    'https://localhost:58332/',
    'https://localhost:58332/login',
    'https://localhost:58332/privacybeleid',3
    // Zet hier de URL's neer
];

(async () => {
    const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless'],
        autoSelectChrome: true,
    });

    const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
        port: chrome.port,
    };

    let aggregatedResults = {
        performance: [],
        accessibility: [],
        seo: [],
        'best-practices': [],
    };

    for (const targetUrl of urls) {
        console.log(`Running Lighthouse for ${targetUrl}`);

        try {
            const runnerResult = await lighthouse(targetUrl, options);
            const scores = runnerResult.lhr.categories;

            aggregatedResults.performance.push(scores.performance.score);
            aggregatedResults.accessibility.push(scores.accessibility.score);
            aggregatedResults.seo.push(scores.seo.score);
            aggregatedResults['best-practices'].push(scores['best-practices'].score);

        } catch (err) {
            console.error(`Error running Lighthouse for ${targetUrl}: ${err}`);
        }
    }

    const averageScores = {
        performance: (aggregatedResults.performance.reduce((a, b) => a + b, 0) / aggregatedResults.performance.length).toFixed(2),
        accessibility: (aggregatedResults.accessibility.reduce((a, b) => a + b, 0) / aggregatedResults.accessibility.length).toFixed(2),
        seo: (aggregatedResults.seo.reduce((a, b) => a + b, 0) / aggregatedResults.seo.length).toFixed(2),
        'best-practices': (aggregatedResults['best-practices'].reduce((a, b) => a + b, 0) / aggregatedResults['best-practices'].length).toFixed(2),
    };

    const reportHtml = `
    <html>
      <head>
        <title>Lighthouse Aggregated Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; border: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Lighthouse Aggregated Report</h1>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Average Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Performance</td>
              <td>${averageScores.performance}</td>
            </tr>
            <tr>
              <td>Accessibility</td>
              <td>${averageScores.accessibility}</td>
            </tr>
            <tr>
              <td>SEO</td>
              <td>${averageScores.seo}</td>
            </tr>
            <tr>
              <td>Best Practices</td>
              <td>${averageScores['best-practices']}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;

    const reportPath = path.join(cwd, 'samengestelde-lighthouse-report.html');
    fs.writeFileSync(reportPath, reportHtml);
    console.log(`Samengestelde Lighthouse report is klaar: ${reportPath}`);

    await chrome.kill();
})();