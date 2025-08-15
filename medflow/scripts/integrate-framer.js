#!/usr/bin/env node

/**
 * 🚀 Framer Website Integration Script
 * 
 * This script helps you quickly integrate your Framer website into MedFlow
 * Run it with: node scripts/integrate-framer.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CONFIG_FILE = path.join(__dirname, '../src/config/framerSites.ts');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function updateConfigFile(siteName, siteUrl, siteDescription) {
  try {
    let configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
    
    // Create the new site object
    const newSite = `  {
    id: '${siteName.toLowerCase().replace(/\s+/g, '-')}',
    name: '${siteName}',
    url: '${siteUrl}',
    description: '${siteDescription}'
  }`;
    
    // Find the sites array and add the new site
    const sitesArrayRegex = /export const framerSites: FramerSite\[\] = \[([\s\S]*?)\];/;
    const match = configContent.match(sitesArrayRegex);
    
    if (match) {
      const sitesArray = match[1];
      let newSitesArray;
      
      if (sitesArray.trim() === '') {
        // Empty array, add the first site
        newSitesArray = `\n${newSite}\n`;
      } else {
        // Add to existing array
        newSitesArray = sitesArray + ',\n' + newSite + '\n';
      }
      
      configContent = configContent.replace(sitesArrayRegex, `export const framerSites: FramerSite[] = [${newSitesArray}];`);
      
      // Update default site if this is the first one
      if (sitesArray.trim() === '') {
        const defaultSiteRegex = /export const defaultFramerSiteId = '([^']*)';/;
        const siteId = siteName.toLowerCase().replace(/\s+/g, '-');
        configContent = configContent.replace(defaultSiteRegex, `export const defaultFramerSiteId = '${siteId}';`);
      }
      
      fs.writeFileSync(CONFIG_FILE, configContent);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating config file:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n🌐 Welcome to the Framer Website Integration Script!');
  console.log('This will help you integrate your Framer website into MedFlow.\n');
  
  try {
    const siteName = await question('Enter your website name (e.g., "Main Website"): ');
    const siteUrl = await question('Enter your Framer website URL (e.g., https://your-site.framer.app): ');
    const siteDescription = await question('Enter a description (optional): ') || 'Your Framer website';
    
    console.log('\n📝 Summary:');
    console.log(`Name: ${siteName}`);
    console.log(`URL: ${siteUrl}`);
    console.log(`Description: ${siteDescription}`);
    
    const confirm = await question('\nProceed with integration? (y/N): ');
    
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      console.log('\n🔄 Updating configuration...');
      
      if (updateConfigFile(siteName, siteUrl, siteDescription)) {
        console.log('✅ Configuration updated successfully!');
        console.log('\n🎉 Your Framer website is now integrated!');
        console.log('📱 Visit /framer-websites in your app to see it.');
        console.log('\n🚀 Next steps:');
        console.log('1. Start your development server: npm run dev');
        console.log('2. Navigate to /framer-websites');
        console.log('3. Your website should appear automatically!');
      } else {
        console.log('❌ Failed to update configuration. Please check the file manually.');
      }
    } else {
      console.log('❌ Integration cancelled.');
    }
  } catch (error) {
    console.error('❌ An error occurred:', error.message);
  } finally {
    rl.close();
  }
}

// Check if config file exists
if (!fs.existsSync(CONFIG_FILE)) {
  console.error('❌ Configuration file not found. Please run this script from the project root.');
  process.exit(1);
}

main();
