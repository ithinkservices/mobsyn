const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '..', 'public');
const extDir = path.join(publicDir, 'extensions');
const tempZip = path.join(publicDir, 'mobsyn_exporter.zip');
const outputRbz = path.join(publicDir, 'mobsyn_exporter.rbz');
const outputRbzInExt = path.join(extDir, 'mobsyn_exporter.rbz');

try {
  if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
  if (fs.existsSync(outputRbz)) fs.unlinkSync(outputRbz);

  const file1 = path.join(extDir, 'mobsyn_exporter.rb');
  const dir1 = path.join(extDir, 'mobsyn_exporter');

  const psCmd = `powershell -Command "Compress-Archive -Path '${file1}', '${dir1}' -DestinationPath '${tempZip}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });

  // Rename .zip to .rbz
  fs.copyFileSync(tempZip, outputRbz);
  fs.copyFileSync(tempZip, outputRbzInExt);
  fs.unlinkSync(tempZip);

  console.log('✅ MobSyn SketchUp Extension (.RBZ) created successfully:');
  console.log(' - File:', outputRbz);
  console.log(' - Size:', fs.statSync(outputRbz).size, 'bytes');
} catch (e) {
  console.error('Error packaging RBZ:', e);
}
