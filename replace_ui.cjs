const fs = require('fs');
const path = require('path');

const replacements = [
  // Typography
  { search: 'text-3xl font-black', replace: 'text-4xl font-extrabold tracking-tight' },
  { search: 'text-2xl font-black', replace: 'text-3xl font-extrabold tracking-tight' },
  { search: 'text-xl font-black', replace: 'text-2xl font-bold tracking-tight' },
  { search: 'text-gray-400', replace: 'text-slate-400' },
  { search: 'text-gray-500', replace: 'text-slate-500' },
  
  // Radii
  { search: 'rounded-[2rem]', replace: 'rounded-[32px]' },
  { search: 'rounded-2xl', replace: 'rounded-[24px]' },
  { search: 'rounded-xl', replace: 'rounded-[20px]' },
  
  // Shadows and blurs
  { search: 'backdrop-blur-xl', replace: 'backdrop-blur-2xl' },
  { search: 'shadow-lg shadow-primary-500/30', replace: 'shadow-[0_8px_30px_rgb(14,165,233,0.2)]' },
  { search: 'shadow-xl shadow-primary-500/30', replace: 'shadow-[0_8px_30px_rgb(14,165,233,0.3)]' },
  { search: 'shadow-sm', replace: 'shadow-md' },

  // Backgrounds
  { search: 'bg-white/50', replace: 'bg-white/60' },
  { search: 'dark:bg-[#0f0f0f]/50', replace: 'dark:bg-[#111111]/80' },
  { search: 'dark:bg-white/5', replace: 'dark:bg-white/[0.04]' },
  { search: 'dark:border-white/10', replace: 'dark:border-white/[0.08]' },
  { search: 'border-slate-200', replace: 'border-slate-200/80' },
];

const componentsDir = path.join('c:', 'Users', 'user', 'Desktop', 'restarant_tizim_react', 'src', 'admin', 'components');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updated = false;
      
      for (const {search, replace} of replacements) {
        if (content.includes(search)) {
          content = content.split(search).join(replace);
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated UI: ${fullPath}`);
      }
    }
  }
}

walk(componentsDir);

// Also run it on the admin pages to ensure consistency
const pagesDir = path.join('c:', 'Users', 'user', 'Desktop', 'restarant_tizim_react', 'src', 'admin', 'pages');
walk(pagesDir);

// And shared components
const sharedComponentsDir = path.join('c:', 'Users', 'user', 'Desktop', 'restarant_tizim_react', 'src', 'shared', 'components');
walk(sharedComponentsDir);

console.log('UI updates complete.');
