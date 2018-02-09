'use strict';

const dotenv = require('dotenv').config();

const { Selector } = require('testcafe');

fixture('Test Org')
	.page('https://login.salesforce.com/')
	.beforeEach(async t => {
		if (!process.env.TEST_ORG_USERNAME)
			throw Error('TEST_ORG_USERNAME environment variable not set in .env file');
		if (!process.env.TEST_ORG_PASSWORD)
			throw Error('TEST_ORG_PASSWORD environment variable not set in .env file');

		await t
			.typeText('#username', process.env.TEST_ORG_USERNAME)
			.typeText('#password', process.env.TEST_ORG_PASSWORD)
			.click('#Login');
	});

test('Validate Logged In UI Experience', async t => {
	const location = await t.eval(() => window.location);
	const landingPages = {
		classic: ['/home/home.jsp', '/setup/forcecomHomepage.apexp'],
		lightning: ['/one/one.app']
	};

	let uiExperience = null;

	if (landingPages.lightning.indexOf(location.pathname) > -1) {
		uiExperience = 'lightning';
	}

	if (landingPages.classic.indexOf(location.pathname) > -1) {
		uiExperience = 'classic';
	}

	await t
		.expect(uiExperience)
		.notEql(null, 'UI Experience is ' + uiExperience + ' due to pathname: ' + location.pathname);
});
