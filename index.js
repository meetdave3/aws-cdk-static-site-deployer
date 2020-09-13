#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const static_site_1 = require("./static-site");
/**
 * This stack relies on getting the domain name from CDK context.
 * Use 'cdk synth -c domain=mystaticsite.com -c subdomain=www'
 * Or add the following to cdk.json:
 * {
 *   "context": {
 *     "domain": "mystaticsite.com",
 *     "subdomain": "www"
 *   }
 * }
 **/
class MyStaticSiteStack extends cdk.Stack {
    constructor(parent, name, props) {
        super(parent, name, props);
        new static_site_1.StaticSite(this, 'StaticSite', {
            domainName: this.node.tryGetContext('domain'),
            siteSubDomain: this.node.tryGetContext('subdomain'),
        });
    }
}
const app = new cdk.App();
new MyStaticSiteStack(app, 'MyStaticSite', {
    env: {
        // Stack must be in us-east-1, because the ACM certificate for a
        // global CloudFront distribution must be requested in us-east-1.
        account: '252295580941',
        region: 'eu-central-1',
    },
});
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxQ0FBc0M7QUFDdEMsK0NBQTJDO0FBRTNDOzs7Ozs7Ozs7O0lBVUk7QUFDSixNQUFNLGlCQUFrQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3ZDLFlBQVksTUFBZSxFQUFFLElBQVksRUFBRSxLQUFxQjtRQUM5RCxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUzQixJQUFJLHdCQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNqQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1lBQzdDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUM7U0FDcEQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFO0lBQ3pDLEdBQUcsRUFBRTtRQUNILGdFQUFnRTtRQUNoRSxpRUFBaUU7UUFDakUsT0FBTyxFQUFFLGNBQWM7UUFDdkIsTUFBTSxFQUFFLGNBQWM7S0FDdkI7Q0FDRixDQUFDLENBQUM7QUFFSCxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgY2RrID0gcmVxdWlyZSgnQGF3cy1jZGsvY29yZScpO1xuaW1wb3J0IHsgU3RhdGljU2l0ZSB9IGZyb20gJy4vc3RhdGljLXNpdGUnO1xuXG4vKipcbiAqIFRoaXMgc3RhY2sgcmVsaWVzIG9uIGdldHRpbmcgdGhlIGRvbWFpbiBuYW1lIGZyb20gQ0RLIGNvbnRleHQuXG4gKiBVc2UgJ2NkayBzeW50aCAtYyBkb21haW49bXlzdGF0aWNzaXRlLmNvbSAtYyBzdWJkb21haW49d3d3J1xuICogT3IgYWRkIHRoZSBmb2xsb3dpbmcgdG8gY2RrLmpzb246XG4gKiB7XG4gKiAgIFwiY29udGV4dFwiOiB7XG4gKiAgICAgXCJkb21haW5cIjogXCJteXN0YXRpY3NpdGUuY29tXCIsXG4gKiAgICAgXCJzdWJkb21haW5cIjogXCJ3d3dcIlxuICogICB9XG4gKiB9XG4gKiovXG5jbGFzcyBNeVN0YXRpY1NpdGVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudDogY2RrLkFwcCwgbmFtZTogc3RyaW5nLCBwcm9wczogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihwYXJlbnQsIG5hbWUsIHByb3BzKTtcblxuICAgIG5ldyBTdGF0aWNTaXRlKHRoaXMsICdTdGF0aWNTaXRlJywge1xuICAgICAgZG9tYWluTmFtZTogdGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ2RvbWFpbicpLFxuICAgICAgc2l0ZVN1YkRvbWFpbjogdGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ3N1YmRvbWFpbicpLFxuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5cbm5ldyBNeVN0YXRpY1NpdGVTdGFjayhhcHAsICdNeVN0YXRpY1NpdGUnLCB7XG4gIGVudjoge1xuICAgIC8vIFN0YWNrIG11c3QgYmUgaW4gdXMtZWFzdC0xLCBiZWNhdXNlIHRoZSBBQ00gY2VydGlmaWNhdGUgZm9yIGFcbiAgICAvLyBnbG9iYWwgQ2xvdWRGcm9udCBkaXN0cmlidXRpb24gbXVzdCBiZSByZXF1ZXN0ZWQgaW4gdXMtZWFzdC0xLlxuICAgIGFjY291bnQ6ICcyNTIyOTU1ODA5NDEnLFxuICAgIHJlZ2lvbjogJ2V1LWNlbnRyYWwtMScsXG4gIH0sXG59KTtcblxuYXBwLnN5bnRoKCk7XG4iXX0=