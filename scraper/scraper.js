import puppeteer from "puppeteer";
import chalk from "chalk";
import { sendEmail } from "./email.js";
import { sendDiscordMessage } from "./discord.js";
import { setScriptStatus } from "./constants.js";

const runningProcesses = {}
/**
 *
 * @param {Array} url
 * @param {Number} checkInterval
 * @param {Number} index
 * @param {Boolean} multi
 * @param {Object} channel
 */
export const checkStock = async (url, checkInterval = 60000, index = null, multi = false, channel = null) => {
  let stopProcess = false;
  setScriptStatus('running');
  let formatUrl = url === "default" ? websiteUrl : url;
  try {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    async function checkColor() {
      try {
        await page.goto(formatUrl, { waitUntil: "networkidle0" });

        const policyAcceptButton = await page.$("div.policy_acceptBtn__ZNU71");
        if (policyAcceptButton) {
          await policyAcceptButton.click();
          console.log(chalk.blue("Action: Clicked the policy accept button"));
        } else {
          console.log(chalk.magenta("Policy accept button not found, continuing..."));
        }

        const notifyElement = await page.$("div.index_container__tFuti");
        const buyElement = await page.$("div.index_usBtn__2KlEx");
        let productTitle

        try {
          productTitle = await page.evaluate(() => document.querySelector("h1.index_title___0OsZ").textContent);
        } catch (error) {
          console.log(chalk.red("Product title not found..."));
          productTitle = "Product title not found";
        }

        if (notifyElement || buyElement) {
          const buyColor = await page.evaluate((el) => el?.textContent, buyElement);
          const notifyColor = await page.evaluate((el) => el?.textContent, notifyElement);
          const isNotAvailable = notifyColor.includes("NOTIFY ME WHEN AVAILABLE");
          const isAvailable = buyColor.includes("ADD TO BAG");


          if (isAvailable) {
            console.log(
              chalk.green(`🚨 ALERT: ${productTitle} IS IN STOCK\n\n\n`)
            );
            await sendDiscordMessage(channel, `** ${productTitle} IS IN STOCK **`, 'Click on the links to view more details.', productTitle, url);

            // await sendEmail(`🚨 ALERT: ${productTitle} IS IN STOCK`, `🚨 ALERT: ${productTitle} IS IN STOCK`, true, url);
            stopProcess = true;
          }

          if (isNotAvailable) {
            console.log(`Time Check: ${new Date().toLocaleString()}`);
            console.log(
              chalk.yellow(`${productTitle} IS NOT AVAILABLE 🥲\n\n\n`)
            );
          }
        } else {
          console.log(chalk.red("Notify button not found"));
        }
      } catch (error) {
        console.error("Error during check:", error);
        await sendDiscordMessage(
          channel,
          "Error during stock check",
          `An error occurred while checking the stock for the URL: ${url}`,
          `Error details: ${error.message}`,
          url
        );
      }
    }

    // Initial check
    await checkColor();

    // Set up periodic checking
    const interval = setInterval(checkColor, checkInterval);

    if (!index) {
      runningProcesses[index] = { interval, browser };
    }

    // Handle cleanup
    process.on("SIGINT", async () => {
      clearInterval(interval);
      await browser.close();
      console.log("\nMonitoring stopped");
      setScriptStatus('idle');
      process.exit();
    });

    if (stopProcess && !multi) {
      clearInterval(interval);
      await browser.close();
      console.log("\nMonitoring stopped");
      setScriptStatus('idle');
      // Kill Process if script not started on discord
      !channel && process.exit();
    } else if (stopProcess && multi) {
      stopSingleProccess(index);
    }

  } catch (error) {
    console.error("Failed to initialize:", error);
  }
}

const stopSingleProccess = async (id) => {
  if (runningProcesses[id]) {
    clearInterval(runningProcesses[id].interval);
    await runningProcesses[id].browser.close();
    console.log(`\nMonitoring stopped for process ${id}`);
    delete runningProcesses[id];
    if (Object.keys(runningProcesses).length === 0) {
      setScriptStatus('idle');
    }
  } else {
    setScriptStatus('idle');
    console.log(`${chalk.red('[ERROR]')}: No process found with ID ${id}`);
  }
};

export const stopAllProcesses = async () => {
  for (const id in runningProcesses) {
    await stopSingleProccess(id);
  }
}