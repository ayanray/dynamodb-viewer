# DynamoDB Viewer
View DynamoDB Tables from this single page app. Connect to production or to a DynamoDB-local instance.

# Usage

Visit https://ayanray.github.io/dynamodb-viewer/

Use it! Submit the form fields and connect.

## Running dynamodb-local

When you run [dynamodb-local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html), it does not support HTTPS. So I made a small HTTPS proxy to route traffic to a dynamodb-local instance.

Read more about it here:
https://github.com/ayanray/dynamodb-https-proxy

When you use the [Online Viewer](https://ayanray.github.io/dynamodb-viewer/), just enter https://URL_TO_PROXY:PORT and it should allow you to connect to DynamoDB-Local.

# Contributing

To contribute, fork this repo, make your changes, and submit a PR. 

#### Useful References:

Bootstrap: Used to Layout the Page
- http://getbootstrap.com/css/
- http://getbootstrap.com/components/

Bootstrap Tables: Used to view Dynamo Data
- http://bootstrap-table.wenzhixin.net.cn/

DynamoDB: AWS SDK Used to talk to Dynamo
- http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html
