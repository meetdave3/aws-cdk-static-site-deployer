#!/usr/bin/env node
import cloudfront = require('@aws-cdk/aws-cloudfront');
import route53 = require('@aws-cdk/aws-route53');
import s3 = require('@aws-cdk/aws-s3');
import s3deploy = require('@aws-cdk/aws-s3-deployment');
import acm = require('@aws-cdk/aws-certificatemanager');
import cdk = require('@aws-cdk/core');
import targets = require('@aws-cdk/aws-route53-targets/lib');
import { Construct } from '@aws-cdk/core';

export interface StaticSiteProps {
  domainName: string;
  siteSubDomain: string;
}

/**
 * Static site infrastructure, which deploys site content to an S3 bucket.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 */
export class StaticSite extends Construct {
  constructor(parent: Construct, name: string, props: StaticSiteProps) {
    super(parent, name);

    const zone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: props.domainName,
    });
    const siteDomain = props.siteSubDomain + '.' + props.domainName;
    new cdk.CfnOutput(this, 'Site', { value: 'https://' + siteDomain });

    // Content bucket
    
    // Creates a s3 bucket based on the site domain name. 
    // In this case the bucket name would be = siteDomain name  
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: siteDomain,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
      publicReadAccess: true,

      // !!Importance starts!!
      // If you're using Nextjs export make sure your build is configured with trailing slash
      // Refer: https://nextjs.org/docs/api-reference/next.config.js/exportPathMap#adding-a-trailing-slash
      // !!Importance ends!!

      // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
      // the new bucket, and it will remain in your account until manually deleted. By setting the policy to
      // DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
      // Refer: https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_core.RemovalPolicy.html
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    new cdk.CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });

    // Get the TLS certificate!
    const certificateArn = new acm.DnsValidatedCertificate(
      this,
      'SiteCertificate',
      {
        domainName: siteDomain,
        hostedZone: zone,
        region: 'us-east-1', // Cloudfront only checks this region for certificates. It needs to be us-east-1 mandatorily
      }
    ).certificateArn;
    new cdk.CfnOutput(this, 'Certificate', { value: certificateArn });

    // CloudFront distribution that provides HTTPS
    // Redirect HTTP to HTTPS
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      'SiteDistribution',
      {
        defaultRootObject: '',
        aliasConfiguration: {
          acmCertRef: certificateArn, // Use the cert. we just generated
          names: [siteDomain],
          sslMethod: cloudfront.SSLMethod.SNI,
          securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
        },
        originConfigs: [
          {
            customOriginSource: {
              domainName: siteBucket.bucketWebsiteDomainName,
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
    });

    // Route53 alias record for the CloudFront distribution
    // Tell Route53 to point the siteDomain to the Cloudfront distribution
    // we just created.
    new route53.ARecord(this, 'SiteAliasRecord', {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
      zone,
    });

    // Deploy site contents to S3 bucket
    // Finally upload the static site contents to s3
    new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3deploy.Source.asset('../out')], // this is the build output directory of our static site
      // Nextjs static builds output to a /out directory. Change the directory if you're using something else
      contentType: '',
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });
  }
}
