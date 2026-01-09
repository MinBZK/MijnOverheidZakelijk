#!/usr/bin/env node
/**
 * PDF Export script for Reveal.js presentations
 * Uses Playwright to export presentations to PDF
 * Automatically starts a local server
 */

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const PORT = 8181;
const BASE_URL = `http://localhost:${PORT}`;

// Simple static file server
function createServer(rootDir) {
    const mimeTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".mp4": "video/mp4",
    };

    return http.createServer((req, res) => {
        let filePath = path.join(rootDir, req.url.split("?")[0]);

        if (filePath.endsWith("/")) {
            filePath += "index.html";
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || "application/octet-stream";

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === "ENOENT") {
                    res.writeHead(404);
                    res.end("Not Found");
                } else {
                    res.writeHead(500);
                    res.end("Server Error");
                }
            } else {
                res.writeHead(200, { "Content-Type": contentType });
                res.end(content);
            }
        });
    });
}

async function exportPDF(page, presentationFile, outputPath) {
    const url = `${BASE_URL}/${presentationFile}?print-pdf`;
    console.log(`Loading: ${url}`);

    await page.goto(url, { waitUntil: "networkidle" });

    // Wait for Reveal.js to be ready
    await page.waitForFunction(() => {
        return typeof Reveal !== "undefined" && Reveal.isReady();
    });

    // Extra wait time for rendering (Mermaid, etc.)
    await page.waitForTimeout(2000);

    console.log(`Exporting to: ${outputPath}`);

    await page.pdf({
        path: outputPath,
        format: "A4",
        landscape: true,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    console.log(`PDF exported successfully: ${outputPath}`);
}

function findPresentations(dir) {
    const files = fs.readdirSync(dir);
    return files.filter(
        (f) =>
            f.endsWith(".html") &&
            f !== "index.html" &&
            !f.startsWith("_")
    );
}

async function showMenu(presentations) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("\nAvailable presentations:");
    console.log("  0) Export all presentations");
    presentations.forEach((p, i) => {
        const name = path.basename(p, ".html");
        console.log(`  ${i + 1}) ${name}`);
    });
    console.log("");

    return new Promise((resolve) => {
        rl.question("Choose an option (number): ", (answer) => {
            rl.close();
            const choice = parseInt(answer, 10);

            if (choice === 0) {
                resolve(presentations);
            } else if (choice > 0 && choice <= presentations.length) {
                resolve([presentations[choice - 1]]);
            } else {
                console.error("Invalid choice.");
                process.exit(1);
            }
        });
    });
}

async function main() {
    const args = process.argv.slice(2);
    const rootDir = process.cwd();

    // Find available presentations
    const allPresentations = findPresentations(rootDir);
    if (allPresentations.length === 0) {
        console.error("No presentations found.");
        process.exit(1);
    }

    let presentations = [];

    if (args.length === 0) {
        // Interactive menu
        presentations = await showMenu(allPresentations);
    } else if (args[0] === "--all") {
        // Export all
        presentations = allPresentations;
        console.log(`Found presentations: ${presentations.join(", ")}`);
    } else {
        // Specific presentation(s)
        presentations = args.map((arg) => {
            if (!arg.endsWith(".html")) {
                return `${arg}.html`;
            }
            return arg;
        });
    }

    // Start server
    const server = createServer(rootDir);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`Server started at ${BASE_URL}`);

    // Create output directory
    const outputDir = path.join(rootDir, "pdf");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Start browser (reuse for all presentations)
    const browser = await chromium.launch();
    const page = await browser.newPage();

    for (const presentation of presentations) {
        const basename = path.basename(presentation, ".html");
        const outputPath = path.join(outputDir, `${basename}.pdf`);

        try {
            await exportPDF(page, presentation, outputPath);
        } catch (error) {
            console.error(`Error exporting ${presentation}:`, error.message);
        }
    }

    // Cleanup
    await browser.close();
    server.close();
    console.log("\nDone!");
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
