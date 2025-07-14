import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-providers';
import { execSync } from 'child_process';
import 'dotenv/config';
import fs from 'fs';

// 解析命令列參數
const args = process.argv.slice(2);
let customRef = null;

// 尋找 -b 參數
const bIndex = args.indexOf('-b');
if (bIndex !== -1 && bIndex + 1 < args.length) {
  customRef = args[bIndex + 1];
}

const REF =
  customRef ||
  process.env.SCHEMA_REF ||
  execSync('git rev-parse --abbrev-ref HEAD')
    .toString('utf8')
    .replace(/[\r\s]+$/, '');

const client = new S3Client({
  credentials: fromEnv(),
});

const main = async () => {
  try {
    console.info(`Requesting schema.json from ${REF}.`);

    const command = new GetObjectCommand({
      Bucket: 'ichef-cloud-schema',
      Key: `${REF}/all_cloud2_schema.json`,
    });
    const response = await client.send(command);
    const str = await response.Body.transformToString();
    fs.writeFileSync('schema.json', str);
  } catch {
    console.info(
      `Failed to download schema.json from ${REF}, trying to download from develop.`
    );

    try {
      const command = new GetObjectCommand({
        Bucket: 'ichef-cloud-schema',
        Key: 'develop/all_cloud2_schema.json',
      });
      const response = await client.send(command);
      const str = await response.Body.transformToString();
      fs.writeFileSync('schema.json', str);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
};

main();
