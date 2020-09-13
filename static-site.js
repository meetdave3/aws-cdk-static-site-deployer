#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudfront = require("@aws-cdk/aws-cloudfront");
const route53 = require("@aws-cdk/aws-route53");
const s3 = require("@aws-cdk/aws-s3");
const s3deploy = require("@aws-cdk/aws-s3-deployment");
const acm = require("@aws-cdk/aws-certificatemanager");
const cdk = require("@aws-cdk/core");
const targets = require("@aws-cdk/aws-route53-targets/lib");
const core_1 = require("@aws-cdk/core");
/**
 * Static site infrastructure, which deploys site content to an S3 bucket.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 */
class StaticSite extends core_1.Construct {
    constructor(parent, name, props) {
        super(parent, name);
        const zone = route53.HostedZone.fromLookup(this, 'Zone', {
            domainName: props.domainName,
        });
        const siteDomain = props.siteSubDomain + '.' + props.domainName;
        new cdk.CfnOutput(this, 'Site', { value: 'https://' + siteDomain });
        // Content bucket
        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
            bucketName: siteDomain,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: '404.html',
            publicReadAccess: true,
            // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
            // the new bucket, and it will remain in your account until manually deleted. By setting the policy to
            // DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        new cdk.CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });
        // TLS certificate
        const certificateArn = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
            domainName: siteDomain,
            hostedZone: zone,
            region: 'us-east-1',
        }).certificateArn;
        new cdk.CfnOutput(this, 'Certificate', { value: certificateArn });
        // CloudFront distribution that provides HTTPS
        const distribution = new cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
            aliasConfiguration: {
                acmCertRef: certificateArn,
                names: [siteDomain],
                sslMethod: cloudfront.SSLMethod.SNI,
                securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
            },
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: siteBucket,
                    },
                    behaviors: [{ isDefaultBehavior: true }],
                },
            ],
        });
        new cdk.CfnOutput(this, 'DistributionId', {
            value: distribution.distributionId,
        });
        // Route53 alias record for the CloudFront distribution
        new route53.ARecord(this, 'SiteAliasRecord', {
            recordName: siteDomain,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
            zone,
        });
        // Deploy site contents to S3 bucket
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [s3deploy.Source.asset('../out')],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*'],
        });
    }
}
exports.StaticSite = StaticSite;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljLXNpdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGF0aWMtc2l0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxzREFBdUQ7QUFDdkQsZ0RBQWlEO0FBQ2pELHNDQUF1QztBQUN2Qyx1REFBd0Q7QUFDeEQsdURBQXdEO0FBQ3hELHFDQUFzQztBQUN0Qyw0REFBNkQ7QUFDN0Qsd0NBQTBDO0FBTzFDOzs7OztHQUtHO0FBQ0gsTUFBYSxVQUFXLFNBQVEsZ0JBQVM7SUFDdkMsWUFBWSxNQUFpQixFQUFFLElBQVksRUFBRSxLQUFzQjtRQUNqRSxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXBCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDdkQsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO1NBQzdCLENBQUMsQ0FBQztRQUNILE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxhQUFhLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7UUFDaEUsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxHQUFHLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFcEUsaUJBQWlCO1FBQ2pCLE1BQU0sVUFBVSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ25ELFVBQVUsRUFBRSxVQUFVO1lBQ3RCLG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsVUFBVTtZQUNoQyxnQkFBZ0IsRUFBRSxJQUFJO1lBRXRCLGdHQUFnRztZQUNoRyxzR0FBc0c7WUFDdEcscUdBQXFHO1lBQ3JHLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87U0FDekMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFcEUsa0JBQWtCO1FBQ2xCLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxDQUFDLHVCQUF1QixDQUNwRCxJQUFJLEVBQ0osaUJBQWlCLEVBQ2pCO1lBQ0UsVUFBVSxFQUFFLFVBQVU7WUFDdEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsTUFBTSxFQUFFLFdBQVc7U0FDcEIsQ0FDRixDQUFDLGNBQWMsQ0FBQztRQUNqQixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBRWxFLDhDQUE4QztRQUM5QyxNQUFNLFlBQVksR0FBRyxJQUFJLFVBQVUsQ0FBQyx5QkFBeUIsQ0FDM0QsSUFBSSxFQUNKLGtCQUFrQixFQUNsQjtZQUNFLGtCQUFrQixFQUFFO2dCQUNsQixVQUFVLEVBQUUsY0FBYztnQkFDMUIsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDO2dCQUNuQixTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHO2dCQUNuQyxjQUFjLEVBQUUsVUFBVSxDQUFDLHNCQUFzQixDQUFDLGFBQWE7YUFDaEU7WUFDRCxhQUFhLEVBQUU7Z0JBQ2I7b0JBQ0UsY0FBYyxFQUFFO3dCQUNkLGNBQWMsRUFBRSxVQUFVO3FCQUMzQjtvQkFDRCxTQUFTLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDO2lCQUN6QzthQUNGO1NBQ0YsQ0FDRixDQUFDO1FBQ0YsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN4QyxLQUFLLEVBQUUsWUFBWSxDQUFDLGNBQWM7U0FDbkMsQ0FBQyxDQUFDO1FBRUgsdURBQXVEO1FBQ3ZELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDM0MsVUFBVSxFQUFFLFVBQVU7WUFDdEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUNwQyxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FDM0M7WUFDRCxJQUFJO1NBQ0wsQ0FBQyxDQUFDO1FBRUgsb0NBQW9DO1FBQ3BDLElBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUM1RCxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxQyxpQkFBaUIsRUFBRSxVQUFVO1lBQzdCLFlBQVk7WUFDWixpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQztTQUMxQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE5RUQsZ0NBOEVDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0IGNsb3VkZnJvbnQgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY2xvdWRmcm9udCcpO1xuaW1wb3J0IHJvdXRlNTMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3Mtcm91dGU1MycpO1xuaW1wb3J0IHMzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLXMzJyk7XG5pbXBvcnQgczNkZXBsb3kgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtczMtZGVwbG95bWVudCcpO1xuaW1wb3J0IGFjbSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInKTtcbmltcG9ydCBjZGsgPSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5pbXBvcnQgdGFyZ2V0cyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1yb3V0ZTUzLXRhcmdldHMvbGliJyk7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcblxuZXhwb3J0IGludGVyZmFjZSBTdGF0aWNTaXRlUHJvcHMge1xuICBkb21haW5OYW1lOiBzdHJpbmc7XG4gIHNpdGVTdWJEb21haW46IHN0cmluZztcbn1cblxuLyoqXG4gKiBTdGF0aWMgc2l0ZSBpbmZyYXN0cnVjdHVyZSwgd2hpY2ggZGVwbG95cyBzaXRlIGNvbnRlbnQgdG8gYW4gUzMgYnVja2V0LlxuICpcbiAqIFRoZSBzaXRlIHJlZGlyZWN0cyBmcm9tIEhUVFAgdG8gSFRUUFMsIHVzaW5nIGEgQ2xvdWRGcm9udCBkaXN0cmlidXRpb24sXG4gKiBSb3V0ZTUzIGFsaWFzIHJlY29yZCwgYW5kIEFDTSBjZXJ0aWZpY2F0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0YXRpY1NpdGUgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IENvbnN0cnVjdCwgbmFtZTogc3RyaW5nLCBwcm9wczogU3RhdGljU2l0ZVByb3BzKSB7XG4gICAgc3VwZXIocGFyZW50LCBuYW1lKTtcblxuICAgIGNvbnN0IHpvbmUgPSByb3V0ZTUzLkhvc3RlZFpvbmUuZnJvbUxvb2t1cCh0aGlzLCAnWm9uZScsIHtcbiAgICAgIGRvbWFpbk5hbWU6IHByb3BzLmRvbWFpbk5hbWUsXG4gICAgfSk7XG4gICAgY29uc3Qgc2l0ZURvbWFpbiA9IHByb3BzLnNpdGVTdWJEb21haW4gKyAnLicgKyBwcm9wcy5kb21haW5OYW1lO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdTaXRlJywgeyB2YWx1ZTogJ2h0dHBzOi8vJyArIHNpdGVEb21haW4gfSk7XG5cbiAgICAvLyBDb250ZW50IGJ1Y2tldFxuICAgIGNvbnN0IHNpdGVCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdTaXRlQnVja2V0Jywge1xuICAgICAgYnVja2V0TmFtZTogc2l0ZURvbWFpbixcbiAgICAgIHdlYnNpdGVJbmRleERvY3VtZW50OiAnaW5kZXguaHRtbCcsXG4gICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogJzQwNC5odG1sJyxcbiAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IHRydWUsXG5cbiAgICAgIC8vIFRoZSBkZWZhdWx0IHJlbW92YWwgcG9saWN5IGlzIFJFVEFJTiwgd2hpY2ggbWVhbnMgdGhhdCBjZGsgZGVzdHJveSB3aWxsIG5vdCBhdHRlbXB0IHRvIGRlbGV0ZVxuICAgICAgLy8gdGhlIG5ldyBidWNrZXQsIGFuZCBpdCB3aWxsIHJlbWFpbiBpbiB5b3VyIGFjY291bnQgdW50aWwgbWFudWFsbHkgZGVsZXRlZC4gQnkgc2V0dGluZyB0aGUgcG9saWN5IHRvXG4gICAgICAvLyBERVNUUk9ZLCBjZGsgZGVzdHJveSB3aWxsIGF0dGVtcHQgdG8gZGVsZXRlIHRoZSBidWNrZXQsIGJ1dCB3aWxsIGVycm9yIGlmIHRoZSBidWNrZXQgaXMgbm90IGVtcHR5LlxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSwgLy8gTk9UIHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uIGNvZGVcbiAgICB9KTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQnVja2V0JywgeyB2YWx1ZTogc2l0ZUJ1Y2tldC5idWNrZXROYW1lIH0pO1xuXG4gICAgLy8gVExTIGNlcnRpZmljYXRlXG4gICAgY29uc3QgY2VydGlmaWNhdGVBcm4gPSBuZXcgYWNtLkRuc1ZhbGlkYXRlZENlcnRpZmljYXRlKFxuICAgICAgdGhpcyxcbiAgICAgICdTaXRlQ2VydGlmaWNhdGUnLFxuICAgICAge1xuICAgICAgICBkb21haW5OYW1lOiBzaXRlRG9tYWluLFxuICAgICAgICBob3N0ZWRab25lOiB6b25lLFxuICAgICAgICByZWdpb246ICd1cy1lYXN0LTEnLCAvLyBDbG91ZGZyb250IG9ubHkgY2hlY2tzIHRoaXMgcmVnaW9uIGZvciBjZXJ0aWZpY2F0ZXMuXG4gICAgICB9XG4gICAgKS5jZXJ0aWZpY2F0ZUFybjtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ2VydGlmaWNhdGUnLCB7IHZhbHVlOiBjZXJ0aWZpY2F0ZUFybiB9KTtcblxuICAgIC8vIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIHRoYXQgcHJvdmlkZXMgSFRUUFNcbiAgICBjb25zdCBkaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5DbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgICdTaXRlRGlzdHJpYnV0aW9uJyxcbiAgICAgIHtcbiAgICAgICAgYWxpYXNDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgYWNtQ2VydFJlZjogY2VydGlmaWNhdGVBcm4sXG4gICAgICAgICAgbmFtZXM6IFtzaXRlRG9tYWluXSxcbiAgICAgICAgICBzc2xNZXRob2Q6IGNsb3VkZnJvbnQuU1NMTWV0aG9kLlNOSSxcbiAgICAgICAgICBzZWN1cml0eVBvbGljeTogY2xvdWRmcm9udC5TZWN1cml0eVBvbGljeVByb3RvY29sLlRMU19WMV8xXzIwMTYsXG4gICAgICAgIH0sXG4gICAgICAgIG9yaWdpbkNvbmZpZ3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzM09yaWdpblNvdXJjZToge1xuICAgICAgICAgICAgICBzM0J1Y2tldFNvdXJjZTogc2l0ZUJ1Y2tldCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiZWhhdmlvcnM6IFt7IGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlIH1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRGlzdHJpYnV0aW9uSWQnLCB7XG4gICAgICB2YWx1ZTogZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbklkLFxuICAgIH0pO1xuXG4gICAgLy8gUm91dGU1MyBhbGlhcyByZWNvcmQgZm9yIHRoZSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvblxuICAgIG5ldyByb3V0ZTUzLkFSZWNvcmQodGhpcywgJ1NpdGVBbGlhc1JlY29yZCcsIHtcbiAgICAgIHJlY29yZE5hbWU6IHNpdGVEb21haW4sXG4gICAgICB0YXJnZXQ6IHJvdXRlNTMuUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhcbiAgICAgICAgbmV3IHRhcmdldHMuQ2xvdWRGcm9udFRhcmdldChkaXN0cmlidXRpb24pXG4gICAgICApLFxuICAgICAgem9uZSxcbiAgICB9KTtcblxuICAgIC8vIERlcGxveSBzaXRlIGNvbnRlbnRzIHRvIFMzIGJ1Y2tldFxuICAgIG5ldyBzM2RlcGxveS5CdWNrZXREZXBsb3ltZW50KHRoaXMsICdEZXBsb3lXaXRoSW52YWxpZGF0aW9uJywge1xuICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5hc3NldCgnLi4vb3V0JyldLFxuICAgICAgZGVzdGluYXRpb25CdWNrZXQ6IHNpdGVCdWNrZXQsXG4gICAgICBkaXN0cmlidXRpb24sXG4gICAgICBkaXN0cmlidXRpb25QYXRoczogWycvKiddLFxuICAgIH0pO1xuICB9XG59XG4iXX0=