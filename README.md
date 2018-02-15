# TestCafe POC

This is a proof of concept to see how well [TestCafe](https://devexpress.github.io/testcafe/)
can handle UI testing a Salesforce Org.

# Getting Started

## Create a Salesforce.com (SFDC) Developer Org

1. https://developer.salesforce.com/signup
	1. Your `username` does not need to be the same as your email. 
	1. Opt for the format `firstname.lastname@testobjective.dev`
1. Check your email
1. Verify your account

You will need your `username`, `password` and `orgID`.

Navigate to the following link after you login:

```
https://<your-sfdc-instance>.lightning.force.com/one/one.app#/setup/CompanyProfileInfo/home
```

And look for the field: `Salesforce.com Organization ID`


```
git clone <this repo>
npm install

# Setup test Org credentials
mv .env.sample .env
vim .env

npm test
```
