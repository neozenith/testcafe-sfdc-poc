'use strict';

require('dotenv').config();

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

		const location = await t.eval(() => window.location);

		// WIP Hack to coerce Lightning Experience to continue loading.
		// if (location.pathname === '/one/one.app') {
		//   await t
		//     .setPageLoadTimeout(0)
		//     .navigateTo(location.origin + '/one/one.app#/home')
		//   t.ctx.uiExperience = 'lightning';
		// }

		const classicHeader = await Selector('#phHeader');
		const lightningHeader = await Selector('#oneHeader');

		if (lightningHeader.exists) {
			t.ctx.uiExperience = 'lightning';
		}

		if (classicHeader.exists) {
			t.ctx.uiExperience = 'classic';
		}

		await t.expect(t.ctx.uiExperience).ok('Unknown UI Experience or failed to login');
		console.log(t.ctx);
	});

test.only('UI has Setup Link', async t => {
	let setupLinkSelector;
	switch (t.ctx.uiExperience) {
		case 'classic':
			setupLinkSelector = await Selector('#setupLink');
			break;
		case 'lightning':
			setupLinkSelector = await Selector('div.setupGear');
			break;
	}

	const setupLinkElement = await setupLinkSelector.with({ visibilityCheck: true })();
	await t.expect(setupLinkSelector.exists).ok();
});

test('Validate Org ID', async t => {
	if (!process.env.TEST_ORG_ID)
		throw Error('TEST_ORG_ID environment variable not set in .env file');

	const location = await t.eval(() => window.location);
	let companyInfoLink;
	let orgIdSelector;

	switch (t.ctx.uiExperience) {
		case 'lightning':
			companyInfoLink = location.origin + '/one/one.app#/setup/CompanyProfileInfo/home';
			await t.navigateTo(companyInfoLink);
			break;

		case 'classic':
			companyInfoLink = location.origin + '/setup/forcecomHomepage.apexp';
			await t
				.navigateTo(companyInfoLink)
				.click('#CompanyProfile_font')
				.click('#CompanyProfileInfo_font');

			break;
	}

	orgIdSelector = await Selector('table.detailList')
		.find('td.dataCol')
		.withText(process.env.TEST_ORG_ID);

	await t.expect(orgIdSelector.exists).ok();
	await t.expect(orgIdSelector.innerText).eql(process.env.TEST_ORG_ID);
});
