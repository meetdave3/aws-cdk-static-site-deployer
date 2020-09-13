# AWS CDK Stack to deploy static sites

1. Copy paste this folder to source code directory. 
2. If it is a Next.js project, be ready with your build output and make sure the "/out" directory is there alongside. 
3. If it is some other framework / stack, make sure you are ready with the build folder. If the build folder is "dist", head over to static-site.ts and change the build folder name from './out' to './dist'.
3. Fetch the AWS account ID and paste it inside index.ts file. also make sure the region is you expect it to be.
4. Next, fetch the deployment access key and secret key for your `awsprofilename`, Make sure the keys have required "permissions". To configure them locally, follow - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html
5. Note: You will most probably end up using the same keys for setting up your deployments Github/Gitlab CI :)
5. Make sure you have cdk aws cli, if not, head over to your terminal and run `npm i -g aws-cdk`
6. Once done, cd inside your cdk folder. Run `yarn build`, this will transpile your code into js.
6. You're all set! - Run `cdk bootstrap aws://my_aws_account_id/eu-central-1 -c domain=mydomain.com -c subdomain=subdomain_name --profile awsprofilename`, should be done under a minute.
7. Finally run, `cdk deploy -c domain=mydomain.com -c subdomain=subdomain_name --profile awsprofilename`, usually takes about 10 minutes. But guess what? It does everything for you! :D
8. Once it succeeds. Headover to your favourite browser and go on to subdomain_name.mydomain.com to watch your code floating in the world wide hyperspace.

Caveats: cdk deployments can fail mainly due to one problem, Mostly when the keys do not have suitable permissions. When it fails, you'll be presented with what additional permission it needs. You can ask your administrator to grant them.